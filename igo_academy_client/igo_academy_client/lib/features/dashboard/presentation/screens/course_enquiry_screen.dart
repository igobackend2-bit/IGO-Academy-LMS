import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/training_category_model.dart';
import '../../../../features/courses/data/repositories/course_enquiry_repository.dart';

class CourseEnquiryScreen extends ConsumerStatefulWidget {
  final String categoryId;
  const CourseEnquiryScreen({super.key, required this.categoryId});

  @override
  ConsumerState<CourseEnquiryScreen> createState() => _CourseEnquiryScreenState();
}

class _CourseEnquiryScreenState extends ConsumerState<CourseEnquiryScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _altPhoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _detailsController = TextEditingController();
  
  String? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.categoryId;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _altPhoneController.dispose();
    _emailController.dispose();
    _detailsController.dispose();
    super.dispose();
  }

  void _submitEnquiry() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedCategoryId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a program of interest')),
        );
        return;
      }
      
      ref.read(courseEnquiryNotifierProvider.notifier).submit(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
        altPhone: _altPhoneController.text.trim().isEmpty ? null : _altPhoneController.text.trim(),
        courseId: _selectedCategoryId!,
        additionalDetails: _detailsController.text.trim().isEmpty ? null : _detailsController.text.trim(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final enquiryState = ref.watch(courseEnquiryNotifierProvider);
    final isLoading = enquiryState is AsyncLoading;

    ref.listen<AsyncValue<void>>(courseEnquiryNotifierProvider, (previous, next) {
      if (next is AsyncData && previous is AsyncLoading) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enquiry submitted successfully! Our counselor will contact you soon.')),
        );
        context.pop();
      } else if (next is AsyncError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error.toString())),
        );
      }
    });

    return Scaffold(
      backgroundColor: AppColors.primary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ENROLLMENT',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  letterSpacing: 2,
                  color: AppColors.textTertiary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Start Your Learning Journey',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Fill out the form below and our academic counselor will reach out within 24 hours to discuss your program.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              
              _buildSectionTitle('FULL NAME *'),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(hintText: 'Your full name'),
                validator: (value) => value == null || value.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              
              _buildSectionTitle('PHONE NUMBER *'),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(hintText: '+91 98765 43210'),
                validator: (value) => value == null || value.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              
              _buildSectionTitle('ALTERNATIVE PHONE NUMBER (optional)'),
              TextFormField(
                controller: _altPhoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(hintText: 'Optional phone number'),
              ),
              const SizedBox(height: 16),
              
              _buildSectionTitle('EMAIL ADDRESS *'),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(hintText: 'your@email.com'),
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Required';
                  if (!value.contains('@')) return 'Invalid email';
                  return null;
                },
              ),
              const SizedBox(height: 32),
              
              _buildSectionTitle('PROGRAM OF INTEREST *'),
              DropdownButtonFormField<String>(
                value: _selectedCategoryId,
                decoration: const InputDecoration(
                  hintText: 'Select a program',
                ),
                isExpanded: true,
                items: mockTrainingCategories.map((cat) {
                  return DropdownMenuItem<String>(
                    value: cat.id,
                    child: Text(cat.title, overflow: TextOverflow.ellipsis),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedCategoryId = value;
                  });
                },
                validator: (value) => value == null ? 'Please select a program' : null,
              ),
              const SizedBox(height: 32),
              
              _buildSectionTitle('ADDITIONAL DETAILS (optional)'),
              TextFormField(
                controller: _detailsController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Tell us about your background, goals, preferred batch dates, or any questions...',
                ),
              ),
              const SizedBox(height: 40),
              
              ElevatedButton(
                onPressed: isLoading ? null : _submitEnquiry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.textPrimary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                ),
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Flexible(
                            child: Text(
                              'SUBMIT ACADEMY ENQUIRY',
                              style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward_rounded, size: 20, color: Colors.white),
                        ],
                      ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: AppColors.textTertiary,
        ),
      ),
    );
  }
}
