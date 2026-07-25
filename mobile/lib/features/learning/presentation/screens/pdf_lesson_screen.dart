import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import '../../../../core/theme/app_colors.dart';

class PdfLessonScreen extends StatefulWidget {
  final String lessonId;

  const PdfLessonScreen({super.key, required this.lessonId});

  @override
  State<PdfLessonScreen> createState() => _PdfLessonScreenState();
}

class _PdfLessonScreenState extends State<PdfLessonScreen> {
  int _currentPage = 0;
  int _totalPages = 0;
  bool _isReady = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PDF Lesson'),
        actions: [
          if (_isReady)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Text(
                  '${_currentPage + 1} / $_totalPages',
                  style: Theme.of(context).textTheme.labelMedium,
                ),
              ),
            ),
        ],
      ),
      body: Stack(
        children: [
          // TODO: Replace with actual PDF URL from Supabase Storage
          // PDFView(
          //   filePath: localPdfPath,
          //   onPageChanged: (page, total) => setState(() {
          //     _currentPage = page ?? 0;
          //     _totalPages = total ?? 0;
          //   }),
          //   onRender: (_) => setState(() => _isReady = true),
          // ),
          Container(
            color: AppColors.surfaceVariant,
            child: const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.picture_as_pdf_rounded, size: 80, color: AppColors.error),
                  SizedBox(height: 16),
                  Text('PDF Viewer',
                      style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600)),
                  SizedBox(height: 8),
                  Text('Connect to Supabase Storage to load PDF.',
                      style: TextStyle(fontFamily: 'Inter', color: AppColors.textSecondary)),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _isReady
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton.outlined(
                      onPressed: _currentPage > 0 ? () => setState(() => _currentPage--) : null,
                      icon: const Icon(Icons.chevron_left_rounded),
                    ),
                    Text('Page ${_currentPage + 1} of $_totalPages'),
                    IconButton.outlined(
                      onPressed: _currentPage < _totalPages - 1
                          ? () => setState(() => _currentPage++)
                          : null,
                      icon: const Icon(Icons.chevron_right_rounded),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }
}
