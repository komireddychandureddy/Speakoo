import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Displays a star rating (read-only)
class StarRating extends StatelessWidget {
  final double rating;
  final double size;
  final bool showValue;

  const StarRating({
    super.key,
    required this.rating,
    this.size = 16,
    this.showValue = true,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.star_rounded, size: size, color: AppColors.starFilled),
        const SizedBox(width: 3),
        if (showValue)
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: size * 0.85,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
      ],
    );
  }
}
