import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/supabase_service.dart';
import '../../../../shared/models/lesson_model.dart';

// ── Providers ──────────────────────────────────────────────────────────────

/// Fetches a single lesson row from public.lessons by ID.
final lessonByIdProvider = FutureProvider.family<LessonModel?, String>((ref, lessonId) async {
  final data = await SupabaseService.client
      .from('lessons')
      .select()
      .eq('id', lessonId)
      .maybeSingle();
  if (data == null) return null;
  return LessonModel.fromJson(data as Map<String, dynamic>);
});

/// Resolves a Supabase Storage signed URL (2 h) from the lesson's video_url path.
final lessonVideoUrlProvider = FutureProvider.family<String?, String>((ref, lessonId) async {
  final lesson = await ref.read(lessonByIdProvider(lessonId).future);
  final path = lesson?.videoUrl;
  if (path == null || path.isEmpty) return null;
  if (path.startsWith('http')) return path;
  return SupabaseService.client.storage
      .from(ApiConstants.lessonVideosBucket)
      .createSignedUrl(path, 7200);
});

// ── Screen ──────────────────────────────────────────────────────────────────

class VideoLessonScreen extends ConsumerStatefulWidget {
  final String lessonId;
  const VideoLessonScreen({super.key, required this.lessonId});

  @override
  ConsumerState<VideoLessonScreen> createState() => _VideoLessonScreenState();
}

class _VideoLessonScreenState extends ConsumerState<VideoLessonScreen> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _initStarted = false; // guards against concurrent init calls
  bool _isVideoError = false;
  String? _videoErrorMsg;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    // If provider already resolved when widget mounts, init immediately
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final url = ref.read(lessonVideoUrlProvider(widget.lessonId)).valueOrNull;
      if (url != null) _initPlayer(url);
    });
  }

  Future<void> _initPlayer(String url) async {
    if (_initStarted) return; // Prevent concurrent / duplicate init
    _initStarted = true;
    try {
      final ctrl = VideoPlayerController.networkUrl(Uri.parse(url));
      await ctrl.initialize();
      if (!mounted) {
        ctrl.dispose();
        return;
      }
      final chewie = ChewieController(
        videoPlayerController: ctrl,
        autoPlay: true,
        looping: false,
        aspectRatio: ctrl.value.aspectRatio > 0 ? ctrl.value.aspectRatio : 16 / 9,
        allowFullScreen: true,
        allowMuting: true,
        showControlsOnInitialize: true,
        errorBuilder: (ctx, msg) => Center(
          child: Text(msg, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        ),
      );
      setState(() {
        _videoController = ctrl;
        _chewieController = chewie;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isVideoError = true;
          _videoErrorMsg = e.toString();
        });
      }
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    _chewieController?.dispose();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    super.dispose();
  }

  Widget _buildVideoArea() {
    // Error state
    if (_isVideoError) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.white38, size: 48),
            const SizedBox(height: 12),
            const Text('Failed to load video',
                style: TextStyle(color: Colors.white54, fontSize: 14)),
            if (_videoErrorMsg != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                child: Text(_videoErrorMsg!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white24, fontSize: 11)),
              ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                setState(() {
                  _isVideoError = false;
                  _videoErrorMsg = null;
                  _initStarted = false;
                  _videoController = null;
                  _chewieController = null;
                });
                final url = ref.read(lessonVideoUrlProvider(widget.lessonId)).valueOrNull;
                if (url != null) _initPlayer(url);
              },
              child: const Text('Retry', style: TextStyle(color: AppColors.primary)),
            ),
          ],
        ),
      );
    }

    // Player ready
    if (_chewieController != null) {
      return Chewie(controller: _chewieController!);
    }

    // Watch URL provider — init player when URL resolves
    final videoUrlAsync = ref.watch(lessonVideoUrlProvider(widget.lessonId));
    return videoUrlAsync.when(
      data: (url) {
        if (url == null) {
          return const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.videocam_off_rounded, color: Colors.white24, size: 52),
                SizedBox(height: 12),
                Text('Video not available yet',
                    style: TextStyle(color: Colors.white38, fontSize: 14)),
                SizedBox(height: 4),
                Text('Re-upload from admin panel',
                    style: TextStyle(color: Colors.white24, fontSize: 12)),
              ],
            ),
          );
        }
        // URL ready but init triggered via initState/ref.listen — just show spinner
        return const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        );
      },
      loading: () =>
          const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      error: (err, _) => Center(
        child: Text('Error: $err',
            style: const TextStyle(color: Colors.white54, fontSize: 12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lessonAsync = ref.watch(lessonByIdProvider(widget.lessonId));

    // If URL resolves AFTER first build, listen fires and inits player
    ref.listen<AsyncValue<String?>>(
        lessonVideoUrlProvider(widget.lessonId), (prev, next) {
      next.whenData((url) {
        if (url != null && _videoController == null && !_isVideoError) {
          _initPlayer(url);
        }
      });
    });

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (context.canPop()) { context.pop(); } else { context.go('/home'); }
      },
      child: Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white, size: 20),
          onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
        ),
        title: lessonAsync.when(
          data: (l) => Text(
            l?.title ?? 'Lesson',
            style: const TextStyle(
                color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
            overflow: TextOverflow.ellipsis,
          ),
          loading: () => const SizedBox.shrink(),
          error: (_, __) =>
              const Text('Lesson', style: TextStyle(color: Colors.white)),
        ),
      ),
      body: Column(
        children: [
          // ── 16:9 Video area ───────────────────────────────────────────
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              color: Colors.black,
              child: _buildVideoArea(),
            ),
          ),

          // ── Lesson info ───────────────────────────────────────────────
          Expanded(
            child: Container(
              color: AppColors.background,
              child: lessonAsync.when(
                loading: () => const Center(
                    child: CircularProgressIndicator(color: AppColors.primary)),
                error: (err, _) =>
                    Center(child: Text('Error: $err')),
                data: (lesson) {
                  if (lesson == null) {
                    return const Center(child: Text('Lesson not found'));
                  }
                  return SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lesson.title,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.access_time_rounded,
                                size: 15, color: AppColors.textTertiary),
                            const SizedBox(width: 4),
                            Text(
                              '${lesson.durationSeconds ~/ 60} min',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: AppColors.textTertiary),
                            ),
                          ],
                        ),
                        if (lesson.description != null &&
                            lesson.description!.isNotEmpty) ...[
                          const SizedBox(height: 20),
                          Text(
                            'About this lesson',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            lesson.description!,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: AppColors.textTertiary,
                                  height: 1.6,
                                ),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    )); // PopScope + Scaffold
  }
}
