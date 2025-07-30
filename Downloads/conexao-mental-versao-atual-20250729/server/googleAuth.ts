import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Configure Google OAuth strategy only if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user is trying to login as professional
      const email = profile.emails?.[0]?.value || '';
      const professional = await storage.getProfessionalByEmail(email);
      
      let role = 'patient'; // Default role
      
      // If professional exists and is approved, allow professional login
      if (professional && professional.approved) {
        role = 'professional';
      }
      
      const user = await storage.createOrUpdateGoogleUser({
        google_id: profile.id,
        email: email,
        full_name: profile.displayName || '',
        role: role
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;