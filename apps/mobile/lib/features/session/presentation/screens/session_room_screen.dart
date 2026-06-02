import 'dart:convert';
import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:livekit_client/livekit_client.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/session_provider.dart';

class SessionRoomScreen extends ConsumerStatefulWidget {
  final String bookingId;

  const SessionRoomScreen({super.key, required this.bookingId});

  @override
  ConsumerState<SessionRoomScreen> createState() => _SessionRoomScreenState();
}

class _SessionRoomScreenState extends ConsumerState<SessionRoomScreen> {
  bool _micOn = true;
  bool _camOn = true;
  bool _connected = false;
  bool _chatOpen = false;
  bool _whiteboardOpen = false;
  bool _recording = false;
  bool _connecting = true;
  String? _error;

  final TextEditingController _chatInput = TextEditingController();
  final List<String> _messages = [];
  final List<List<Offset>> _strokes = [];

  dynamic _room;
  StreamSubscription<dynamic>? _roomEventsSub;

  @override
  void initState() {
    super.initState();
    _initSession();
  }

  @override
  void dispose() {
    _chatInput.dispose();
    _roomEventsSub?.cancel();
    try {
      (_room as dynamic?)?.dispose();
    } catch (_) {}
    super.dispose();
  }

  Future<void> _initSession() async {
    try {
      final token = await ref.read(sessionRepositoryProvider).getSessionToken(widget.bookingId);
      final messaging = FirebaseMessaging.instance;
      final pushToken = await messaging.getToken();
      if (pushToken != null && pushToken.isNotEmpty) {
        await ref.read(sessionRepositoryProvider).registerDeviceToken(pushToken);
      }

      final wsUrl = const String.fromEnvironment('LIVEKIT_WS_URL', defaultValue: 'wss://speakoo.duckdns.org');
      _room = Room();
      await (_room as dynamic).connect(wsUrl, token);

      final events = (_room as dynamic).events;
      if (events is Stream<dynamic>) {
        _roomEventsSub = events.listen((event) {
          final eventType = event.runtimeType.toString();
          if (eventType.contains('DataReceived')) {
            try {
              final payload = (event as dynamic).data as Uint8List;
              final text = utf8.decode(payload);
              if (mounted) {
                setState(() {
                  _messages.add('Peer: $text');
                });
              }
            } catch (_) {}
          }
        });
      }

      setState(() {
        _connected = true;
        _connecting = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to connect to session';
        _connecting = false;
      });
    }
  }

  Future<void> _toggleRecording() async {
    if (!_recording) {
      await ref.read(sessionRecordingProvider.notifier).start(widget.bookingId);
    } else {
      await ref.read(sessionRecordingProvider.notifier).stop(widget.bookingId);
    }
    if (!mounted) return;
    setState(() => _recording = !_recording);
  }

  Future<void> _sendChat() async {
    final text = _chatInput.text.trim();
    if (text.isEmpty) return;
    _chatInput.clear();

    try {
      final bytes = Uint8List.fromList(utf8.encode(text));
      await (_room as dynamic?)?.localParticipant?.publishData(bytes);
    } catch (_) {}

    setState(() {
      _messages.add('Me: $text');
    });
  }

  Future<void> _leave() async {
    try {
      await (_room as dynamic?)?.disconnect();
    } catch (_) {}
    if (!mounted) return;
    context.go('/session-complete/${widget.bookingId}');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFF121212),
        foregroundColor: Colors.white,
        title: Text('Session #${widget.bookingId.substring(0, 6).toUpperCase()}'),
        actions: [
          IconButton(
            onPressed: _toggleRecording,
            icon: Icon(
              _recording ? Icons.stop_circle_outlined : Icons.fiber_manual_record,
              color: _recording ? Colors.redAccent : Colors.white54,
            ),
          ),
          TextButton(
            onPressed: _leave,
            child: const Text('Leave', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
      body: Stack(
        children: [
          Container(
            color: const Color(0xFF0D0D0D),
            child: Center(
              child: _connecting
                  ? const CircularProgressIndicator()
                  : _error != null
                      ? Text(_error!, style: const TextStyle(color: Colors.redAccent))
                      : Text(
                          _connected ? 'LiveKit connected' : 'Disconnected',
                          style: const TextStyle(color: Colors.white70),
                        ),
            ),
          ),
          if (_whiteboardOpen)
            Positioned.fill(
              child: _WhiteboardLayer(
                strokes: _strokes,
                onClose: () => setState(() => _whiteboardOpen = false),
              ),
            ),
          if (_chatOpen)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              top: 120,
              child: Container(
                color: const Color(0xCC000000),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Padding(
                          padding: EdgeInsets.all(12),
                          child: Text('Session Chat', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                        IconButton(
                          onPressed: () => setState(() => _chatOpen = false),
                          icon: const Icon(Icons.close, color: Colors.white),
                        ),
                      ],
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _messages.length,
                        itemBuilder: (context, index) => Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          child: Text(_messages[index], style: const TextStyle(color: Colors.white)),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _chatInput,
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'Type message',
                                hintStyle: const TextStyle(color: Colors.white54),
                                filled: true,
                                fillColor: Colors.white12,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: _sendChat,
                            icon: const Icon(Icons.send, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          color: const Color(0xFF121212),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _ControlBtn(
                icon: _micOn ? Icons.mic : Icons.mic_off,
                label: _micOn ? 'Mute' : 'Unmute',
                active: _micOn,
                onTap: () async {
                  try {
                    await (_room as dynamic?)?.localParticipant?.setMicrophoneEnabled(!_micOn);
                  } catch (_) {}
                  setState(() => _micOn = !_micOn);
                },
              ),
              _ControlBtn(
                icon: _camOn ? Icons.videocam : Icons.videocam_off,
                label: _camOn ? 'Stop Cam' : 'Start Cam',
                active: _camOn,
                onTap: () async {
                  try {
                    await (_room as dynamic?)?.localParticipant?.setCameraEnabled(!_camOn);
                  } catch (_) {}
                  setState(() => _camOn = !_camOn);
                },
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
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: active ? AppColors.primaryGreen.withOpacity(0.15) : const Color(0xFF2A2A2A),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: active ? AppColors.primaryGreen : Colors.white54, size: 22),
          ),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(color: active ? AppColors.primaryGreen : Colors.white38, fontSize: 10)),
        ],
      ),
    );
  }
}

class _WhiteboardLayer extends StatefulWidget {
  final List<List<Offset>> strokes;
  final VoidCallback onClose;

  const _WhiteboardLayer({required this.strokes, required this.onClose});

  @override
  State<_WhiteboardLayer> createState() => _WhiteboardLayerState();
}

class _WhiteboardLayerState extends State<_WhiteboardLayer> {
  List<Offset> _current = [];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          Container(
            color: const Color(0xFF1E1E1E),
            padding: const EdgeInsets.fromLTRB(12, 10, 4, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Whiteboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    IconButton(
                      onPressed: () => setState(() => widget.strokes.clear()),
                      icon: const Icon(Icons.delete_outline, color: Colors.white70),
                    ),
                    IconButton(
                      onPressed: widget.onClose,
                      icon: const Icon(Icons.close, color: Colors.white70),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: GestureDetector(
              onPanStart: (d) => setState(() => _current = [d.localPosition]),
              onPanUpdate: (d) => setState(() => _current.add(d.localPosition)),
              onPanEnd: (_) => setState(() {
                if (_current.isNotEmpty) widget.strokes.add(List<Offset>.from(_current));
                _current = [];
              }),
              child: CustomPaint(
                painter: _StrokePainter([...widget.strokes, _current]),
                child: const SizedBox.expand(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StrokePainter extends CustomPainter {
  final List<List<Offset>> strokes;

  _StrokePainter(this.strokes);

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = Colors.black;

    for (final stroke in strokes) {
      if (stroke.length < 2) continue;
      final path = Path()..moveTo(stroke.first.dx, stroke.first.dy);
      for (var i = 1; i < stroke.length - 1; i++) {
        final p1 = stroke[i];
        final p2 = stroke[i + 1];
        final mid = Offset((p1.dx + p2.dx) / 2, (p1.dy + p2.dy) / 2);
        path.quadraticBezierTo(p1.dx, p1.dy, mid.dx, mid.dy);
      }
      final last = stroke.last;
      path.lineTo(last.dx, last.dy);
      canvas.drawPath(path, p);
    }
  }

  @override
  bool shouldRepaint(covariant _StrokePainter oldDelegate) => true;
}
