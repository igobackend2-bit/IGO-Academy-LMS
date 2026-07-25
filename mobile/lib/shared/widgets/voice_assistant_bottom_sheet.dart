import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:permission_handler/permission_handler.dart';
import '../../core/router/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class VoiceAssistantBottomSheet extends StatefulWidget {
  const VoiceAssistantBottomSheet({super.key, this.onSearchCommand});

  final Function(String query)? onSearchCommand;

  static void show(BuildContext context, {Function(String query)? onSearchCommand}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => VoiceAssistantBottomSheet(onSearchCommand: onSearchCommand),
    );
  }

  @override
  State<VoiceAssistantBottomSheet> createState() => _VoiceAssistantBottomSheetState();
}

class _VoiceAssistantBottomSheetState extends State<VoiceAssistantBottomSheet> with SingleTickerProviderStateMixin {
  late final stt.SpeechToText _speech;
  late final AnimationController _pulseController;
  
  bool _isListening = false;
  bool _speechEnabled = false;
  String _wordsSpoken = "";
  String _statusMessage = "Initializing Voice Assistant...";

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    
    _initSpeech();
  }

  @override
  void dispose() {
    _speech.stop();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _initSpeech() async {
    try {
      final status = await Permission.microphone.status;
      
      if (status.isPermanentlyDenied) {
        setState(() {
          _statusMessage = "Microphone permission permanently denied.\nTap the mic icon to open Settings.";
        });
        return;
      }

      if (status.isDenied) {
        final requestStatus = await Permission.microphone.request();
        if (!requestStatus.isGranted) {
          setState(() {
            _statusMessage = "Microphone permission denied.\nTap the mic icon to open Settings.";
          });
          return;
        }
      }

      final speechAvailable = await _speech.initialize(
        onStatus: (status) {
          debugPrint('Speech status: $status');
          if (status == 'done' || status == 'notListening') {
            setState(() => _isListening = false);
            _processVoiceCommand(_wordsSpoken);
          }
        },
        onError: (errorNotification) {
          debugPrint('Speech error: $errorNotification');
          setState(() {
            _statusMessage = "Speech recognition error: ${errorNotification.errorMsg}";
            _isListening = false;
          });
        },
      );

      setState(() {
        _speechEnabled = speechAvailable;
        if (speechAvailable) {
          _statusMessage = "Tap the mic and speak";
          _startListening();
        } else {
          _statusMessage = "Speech engine not available on this device";
        }
      });
    } catch (e) {
      setState(() {
        _statusMessage = "Error initializing speech engine";
      });
    }
  }

  void _startListening() async {
    final status = await Permission.microphone.status;
    if (!status.isGranted) {
      openAppSettings();
      return;
    }
    if (!_speechEnabled) return;
    
    setState(() {
      _wordsSpoken = "";
      _statusMessage = "Listening...";
      _isListening = true;
    });

    await _speech.listen(
      onResult: (result) {
        setState(() {
          _wordsSpoken = result.recognizedWords;
          if (result.finalResult) {
            _isListening = false;
            _processVoiceCommand(result.recognizedWords);
          }
        });
      },
    );
  }

  void _stopListening() async {
    await _speech.stop();
    setState(() => _isListening = false);
  }

  void _processVoiceCommand(String rawCommand) {
    final command = rawCommand.toLowerCase().trim();
    if (command.isEmpty) return;

    // Command patterns
    if (command.contains("open profile") || command == "profile") {
      context.go(RouteNames.profile);
      Navigator.pop(context);
    } else if (command.contains("go home") || command == "home" || command.contains("open home") || command == "dashboard") {
      context.go(RouteNames.home);
      Navigator.pop(context);
    } else if (command.contains("open settings") || command == "settings" || command == "preferences") {
      context.push(RouteNames.settings);
      Navigator.pop(context);
    } else if (command.contains("open certificate") || command == "certificates") {
      context.push(RouteNames.certificates);
      Navigator.pop(context);
    } else if (command.startsWith("search ")) {
      final query = rawCommand.substring(7);
      _executeSearch(query);
    } else {
      // Default to search
      _executeSearch(rawCommand);
    }
  }

  void _executeSearch(String query) {
    if (widget.onSearchCommand != null) {
      widget.onSearchCommand!(query);
    } else {
      context.go(RouteNames.search);
      // Wait a brief moment for the page change to settle
      Future.delayed(const Duration(milliseconds: 300), () {
        // Send notification/search via state
      });
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 48,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Voice Assistant',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _statusMessage,
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 32),
          
          // Main Listening Visualizer
          Center(
            child: GestureDetector(
              onTap: () {
                if (_isListening) {
                  _stopListening();
                } else {
                  _startListening();
                }
              },
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  final scale = 1.0 + (_isListening ? _pulseController.value * 0.25 : 0.0);
                  return Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isListening
                          ? AppColors.primary.withValues(alpha: 0.15)
                          : Colors.grey.shade100,
                    ),
                    alignment: Alignment.center,
                    child: Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isListening ? AppColors.primary : Colors.grey.shade300,
                          boxShadow: _isListening
                              ? [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.4),
                                    blurRadius: 15,
                                    spreadRadius: 2,
                                  )
                                ]
                              : [],
                        ),
                        child: Icon(
                          _isListening ? Icons.mic : Icons.mic_none,
                          color: _isListening ? Colors.white : Colors.grey.shade600,
                          size: 32,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          
          if (_wordsSpoken.isNotEmpty) ...[
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: Text(
                _wordsSpoken,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ],
          
          const SizedBox(height: 32),
          const Divider(),
          const SizedBox(height: 16),
          
          // Voice Commands Help / Simulator
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Try saying:',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _CommandChip(
                label: '"Open Profile"',
                onTap: () => _processVoiceCommand("open profile"),
              ),
              _CommandChip(
                label: '"Go Home"',
                onTap: () => _processVoiceCommand("go home"),
              ),
              _CommandChip(
                label: '"Search Flutter"',
                onTap: () => _processVoiceCommand("search Flutter"),
              ),
              _CommandChip(
                label: '"Certificates"',
                onTap: () => _processVoiceCommand("certificates"),
              ),
              _CommandChip(
                label: '"Preferences"',
                onTap: () => _processVoiceCommand("preferences"),
              ),
            ],
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

class _CommandChip extends StatelessWidget {
  const _CommandChip({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      label: Text(
        label,
        style: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
        ),
      ),
      backgroundColor: AppColors.primary.withValues(alpha: 0.08),
      side: BorderSide.none,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      onPressed: onTap,
    );
  }
}
