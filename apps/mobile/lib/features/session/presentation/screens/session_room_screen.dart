import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';

class SessionRoomScreen extends StatefulWidget {
  final String bookingId;

  const SessionRoomScreen({super.key, required this.bookingId});

  @override
  State<SessionRoomScreen> createState() => _SessionRoomScreenState();
}

class _SessionRoomScreenState extends State<SessionRoomScreen> {
  bool _micOn = true;
  bool _camOn = true;
  bool _screenSharing = false;
  bool _chatOpen = false;
  bool _whiteboardOpen = false;
  bool _recording = false;

  Future<bool> _confirmLeave() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Leave Session?',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        content: const Text(
          'Are you sure you want to leave the session early?',
          style: TextStyle(color: Colors.white70, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Stay',
                style: TextStyle(color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Leave',
                style: TextStyle(
                    color: Colors.redAccent, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  Future<void> _toggleRecording() async {
    if (!_recording) {
      // Confirm before starting recording (consent)
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E1E1E),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text(
            'Record Session?',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
          ),
          content: const Text(
            'Both participants will be notified that this session is being recorded. Do you consent?',
            style: TextStyle(color: Colors.white70, fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancel',
                  style: TextStyle(color: Colors.white54)),
            ),
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              child: const Text('Record',
                  style: TextStyle(
                      color: Colors.redAccent,
                      fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
    }
    setState(() => _recording = !_recording);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_recording
              ? 'Recording started'
              : 'Recording stopped'),
          backgroundColor:
              _recording ? Colors.redAccent : const Color(0xFF424242),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _onLeave() async {
    final confirmed = await _confirmLeave();
    if (!confirmed || !mounted) return;
    context.go('/session-complete/${widget.bookingId}');
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop) await _onLeave();
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: const Color(0xFF121212),
          foregroundColor: Colors.white,
          automaticallyImplyLeading: false,
          title: Row(
            children: [
              // Live badge
              if (_recording)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.fiber_manual_record,
                          size: 8, color: Colors.white),
                      SizedBox(width: 4),
                      Text('REC',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w700)),
                    ],
                  ),
                ).animate(onPlay: (c) => c.repeat(reverse: true))
                    .fadeIn(duration: 600.ms),
              Expanded(
                child: Text(
                  'Session #${widget.bookingId.substring(0, 6).toUpperCase()}',
                  style: const TextStyle(fontSize: 15, color: Colors.white70),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          actions: [
            // Record toggle
            IconButton(
              onPressed: _toggleRecording,
              tooltip: _recording ? 'Stop Recording' : 'Start Recording',
              icon: Icon(
                _recording
                    ? Icons.stop_circle_outlined
                    : Icons.fiber_manual_record,
                color: _recording ? Colors.redAccent : Colors.white54,
              ),
            ),
            TextButton(
              onPressed: _onLeave,
              child: const Text('Leave',
                  style: TextStyle(
                      color: Colors.redAccent, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
        body: Stack(
          children: [
            // Main remote video area
            const _RemoteVideoPlaceholder(),
            // Local video pip
            Positioned(
              top: 16,
              right: 16,
              child: _LocalVideoPip(camOn: _camOn),
            ),
            // Chat overlay
            if (_chatOpen)
              Positioned.fill(
                child: _ChatOverlay(
                  onClose: () => setState(() => _chatOpen = false),
                ),
              ),
            // Whiteboard overlay
            if (_whiteboardOpen)
              Positioned.fill(
                child: _WhiteboardOverlay(
                  onClose: () =>
                      setState(() => _whiteboardOpen = false),
                ),
              ),
          ],
        ),
        bottomNavigationBar: SafeArea(
          child: Container(
            color: const Color(0xFF121212),
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _ControlBtn(
                  icon: _micOn ? Icons.mic : Icons.mic_off,
                  label: _micOn ? 'Mute' : 'Unmute',
                  active: _micOn,
                  onTap: () => setState(() => _micOn = !_micOn),
                ),
                _ControlBtn(
                  icon: _camOn ? Icons.videocam : Icons.videocam_off,
                  label: _camOn ? 'Stop Cam' : 'Start Cam',
                  active: _camOn,
                  onTap: () => setState(() => _camOn = !_camOn),
                ),
                _ControlBtn(
                  icon: Icons.screen_share_outlined,
                  label: _screenSharing ? 'Stop Share' : 'Share',
                  active: _screenSharing,
                  onTap: () =>
                      setState(() => _screenSharing = !_screenSharing),
                ),
                _ControlBtn(
                  icon: Icons.chat_bubble_outline,
                  label: 'Chat',
                  active: _chatOpen,
                  onTap: () => setState(() {
                    _chatOpen = !_chatOpen;
                    if (_chatOpen) _whiteboardOpen = false;
                  }),
                ),
                _ControlBtn(
                  icon: Icons.brush_outlined,
                  label: 'Board',
                  active: _whiteboardOpen,
                  onTap: () => setState(() {
                    _whiteboardOpen = !_whiteboardOpen;
                    if (_whiteboardOpen) _chatOpen = false;
                  }),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RemoteVideoPlaceholder extends StatelessWidget {
  const _RemoteVideoPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0D0D0D),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person, color: Color(0xFF3A3A3A), size: 80),
            SizedBox(height: 12),
            Text(
              'Waiting for tutor…',
              style: TextStyle(color: Colors.white54, fontSize: 16),
            ),
            SizedBox(height: 6),
            Text(
              'LiveKit livekit_client SDK — wire up room here',
              style: TextStyle(color: Color(0xFF444444), fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}

class _LocalVideoPip extends StatelessWidget {
  final bool camOn;

  const _LocalVideoPip({required this.camOn});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 90,
      height: 120,
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white24),
      ),
      child: camOn
          ? const Center(
              child: Icon(Icons.videocam, color: Colors.white54, size: 32),
            )
          : const Center(
              child: Icon(Icons.videocam_off, color: Colors.white24, size: 32),
            ),
    );
  }
}

class _ControlBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _ControlBtn({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: active
                  ? AppColors.primaryGreen.withOpacity(0.15)
                  : const Color(0xFF2A2A2A),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon,
                color: active ? AppColors.primaryGreen : Colors.white54,
                size: 22),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
                color: active ? AppColors.primaryGreen : Colors.white38,
                fontSize: 10),
          ),
        ],
      ),
    );
  }
}

class _ChatOverlay extends StatelessWidget {
  final VoidCallback onClose;

  const _ChatOverlay({required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xCC000000),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Session Chat',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 16)),
                IconButton(
                  onPressed: onClose,
                  icon: const Icon(Icons.close, color: Colors.white54),
                ),
              ],
            ),
          ),
          const Expanded(
            child: Center(
              child: Text(
                'Chat — wire up LiveKit data channel here',
                style: TextStyle(color: Colors.white38, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _WhiteboardOverlay extends StatelessWidget {
  final VoidCallback onClose;

  const _WhiteboardOverlay({required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          Container(
            color: const Color(0xFF1E1E1E),
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Whiteboard',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 16)),
                IconButton(
                  onPressed: onClose,
                  icon: const Icon(Icons.close, color: Colors.white54),
                ),
              ],
            ),
          ),
          const Expanded(
            child: Center(
              child: Text(
                'Canvas — wire up Perfect Freehand / Syncfusion here',
                style: TextStyle(color: Colors.black38, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
