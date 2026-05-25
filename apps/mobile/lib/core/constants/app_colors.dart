import 'package:flutter/material.dart';

/// Speakoo brand color palette — light green theme
abstract final class AppColors {
  // Primary greens
  static const Color primaryGreen = Color(0xFF43A047);
  static const Color primaryLight = Color(0xFF76D275);
  static const Color primaryDark = Color(0xFF2E7D32);
  static const Color primaryContainer = Color(0xFFE8F5E9);
  static const Color onPrimaryContainer = Color(0xFF1B5E20);

  // Accent — warm amber for CTAs
  static const Color accent = Color(0xFFFF8F00);
  static const Color accentLight = Color(0xFFFFB300);
  static const Color accentContainer = Color(0xFFFFF8E1);

  // Surfaces
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F8E9);
  static const Color background = Color(0xFFF8FBF0);
  static const Color card = Color(0xFFFFFFFF);

  // Text
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF616161);
  static const Color textHint = Color(0xFF9E9E9E);
  static const Color textOnGreen = Color(0xFFFFFFFF);

  // Status
  static const Color success = Color(0xFF43A047);
  static const Color warning = Color(0xFFFF8F00);
  static const Color error = Color(0xFFE53935);
  static const Color info = Color(0xFF1976D2);

  // Misc
  static const Color divider = Color(0xFFE8F5E9);
  static const Color shadow = Color(0x1A000000);
  static const Color overlay = Color(0x80000000);
  static const Color shimmerBase = Color(0xFFE8F5E9);
  static const Color shimmerHighlight = Color(0xFFF1F8E9);

  // Dark mode
  static const Color darkSurface = Color(0xFF1E2720);
  static const Color darkBackground = Color(0xFF141A16);
  static const Color darkCard = Color(0xFF263028);

  // Rating stars
  static const Color starFilled = Color(0xFFFFB300);
  static const Color starEmpty = Color(0xFFE0E0E0);

  // Language category colors
  static const Color langEnglish = Color(0xFF1976D2);
  static const Color langSpanish = Color(0xFFE53935);
  static const Color langFrench = Color(0xFF7B1FA2);
  static const Color langMandarin = Color(0xFFD32F2F);
  static const Color langArabic = Color(0xFF388E3C);
  static const Color langGerman = Color(0xFF455A64);
  static const Color langJapanese = Color(0xFFC62828);
  static const Color langOther = Color(0xFF0288D1);

  static Color forLanguage(String language) {
    switch (language.toLowerCase()) {
      case 'english':
        return langEnglish;
      case 'spanish':
        return langSpanish;
      case 'french':
        return langFrench;
      case 'mandarin':
      case 'chinese':
        return langMandarin;
      case 'arabic':
        return langArabic;
      case 'german':
        return langGerman;
      case 'japanese':
        return langJapanese;
      default:
        return langOther;
    }
  }

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryLight, primaryGreen],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [primaryGreen, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
