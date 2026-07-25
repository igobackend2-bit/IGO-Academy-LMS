import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand
  static const Color primary = Color(0xFF10B981);       // Mild Green (Emerald)
  static const Color primaryLight = Color(0xFF34D399);  // Light Mild Green
  static const Color primaryDark = Color(0xFF065F46);   // Dark Forest Green
  static const Color secondary = Color(0xFF895129);     // Warm rich brown
  static const Color accent = Color(0xFF0BDA51);        // Accent Green

  // Neutrals
  static const Color background = Color(0xFFF0FDF4);    // Mild Green Background
  static const Color surface = Color(0xFFFFFFFF);       // White Surface
  static const Color surfaceVariant = Color(0xFFE6F4EA); // Soft Green Variant
  static const Color border = Color(0xFFE5E7EB);        // Light Gray Border (removes black lines)
  static const Color divider = Color(0xFFF3F4F6);       // Light Gray Divider

  // Text
  static const Color textPrimary = Color(0xFF111827);   // Dark Charcoal
  static const Color textSecondary = Color(0xFF895129); // Warm rich brown
  static const Color textTertiary = Color(0xFF6B7280);
  static const Color textInverse = Color(0xFFFFFFFF);   // White

  // Semantic
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFF895129);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);

  // Dark mode
  static const Color backgroundDark = Color(0xFF0F172A);
  static const Color surfaceDark = Color(0xFF1E293B);
  static const Color surfaceVariantDark = Color(0xFF334155);
  static const Color borderDark = Color(0xFF334155);
  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF34D399);

  // Course level badges
  static const Color beginner = Color(0xFF10B981);
  static const Color intermediate = Color(0xFF895129);
  static const Color advanced = Color(0xFFEF4444);

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, Color(0xFF34D399)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [primary, Color(0xFF34D399)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
