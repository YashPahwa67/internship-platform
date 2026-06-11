import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/resend-otp', otpLimiter, authController.resendOtp);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', otpLimiter, authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/email-change/request', authenticate, authController.requestEmailChange);
router.post('/email-change/confirm', authenticate, authController.confirmEmailChange);
router.delete('/account', authenticate, authController.deleteAccount);
router.get('/me', authenticate, authController.me);

// Google OAuth — only register routes when credentials are configured
if (config.google.clientId && config.google.clientSecret) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false, state: false }));
  router.get('/google/callback',
    (req, res, next) => {
      passport.authenticate('google', { session: false, state: false }, (err, user, info) => {
        if (err) { console.error('[Google OAuth] error:', err); return res.redirect(`${config.clientUrl}/login?error=oauth_failed`); }
        if (!user) { console.error('[Google OAuth] no user, info:', info); return res.redirect(`${config.clientUrl}/login?error=oauth_failed`); }
        req.user = user;
        next();
      })(req, res, next);
    },
    authController.googleCallback
  );
} else {
  router.get('/google', (_req, res) => {
    res.redirect(`${config.clientUrl}/login?error=google_not_configured`);
  });
}

export default router;
