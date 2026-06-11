import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env.js';

if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: `${config.backendUrl}/api/v1/auth/google/callback`,
        scope: ['profile', 'email'],
        state: false,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        console.log('[Google OAuth] profile received:', profile?.id, profile?.emails?.[0]?.value);
        done(null, profile);
      }
    )
  );
}

export default passport;
