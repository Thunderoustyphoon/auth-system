import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { OAuthProviders } from "../constants/index.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Extract email with fallback handling
        let email = null;
        if (profile.emails && Array.isArray(profile.emails) && profile.emails.length > 0) {
          email = profile.emails[0].value?.toLowerCase();
        }
        
        if (!email) {
          console.error("❌ Google OAuth: No email in profile", { emails: profile.emails });
          return done(new Error("No email returned from Google. Please ensure email is public in your Google account."), null);
        }
        
        console.log(`✅ Google OAuth: Email extracted - ${email}`);

        // Search by email (Google always provides a verified email)
        let user = await User.findOne({ email });

        if (user) {
          // User exists — ensure Google is linked and email is marked verified
          const alreadyLinked = user.oauthProviders.some(
            (p) => p.provider === OAuthProviders.GOOGLE && p.providerId === profile.id
          );

          let needsSave = false;

          if (!alreadyLinked) {
            user.oauthProviders.push({
              provider: OAuthProviders.GOOGLE,
              providerId: profile.id,
              displayName: profile.displayName,
            });
            needsSave = true;
          }

          // (user may have registered with email/password and never verified)
          if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            needsSave = true;
          }

          if (needsSave) {
            await user.save({ validateBeforeSave: false });
          }
        } else {
          // New user — create with Google profile data
          user = await User.create({
            name: profile.displayName || "Google User",
            email,
            avatar: profile.photos?.[0]?.value ?? null,
            isEmailVerified: true, // Google already verified this email
            oauthProviders: [
              {
                provider: OAuthProviders.GOOGLE,
                providerId: profile.id,
                displayName: profile.displayName,
              },
            ],
          });
          console.log(`✅ Google OAuth: New user created - ${user.email}`);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
