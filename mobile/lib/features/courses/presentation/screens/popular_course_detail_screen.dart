import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/widgets/app_loading.dart';

class PopularCourseDetailScreen extends StatefulWidget {
  final String id;

  const PopularCourseDetailScreen({super.key, required this.id});

  @override
  State<PopularCourseDetailScreen> createState() => _PopularCourseDetailScreenState();
}

class _PopularCourseDetailScreenState extends State<PopularCourseDetailScreen> {
  late VideoPlayerController _videoPlayerController;
  ChewieController? _chewieController;
  bool _isVideoError = false;
  bool _showSubtitles = true;

  final List<Map<String, dynamic>> _popularCourses = [
    {
      'categoryId': 'hydroponics',
      'title': 'Hydroponics Training',
      'video': 'assets/popular_courses/video1.mp4',
      'duration': '12h 30m',
      'level': 'Beginner',
      'description': 'Master the art of growing plants without soil using nutrient-rich water. This course covers everything from setting up your first system to harvesting fresh produce.',
      'points': [
        'Understand different hydroponic systems',
        'Learn nutrient management',
        'Setup lighting and climate control',
      ]
    },
    {
      'categoryId': 'aquaculture',
      'title': 'Aquaculture & Fish Farming',
      'video': 'assets/popular_courses/video2.mp4',
      'duration': '15h 00m',
      'level': 'Intermediate',
      'description': 'Dive into modern fish farming techniques. Learn how to maintain water quality, manage feeding, and run a profitable aquaculture business.',
      'points': [
        'Water quality management',
        'Fish health and feeding',
        'Commercial scale operations',
      ]
    },
    {
      'categoryId': 'agri_entrepreneur',
      'title': 'Agri Entrepreneur Masterclass',
      'video': 'assets/popular_courses/video3.mp4',
      'duration': '8h 45m',
      'level': 'All Levels',
      'description': 'Turn your agricultural skills into a thriving business. Learn marketing, supply chain management, and business planning tailored for agriculture.',
      'points': [
        'Business planning & strategy',
        'Market research and sales',
        'Supply chain logistics',
      ]
    },
    {
      'categoryId': 'drip_irrigation',
      'title': 'Drip Irrigation & Farm Eng.',
      'video': 'assets/popular_courses/video4.mp4',
      'duration': '10h 15m',
      'level': 'Advanced',
      'description': 'Optimize water usage and increase yield with advanced drip irrigation. Learn the engineering principles behind modern farm irrigation systems.',
      'points': [
        'System design and installation',
        'Water pressure and flow rates',
        'Maintenance and troubleshooting',
      ]
    },
  ];

  late Map<String, dynamic> course;

  @override
  void initState() {
    super.initState();
    final index = int.tryParse(widget.id) ?? 0;
    if (index >= 0 && index < _popularCourses.length) {
      course = _popularCourses[index];
    } else {
      course = _popularCourses[0];
    }
    _initVideoPlayer();
  }

  Future<void> _initVideoPlayer() async {
    try {
      _videoPlayerController = VideoPlayerController.asset(course['video']);
      await _videoPlayerController.initialize();
      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController,
        autoPlay: true,
        looping: false,
        aspectRatio: _videoPlayerController.value.aspectRatio,
        subtitle: Subtitles([
          Subtitle(
            index: 0,
            start: Duration.zero,
            end: const Duration(seconds: 5),
            text: const TextSpan(text: 'Welcome to this course!'),
          ),
          Subtitle(
            index: 1,
            start: const Duration(seconds: 5),
            end: const Duration(seconds: 10),
            text: const TextSpan(text: 'In this video, we will learn the basics.'),
          ),
        ]),
        subtitleBuilder: (context, dynamic subtitle) {
          if (!_showSubtitles) return const SizedBox.shrink();
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.7),
              borderRadius: BorderRadius.circular(8),
            ),
            child: subtitle is TextSpan 
                ? Text.rich(subtitle, style: const TextStyle(color: Colors.white, fontSize: 16))
                : Text(subtitle.toString(), style: const TextStyle(color: Colors.white, fontSize: 16)),
          );
        },
        additionalOptions: (context) {
          return <OptionItem>[
            OptionItem(
              onTap: (onTapContext) {
                setState(() {
                  _showSubtitles = !_showSubtitles;
                });
                Navigator.of(onTapContext).pop();
              },
              iconData: _showSubtitles ? Icons.subtitles : Icons.subtitles_off,
              title: _showSubtitles ? 'Hide Subtitles' : 'Show Subtitles',
            ),
          ];
        },
        errorBuilder: (context, errorMessage) {
          return Center(child: Text(errorMessage, style: const TextStyle(color: Colors.white)));
        },
      );
      if (mounted) setState(() {});
    } catch (e) {
      if (mounted) {
        setState(() {
          _isVideoError = true;
        });
      }
    }
  }

  @override
  void dispose() {
    _videoPlayerController.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: Text(course['title'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Video Player
            Container(
              width: double.infinity,
              height: 250,
              color: Colors.black,
              child: _isVideoError
                  ? const Center(child: Text('Failed to load video', style: TextStyle(color: Colors.white)))
                  : _chewieController != null
                      ? Chewie(controller: _chewieController!)
                      : const Center(child: CircularProgressIndicator(color: AppColors.primary)),
            ),
            const SizedBox(height: 24),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tags: Duration & Level
                  Row(
                    children: [
                      _buildTag(Icons.access_time_rounded, course['duration']),
                      const SizedBox(width: 12),
                      _buildTag(null, course['level'], isHighlighted: true),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Title
                  Text(
                    course['title'],
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                  ),
                  const SizedBox(height: 16),

                  // Description
                  Text(
                    course['description'],
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textTertiary,
                          height: 1.5,
                        ),
                  ),
                  const SizedBox(height: 24),

                  // Learning Points
                  ...(course['points'] as List<String>).map((point) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.check_circle_outline_rounded,
                              color: AppColors.textPrimary,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                point,
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: AppColors.textSecondary,
                                      height: 1.4,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      )),

                  const SizedBox(height: 40),

                  // Enroll Button
                  AppButton(
                    label: 'ENROLL IN THIS COURSE',
                    onPressed: () {
                      final catId = course['categoryId'] ?? widget.id;
                      context.push(RouteNames.courseEnquiry.replaceFirst(':categoryId', catId));
                    },
                    suffixIcon: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTag(IconData? icon, String text, {bool isHighlighted = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isHighlighted ? AppColors.warningLight : Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isHighlighted ? AppColors.warning : AppColors.border,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 16, color: AppColors.textPrimary),
            const SizedBox(width: 6),
          ],
          Text(
            text,
            style: AppTextStyles.labelSmall.copyWith(
              color: isHighlighted ? AppColors.warning : AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
