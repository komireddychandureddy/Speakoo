import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';

enum _ApprovalStatus { pending, approved, rejected }

class _TutorApplication {
  _TutorApplication({
    required this.id,
    required this.name,
    required this.headline,
    required this.languages,
    required this.submittedAt,
    this.status = _ApprovalStatus.pending,
  });
  final String id;
  final String name;
  final String headline;
  final List<String> languages;
  final String submittedAt;
  _ApprovalStatus status;
}

class TutorApprovalScreen extends StatefulWidget {
  const TutorApprovalScreen({super.key});

  @override
  State<TutorApprovalScreen> createState() => _TutorApprovalScreenState();
}

class _TutorApprovalScreenState extends State<TutorApprovalScreen> {
  final List<_TutorApplication> _applications = [
    _TutorApplication(
      id: 't1',
      name: 'Maria Gonzalez',
      headline: 'Native Spanish tutor with 5 yrs exp',
      languages: ['Spanish', 'French'],
      submittedAt: 'Jun 18, 2025',
    ),
    _TutorApplication(
      id: 't2',
      name: 'Yuki Tanaka',
      headline: 'Japanese language & culture coach',
      languages: ['Japanese', 'English'],
      submittedAt: 'Jun 17, 2025',
    ),
    _TutorApplication(
      id: 't3',
      name: 'Ahmed Al-Rashid',
      headline: 'Modern Standard Arabic & Gulf dialect',
      languages: ['Arabic'],
      submittedAt: 'Jun 16, 2025',
    ),
    _TutorApplication(
      id: 't4',
      name: 'Elena Petrov',
      headline: 'Russian conversation specialist',
      languages: ['Russian', 'Ukrainian'],
      submittedAt: 'Jun 15, 2025',
      status: _ApprovalStatus.approved,
    ),
    _TutorApplication(
      id: 't5',
      name: 'Priya Sharma',
      headline: 'Hindi & Urdu everyday conversation',
      languages: ['Hindi', 'Urdu'],
      submittedAt: 'Jun 14, 2025',
      status: _ApprovalStatus.rejected,
    ),
  ];

  String _filter = 'All';

  List<_TutorApplication> get _filtered {
    if (_filter == 'Pending') {
      return _applications
          .where((a) => a.status == _ApprovalStatus.pending)
          .toList();
    }
    if (_filter == 'Approved') {
      return _applications
          .where((a) => a.status == _ApprovalStatus.approved)
          .toList();
    }
    if (_filter == 'Rejected') {
      return _applications
          .where((a) => a.status == _ApprovalStatus.rejected)
          .toList();
    }
    return _applications;
  }

  void _updateStatus(String id, _ApprovalStatus status) {
    setState(() {
      final app = _applications.firstWhere((a) => a.id == id);
      app.status = status;
    });
    final label = status == _ApprovalStatus.approved ? 'Approved' : 'Rejected';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label successfully'),
        backgroundColor: status == _ApprovalStatus.approved
            ? AppColors.primaryGreen
            : Colors.redAccent,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(10))),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pending =
        _applications.where((a) => a.status == _ApprovalStatus.pending).length;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Tutor Applications'),
            if (pending > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('$pending',
                    style: const TextStyle(
                        color: AppColors.primaryDark,
                        fontWeight: FontWeight.bold,
                        fontSize: 12)),
              ),
            ],
          ],
        ),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          // Filter chips
          Container(
            color: Colors.white,
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Pending', 'Approved', 'Rejected']
                    .map((label) {
                  final active = _filter == label;
                  return GestureDetector(
                    onTap: () => setState(() => _filter = label),
                    child: AnimatedContainer(
                      duration: 200.ms,
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: active
                            ? AppColors.primaryGreen
                            : AppColors.background,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: active
                              ? AppColors.primaryGreen
                              : AppColors.divider,
                        ),
                      ),
                      child: Text(label,
                          style: TextStyle(
                              color: active
                                  ? Colors.white
                                  : AppColors.textSecondary,
                              fontWeight: active
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              fontSize: 13)),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          Expanded(
            child: _filtered.isEmpty
                ? const Center(
                    child: Text('No applications',
                        style: TextStyle(color: AppColors.textHint)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filtered.length,
                    itemBuilder: (context, i) {
                      return _ApplicationCard(
                        application: _filtered[i],
                        onApprove: () =>
                            _updateStatus(_filtered[i].id, _ApprovalStatus.approved),
                        onReject: () =>
                            _updateStatus(_filtered[i].id, _ApprovalStatus.rejected),
                      )
                          .animate(delay: (i * 80).ms)
                          .fadeIn()
                          .slideY(begin: 0.1, end: 0);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  const _ApplicationCard({
    required this.application,
    required this.onApprove,
    required this.onReject,
  });
  final _TutorApplication application;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  Color get _statusColor {
    switch (application.status) {
      case _ApprovalStatus.approved:
        return AppColors.primaryGreen;
      case _ApprovalStatus.rejected:
        return Colors.redAccent;
      case _ApprovalStatus.pending:
        return Colors.orange;
    }
  }

  String get _statusLabel {
    switch (application.status) {
      case _ApprovalStatus.approved:
        return 'Approved';
      case _ApprovalStatus.rejected:
        return 'Rejected';
      case _ApprovalStatus.pending:
        return 'Pending';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPending = application.status == _ApprovalStatus.pending;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
              color: AppColors.shadow, blurRadius: 8, offset: Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: AppColors.primaryContainer,
                child: Text(application.name[0],
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                        fontSize: 16)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(application.name,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 15)),
                    Text(application.headline,
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(_statusLabel,
                    style: TextStyle(
                        color: _statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 11)),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Languages
          Wrap(
            spacing: 6,
            children: application.languages.map((lang) {
              return Chip(
                label: Text(lang,
                    style: const TextStyle(fontSize: 11)),
                backgroundColor: AppColors.primaryContainer,
                labelStyle:
                    const TextStyle(color: AppColors.primaryDark),
                padding: EdgeInsets.zero,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              );
            }).toList(),
          ),

          const SizedBox(height: 6),
          Text('Submitted: ${application.submittedAt}',
              style: const TextStyle(
                  color: AppColors.textHint, fontSize: 11)),

          // Action buttons (only for pending)
          if (isPending) ...[
            const SizedBox(height: 14),
            const Divider(height: 1, color: AppColors.divider),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onReject,
                    icon: const Icon(Icons.close_rounded, size: 16),
                    label: const Text('Reject'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: const BorderSide(color: Colors.redAccent),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onApprove,
                    icon: const Icon(Icons.check_rounded, size: 16),
                    label: const Text('Approve'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      elevation: 0,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
