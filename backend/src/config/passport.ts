import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User";
import { OAuthProvider, UserRole } from "../types";

// Initialize OAuth strategies only if credentials are provided
console.log("Initializing Passport OAuth strategies...");
console.log(
  "Google Client ID:",
  process.env.GOOGLE_CLIENT_ID ? "✓ Present" : "✗ Missing"
);
console.log(
  "Google Client Secret:",
  process.env.GOOGLE_CLIENT_SECRET ? "✓ Present" : "✗ Missing"
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log("✓ Initializing Google OAuth strategy");
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? "/api/auth/google/callback"
            : "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({
            $or: [
              { "providerData.googleId": profile.id },
              { email: profile.emails?.[0]?.value },
            ],
          });

          if (user) {
            // Update existing user with Google data if not already set
            if (!user.providerData?.googleId) {
              user.provider = OAuthProvider.GOOGLE;
              user.providerId = profile.id;
              user.providerData = {
                ...user.providerData,
                googleId: profile.id,
                picture: profile.photos?.[0]?.value,
                locale: profile._json.locale,
              };
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          const newUser = await User.create({
            firstName: profile.name?.givenName || "Unknown",
            lastName: profile.name?.familyName || "User",
            email: profile.emails?.[0]?.value || "",
            provider: OAuthProvider.GOOGLE,
            providerId: profile.id,
            providerData: {
              googleId: profile.id,
              picture: profile.photos?.[0]?.value,
              locale: profile._json.locale,
            },
            role: UserRole.CLIENT,
            isEmailVerified: true, // Google emails are verified
            profileImage: profile.photos?.[0]?.value,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, undefined);
        }
      }
    )
  );
} else {
  console.log("✗ Google OAuth strategy not initialized - missing credentials");
}

console.log(
  "Facebook App ID:",
  process.env.FACEBOOK_APP_ID ? "✓ Present" : "✗ Missing"
);
console.log(
  "Facebook App Secret:",
  process.env.FACEBOOK_APP_SECRET ? "✓ Present" : "✗ Missing"
);

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  console.log("✓ Initializing Facebook OAuth strategy");
  // Facebook OAuth Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? "/api/auth/facebook/callback"
            : "http://localhost:5000/api/auth/facebook/callback",
        profileFields: [
          "id",
          "emails",
          "name",
          "picture.type(large)",
          "displayName",
        ],
        enableProof: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(
            "Facebook OAuth Profile:",
            JSON.stringify(profile, null, 2)
          );

          // Extract email from profile
          const email = profile.emails?.[0]?.value;

          // Check if user already exists with this Facebook ID or email
          let user = await User.findOne({
            $or: [
              { "providerData.facebookId": profile.id },
              ...(email ? [{ email: email }] : []),
            ],
          });

          if (user) {
            // Update existing user with Facebook data if not already set
            if (!user.providerData?.facebookId) {
              user.provider = OAuthProvider.FACEBOOK;
              user.providerId = profile.id;
              user.providerData = {
                ...user.providerData,
                facebookId: profile.id,
                picture: profile.photos?.[0]?.value,
              };
              // Update email if we have one and user doesn't
              if (email && !user.email) {
                user.email = email;
              }
              await user.save();
            }
            return done(null, user);
          }

          // Generate fallback email if Facebook doesn't provide one
          const fallbackEmail = email || `facebook_${profile.id}@ltocms.local`;

          // Create new user
          const newUser = await User.create({
            firstName:
              profile.name?.givenName ||
              profile.displayName?.split(" ")[0] ||
              "Facebook",
            lastName:
              profile.name?.familyName ||
              profile.displayName?.split(" ").slice(1).join(" ") ||
              "User",
            email: fallbackEmail,
            provider: OAuthProvider.FACEBOOK,
            providerId: profile.id,
            providerData: {
              facebookId: profile.id,
              picture: profile.photos?.[0]?.value,
            },
            role: UserRole.CLIENT,
            isEmailVerified: !!email, // Only verified if Facebook provided real email
            profileImage: profile.photos?.[0]?.value,
          });

          return done(null, newUser);
        } catch (error) {
          console.error("Facebook OAuth Error:", error);
          return done(error, undefined);
        }
      }
    )
  );
} else {
  console.log(
    "✗ Facebook OAuth strategy not initialized - missing credentials"
  );
}

console.log("Passport OAuth initialization complete");

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
