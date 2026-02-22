import jwt from "jsonwebtoken"; // for access token
import {v4 as uuidv4} from "uuid"; // for refresh token

// Generating Access Token
const generateAccessToken = (user)=>{    //we are passing a parameter for future use
    return jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
)
};

// Generating Refresh token
const generateRefreshToken = ()=> uuidv4();

// cookie options
// ── Cookie options helper ─────────────────────────────────────────────────────
const cookieOptions = () => ({
  httpOnly: true,                                        // not accessible via JS
  secure: process.env.NODE_ENV === "production",         // HTTPS only in prod
  sameSite: "strict",                                    // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,                      // 7 days in ms
});

const sendRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, cookieOptions());
};

// to remove the cookie we have to use the same options we used while setting it
const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

// ── Email / Reset tokens ──────────────────────────────────────────────────────
// Random UUID used in verification and password-reset links.
const generateSecureToken = () => uuidv4();

export {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshTokenCookie,
  clearRefreshTokenCookie,
  generateSecureToken,
};
