import express from "express";
import { body } from "express-validator";
import passport from "../config/passport";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController";
import { protect, validateRefreshToken } from "../middleware/auth";
import { UserRole } from "../types";
import { generateTokenPair } from "../utils/jwt";

const router = express.Router();

// Validation rules
const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("role")
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage("Invalid role specified"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  body("address.street")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Street address must be between 5 and 100 characters"),
  body("address.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("address.state")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("address.zipCode")
    .optional()
    .trim()
    .isPostalCode("any")
    .withMessage("Please provide a valid zip code"),
  body("address.country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  body("address.street")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Street address must be between 5 and 100 characters"),
  body("address.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("address.state")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("address.zipCode")
    .optional()
    .trim()
    .isPostalCode("any")
    .withMessage("Please provide a valid zip code"),
  body("address.country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
  body("profileImage")
    .optional()
    .isURL()
    .withMessage("Profile image must be a valid URL"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh-token", validateRefreshToken, refreshToken);

// Protected routes
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAll);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileValidation, updateProfile);
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword
);

// OAuth Routes

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req: any, res) => {
    try {
      const user = req.user;

      // Generate JWT tokens
      const tokenPair = generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token to user
      user.refreshTokens.push(tokenPair.refreshToken);
      user.lastLogin = new Date();
      await user.save();

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${tokenPair.accessToken}&refreshToken=${tokenPair.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
  }
);

// Facebook OAuth
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/facebook/callback",
  (req, res, next) => {
    console.log("Facebook callback received:", req.query);
    passport.authenticate("facebook", {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`,
    })(req, res, next);
  },
  async (req: any, res) => {
    try {
      console.log(
        "Facebook OAuth callback - User authenticated:",
        req.user ? "Yes" : "No"
      );

      if (!req.user) {
        console.error("No user found in Facebook OAuth callback");
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      const user = req.user;
      console.log("Facebook OAuth user:", {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      // Generate JWT tokens
      const tokenPair = generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token to user
      user.refreshTokens.push(tokenPair.refreshToken);
      user.lastLogin = new Date();
      await user.save();

      console.log("Facebook OAuth - Tokens generated, redirecting to frontend");

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${tokenPair.accessToken}&refreshToken=${tokenPair.refreshToken}`;
      console.log("Redirecting to:", redirectUrl);

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Facebook OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
  }
);

export default router;
