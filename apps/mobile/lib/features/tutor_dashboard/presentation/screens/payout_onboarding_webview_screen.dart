import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PayoutOnboardingWebViewScreen extends StatefulWidget {
  final String url;

  const PayoutOnboardingWebViewScreen({super.key, required this.url});

  @override
  State<PayoutOnboardingWebViewScreen> createState() => _PayoutOnboardingWebViewScreenState();
}

class _PayoutOnboardingWebViewScreenState extends State<PayoutOnboardingWebViewScreen> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            if (mounted) setState(() => _loading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payout Onboarding'),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
