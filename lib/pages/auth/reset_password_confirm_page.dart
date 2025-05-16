import 'package:flutter/material.dart';
import 'package:appdev_md/widgets/auth_text_field.dart';
import 'package:appdev_md/widgets/auth_button.dart';
import 'package:appdev_md/services/api_service.dart';
import 'package:appdev_md/utils/logger.dart';

class ResetPasswordConfirmPage extends StatefulWidget {
  final String uid;
  final String token;

  const ResetPasswordConfirmPage({
    super.key,
    required this.uid,
    required this.token,
  });

  @override
  State<ResetPasswordConfirmPage> createState() => _ResetPasswordConfirmPageState();
}

class _ResetPasswordConfirmPageState extends State<ResetPasswordConfirmPage> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;
  bool _isSuccess = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
    // Initialize services
    _apiService = ApiService(baseUrl: 'http://10.0.2.2:8000');

    // Log the received token and UID for debugging
    Logger.debug('Reset password page initialized with UID: ${widget.uid}, Token: ${widget.token}');
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Call the API to reset the password
      await _apiService.post(
        'api/auth/password/reset/confirm/',
        {
          'uid': widget.uid,
          'token': widget.token,
          'new_password1': _passwordController.text,
          'new_password2': _confirmPasswordController.text,
        },
        requiresAuth: false,
      );

      // Password reset successful
      setState(() {
        _isSuccess = true;
        _isLoading = false;
      });
    } catch (e) {
      Logger.error('Error resetting password', e);
      setState(() {
        _isLoading = false;
        if (e.toString().contains('token')) {
          _errorMessage = 'Invalid or expired token. Please request a new password reset link.';
        } else if (e.toString().contains('password')) {
          _errorMessage = 'Password is too weak. Use at least 8 characters with numbers and letters.';
        } else {
          _errorMessage = 'Failed to reset password. Please try again.';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reset Password'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: _isSuccess
                ? _buildSuccessView()
                : _buildResetPasswordForm(),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(
          Icons.check_circle_outline,
          color: Colors.green,
          size: 80,
        ),
        const SizedBox(height: 24),
        Text(
          'Password Reset Successful',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        const Text(
          'Your password has been reset successfully. You can now log in with your new password.',
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        AuthButton(
          text: 'Go to Login',
          onPressed: () {
            Navigator.pushNamedAndRemoveUntil(
              context,
              '/login',
              (route) => false,
            );
          },
        ),
      ],
    );
  }

  Widget _buildResetPasswordForm() {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Create New Password',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            'Enter your new password below',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          AuthTextField(
            controller: _passwordController,
            hintText: 'New Password',
            prefixIcon: Icons.lock,
            isPassword: _obscurePassword,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a password';
              }
              if (value.length < 8) {
                return 'Password must be at least 8 characters';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          AuthTextField(
            controller: _confirmPasswordController,
            hintText: 'Confirm Password',
            prefixIcon: Icons.lock,
            isPassword: _obscureConfirmPassword,
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
              ),
              onPressed: () {
                setState(() {
                  _obscureConfirmPassword = !_obscureConfirmPassword;
                });
              },
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please confirm your password';
              }
              if (value != _passwordController.text) {
                return 'Passwords do not match';
              }
              return null;
            },
          ),
          if (_errorMessage != null)
            Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Text(
                _errorMessage!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
                textAlign: TextAlign.center,
              ),
            ),
          const SizedBox(height: 32),
          AuthButton(
            text: 'Reset Password',
            isLoading: _isLoading,
            onPressed: _resetPassword,
          ),
        ],
      ),
    );
  }
}
