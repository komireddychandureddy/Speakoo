import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import 'language_chip.dart';
import 'star_rating.dart';
import 'primary_button.dart';

class TutorModel {
  final String id;
  final String name;
  final String avatar;
  final List<String> languages;
  final double rating;
  final int reviewCount;
  final double hourlyRate;
  final String headline;
  final bool isOnline;

  const TutorModel({
    required this.id,
    required this.name,
    required this.avatar,
    required this.languages,
    required this.rating,
    required this.reviewCount,
    required this.hourlyRate,
    required this.headline,
    this.isOnline = false,
  });
}

/// Card shown in tutor listings
class TutorCard extends StatelessWidget {
  final TutorModel tutor;
  final VoidCallback? onBook;
  final VoidCallback? onTap;

  const TutorCard({
    super.key,
    required this.tutor,
    this.onBook,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: const Border.fromBorderSide(
              BorderSide(color: AppColors.divider, width: 1)),
          boxShadow: const [
            BoxShadow(
              color: AppColors.shadow,
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Avatar(url: tutor.avatar, name: tutor.name, isOnline: tutor.isOnline),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tutor.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tutor.headline,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: tutor.languages
                          .take(3)
                          .map((l) => LanguageChip(language: l))
                          .toList(),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        StarRating(rating: tutor.rating),
                        const SizedBox(width: 4),
                        Text(
                          '(${tutor.reviewCount})',
                          style: const TextStyle(
                              fontSize: 12, color: AppColors.textHint),
                        ),
                        const Spacer(),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '\$${tutor.hourlyRate.toStringAsFixed(0)}/hr',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryGreen,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    PrimaryButton(
                      label: 'Book Session',
                      onPressed: onBook,
                      width: double.infinity,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String url;
  final String name;
  final bool isOnline;

  const _Avatar({required this.url, required this.name, required this.isOnline});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CircleAvatar(
          radius: 34,
          backgroundColor: AppColors.primaryContainer,
          child: url.isNotEmpty
              ? ClipOval(
                  child: CachedNetworkImage(
                    imageUrl: url,
                    width: 68,
                    height: 68,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => _Initials(name: name),
                    placeholder: (_, __) => _Initials(name: name),
                  ),
                )
              : _Initials(name: name),
        ),
        if (isOnline)
          Positioned(
            bottom: 2,
            right: 2,
            child: Container(
              width: 13,
              height: 13,
              decoration: BoxDecoration(
                color: AppColors.success,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}

class _Initials extends StatelessWidget {
  final String name;
  const _Initials({required this.name});

  @override
  Widget build(BuildContext context) {
    final parts = name.split(' ');
    final initials = parts.length >= 2
        ? '${parts[0][0]}${parts[1][0]}'
        : name.isNotEmpty
            ? name[0]
            : '?';
    return Text(
      initials.toUpperCase(),
      style: const TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.primaryGreen,
      ),
    );
  }
}
