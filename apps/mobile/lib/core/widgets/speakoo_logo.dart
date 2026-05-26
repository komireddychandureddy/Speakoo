import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../constants/app_colors.dart';

/// Speakoo parrot logo widget — renders SVG or text fallback
class SpeakooLogo extends StatelessWidget {
  final double size;
  final bool showText;
  final bool showMotto;
  final Color textColor;

  const SpeakooLogo({
    super.key,
    this.size = 80,
    this.showText = true,
    this.showMotto = false,
    this.textColor = AppColors.textPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SvgPicture.asset(
          'assets/icons/speakoo_logo.svg',
          width: size,
          height: size,
        ),
        if (showText) ...[
          const SizedBox(height: 10),
          ShaderMask(
            shaderCallback: (bounds) =>
                AppColors.heroGradient.createShader(bounds),
            child: Text(
              'Speakoo',
              style: TextStyle(
                fontSize: size * 0.38,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            ),
          ),
        ],
        if (showMotto) ...[
          const SizedBox(height: 8),
          Text(
            'Learn any language from anywhere\nin the world from expert native tutors',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: textColor.withValues(alpha: 0.7),
              height: 1.5,
            ),
          ),
        ],
      ],
    );
  }
}
