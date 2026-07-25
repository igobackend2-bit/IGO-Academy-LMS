import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/models/assessment_model.dart';

// ─── Data models for panel ────────────────────────────────────────────────────

class _PanelData {
  final List<AssessmentModel> assessments;
  final List<Map<String, dynamic>> infoResources;
  final List<Map<String, dynamic>> noteResources;

  const _PanelData({
    required this.assessments,
    required this.infoResources,
    required this.noteResources,
  });
}

// ─── Main panel widget ────────────────────────────────────────────────────────

class EnrolledCourseSidePanel extends StatefulWidget {
  final String courseId;
  final String courseTitle;

  const EnrolledCourseSidePanel({
    super.key,
    required this.courseId,
    required this.courseTitle,
  });

  @override
  State<EnrolledCourseSidePanel> createState() =>
      _EnrolledCourseSidePanelState();
}

class _EnrolledCourseSidePanelState extends State<EnrolledCourseSidePanel> {
  _PanelData? _data;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final client = Supabase.instance.client;
      final results = await Future.wait([
        // assessments — include unpublished so admin can preview
        client
            .from('assessments')
            .select()
            .eq('course_id', widget.courseId)
            .order('created_at'),
        client
            .from('resources')
            .select()
            .eq('course_id', widget.courseId)
            .eq('type', 'information')
            .order('display_order'),
        client
            .from('resources')
            .select()
            .eq('course_id', widget.courseId)
            .eq('type', 'note')
            .order('display_order'),
      ]);

      if (!mounted) return;
      setState(() {
        _data = _PanelData(
          assessments: (results[0] as List)
              .map((e) => AssessmentModel.fromJson(e as Map<String, dynamic>))
              .toList(),
          infoResources: (results[1] as List).cast<Map<String, dynamic>>(),
          noteResources: (results[2] as List).cast<Map<String, dynamic>>(),
        );
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.background,
      width: MediaQuery.of(context).size.width * 0.88,
      child: SafeArea(
        child: _loading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary))
            : _error != null
                ? _ErrorView(error: _error!, onRetry: _load)
                : _PanelContent(
                    courseId: widget.courseId,
                    data: _data!,
                    onRefresh: _load,
                  ),
      ),
    );
  }
}

// ─── Error view ───────────────────────────────────────────────────────────────

class _ErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;
  const _ErrorView({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 48),
            const SizedBox(height: 12),
            const Text('Failed to load resources',
                style: TextStyle(fontWeight: FontWeight.w600, color: Colors.red)),
            const SizedBox(height: 6),
            Text(error,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red, fontSize: 11)),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Tabbed panel content ─────────────────────────────────────────────────────

class _PanelContent extends StatelessWidget {
  final String courseId;
  final _PanelData data;
  final VoidCallback onRefresh;

  const _PanelContent({
    required this.courseId,
    required this.data,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Course Resources',
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh, size: 20),
                  tooltip: 'Reload',
                  onPressed: onRefresh,
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const TabBar(
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondary,
            indicatorColor: AppColors.primary,
            tabs: [
              Tab(text: 'Assessment'),
              Tab(text: 'Information'),
              Tab(text: 'Notes'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _AssessmentTab(
                  courseId: courseId,
                  assessments: data.assessments,
                ),
                _ResourceTab(
                  resources: data.infoResources,
                  emptyLabel: 'information',
                ),
                _ResourceTab(
                  resources: data.noteResources,
                  emptyLabel: 'notes',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Assessment Tab ───────────────────────────────────────────────────────────

class _AssessmentTab extends StatelessWidget {
  final String courseId;
  final List<AssessmentModel> assessments;
  const _AssessmentTab({required this.courseId, required this.assessments});

  @override
  Widget build(BuildContext context) {
    if (assessments.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.quiz_outlined, size: 56, color: AppColors.textTertiary),
              const SizedBox(height: 16),
              Text('No assessments yet',
                  style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 6),
              Text('Course ID: $courseId',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textTertiary, fontSize: 11)),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: assessments.length,
      itemBuilder: (context, i) {
        final a = assessments[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          color: AppColors.surface,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.quiz_rounded,
                          color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(a.title,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 14)),
                          const SizedBox(height: 4),
                          Text(
                            '${a.questions.length} questions · Pass ${a.passScore}%'
                            '${a.timerMins != null ? ' · ⏱ ${a.timerMins} min' : ''}',
                            style: TextStyle(
                                fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      context.push('/assessment-quiz', extra: a);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Start Assessment',
                        style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ─── Resource Tab (Information / Notes) ──────────────────────────────────────

class _ResourceTab extends StatefulWidget {
  final List<Map<String, dynamic>> resources;
  final String emptyLabel;

  const _ResourceTab({required this.resources, required this.emptyLabel});

  @override
  State<_ResourceTab> createState() => _ResourceTabState();
}

class _ResourceTabState extends State<_ResourceTab> {
  String? _openingPdfId;

  Future<void> _openPdf(
      BuildContext ctx, String resourceId, String pdfPath, String title) async {
    if (pdfPath.isEmpty || pdfPath.startsWith('local:')) {
      ScaffoldMessenger.of(ctx).showSnackBar(
        const SnackBar(
          content: Text('PDF not uploaded to cloud yet. Ask admin to re-upload.'),
          backgroundColor: Colors.orange,
          duration: Duration(seconds: 4),
        ),
      );
      return;
    }

    setState(() => _openingPdfId = resourceId);
    try {
      final signedUrl = await Supabase.instance.client.storage
          .from('resource-pdfs')
          .createSignedUrl(pdfPath, 3600);

      final tempDir = await getTemporaryDirectory();
      final localFile =
          File('${tempDir.path}/${pdfPath.replaceAll('/', '_')}');

      await Dio().download(signedUrl, localFile.path);

      if (!mounted) return;
      await Navigator.of(ctx).push(MaterialPageRoute(
        builder: (_) =>
            _PdfViewerPage(filePath: localFile.path, title: title),
      ));
    } on StorageException catch (e) {
      if (!mounted) return;
      final msg = (e.statusCode == '404' || e.error == 'not_found')
          ? 'PDF file not found in storage. Ask admin to re-upload.'
          : 'Storage error: ${e.message}';
      ScaffoldMessenger.of(ctx).showSnackBar(
        SnackBar(
            content: Text(msg),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 4)),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(ctx).showSnackBar(
        SnackBar(
          content: Text('Cannot open PDF: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _openingPdfId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.resources.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                widget.emptyLabel == 'notes'
                    ? Icons.notes_outlined
                    : Icons.info_outline_rounded,
                size: 56,
                color: AppColors.textTertiary,
              ),
              const SizedBox(height: 16),
              Text('No ${widget.emptyLabel} available',
                  style: Theme.of(context).textTheme.titleSmall),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: widget.resources.length,
      itemBuilder: (context, i) {
        final item = widget.resources[i];
        final resourceId = item['id'] as String? ?? '';
        final title = item['title'] as String? ?? '';
        final content = item['content'] as String? ?? '';
        final pdfPath = item['pdf_path'] as String?;
        final isOpeningThis = _openingPdfId == resourceId;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          color: AppColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: pdfPath != null
                            ? Colors.red.withOpacity(0.1)
                            : AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        pdfPath != null
                            ? Icons.picture_as_pdf_outlined
                            : Icons.article_outlined,
                        color: pdfPath != null ? Colors.red : AppColors.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(title,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 14)),
                    ),
                  ],
                ),
                if (content.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(
                    content,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                          height: 1.5,
                        ),
                    maxLines: 5,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                if (pdfPath != null) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: isOpeningThis
                          ? null
                          : () => _openPdf(context, resourceId, pdfPath, title),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: isOpeningThis
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.open_in_new, size: 16),
                      label: Text(isOpeningThis ? 'Opening PDF...' : 'Open PDF'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

// ─── In-app PDF viewer ────────────────────────────────────────────────────────

class _PdfViewerPage extends StatefulWidget {
  final String filePath;
  final String title;
  const _PdfViewerPage({required this.filePath, required this.title});

  @override
  State<_PdfViewerPage> createState() => _PdfViewerPageState();
}

class _PdfViewerPageState extends State<_PdfViewerPage> {
  int _currentPage = 0;
  int _totalPages = 0;
  bool _isReady = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        backgroundColor: Colors.grey.shade900,
        foregroundColor: Colors.white,
        title: Text(widget.title,
            style:
                const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            overflow: TextOverflow.ellipsis),
        actions: [
          if (_isReady)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Text(
                  '${_currentPage + 1} / $_totalPages',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ),
            ),
        ],
      ),
      body: PDFView(
        filePath: widget.filePath,
        enableSwipe: true,
        swipeHorizontal: false,
        autoSpacing: true,
        pageFling: true,
        onRender: (pages) => setState(() {
          _totalPages = pages ?? 0;
          _isReady = true;
        }),
        onPageChanged: (page, total) => setState(() {
          _currentPage = page ?? 0;
          _totalPages = total ?? 0;
        }),
        onError: (e) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('PDF error: $e'), backgroundColor: Colors.red),
          );
        },
      ),
    );
  }
}
