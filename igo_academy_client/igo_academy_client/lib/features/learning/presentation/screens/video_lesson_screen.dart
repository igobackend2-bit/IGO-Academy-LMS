import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';

class VideoLessonScreen extends ConsumerStatefulWidget {
  final String lessonId;

  const VideoLessonScreen({super.key, required this.lessonId});

  @override
  ConsumerState<VideoLessonScreen> createState() => _VideoLessonScreenState();
}

class _VideoLessonScreenState extends ConsumerState<VideoLessonScreen> {
  bool _isFullscreen = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: _isFullscreen
          ? null
          : AppBar(
              backgroundColor: Colors.black,
              iconTheme: const IconThemeData(color: Colors.white),
              title: const Text('Video Lesson',
                  style: TextStyle(color: Colors.white, fontFamily: 'Inter')),
            ),
      body: Column(
        children: [
          // Video player area
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              color: Colors.black,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // TODO: Integrate better_player here
                  // BetterPlayer.network(lesson.videoUrl, ...)
                  Container(
                    color: Colors.black87,
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.play_circle_outline_rounded,
                            size: 72, color: Colors.white54),
                        SizedBox(height: 8),
                        Text('Video Player',
                            style: TextStyle(color: Colors.white54, fontFamily: 'Inter')),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (!_isFullscreen)
            Expanded(
              child: Container(
                color: AppColors.background,
                child: DefaultTabController(
                  length: 3,
                  child: Column(
                    children: [
                      const TabBar(
                        tabs: [
                          Tab(text: 'Overview'),
                          Tab(text: 'Notes'),
                          Tab(text: 'Resources'),
                        ],
                      ),
                      Expanded(
                        child: TabBarView(
                          children: [
                            _OverviewTab(),
                            _NotesTab(),
                            _ResourcesTab(),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _OverviewTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Lesson Overview', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Text(
            'This lesson covers the fundamentals and provides hands-on examples to help you master the concept.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 20),
          Text('What you\'ll learn', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...['Core concepts explained', 'Practical examples', 'Best practices', 'Exercise at the end']
              .map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 18),
                        const SizedBox(width: 8),
                        Text(item, style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                  )),
        ],
      ),
    );
  }
}

class _NotesTab extends StatefulWidget {
  @override
  State<_NotesTab> createState() => _NotesTabState();
}

class _NotesTabState extends State<_NotesTab> {
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              maxLines: null,
              expands: true,
              textAlignVertical: TextAlignVertical.top,
              decoration: const InputDecoration(
                hintText: 'Take notes here…',
                border: InputBorder.none,
              ),
            ),
          ),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.save_outlined),
            label: const Text('Save Notes'),
          ),
        ],
      ),
    );
  }
}

class _ResourcesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ListTile(
          leading: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.errorLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.picture_as_pdf_outlined, color: AppColors.error, size: 20),
          ),
          title: const Text('Lesson Slides.pdf'),
          subtitle: const Text('2.4 MB'),
          trailing: const Icon(Icons.download_outlined, color: AppColors.primary),
          onTap: () {},
        ),
      ],
    );
  }
}
