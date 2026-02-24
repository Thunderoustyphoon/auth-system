import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { clearRefreshTokenCookie } from "../utils/token.utils.js";
import { HttpStatus } from "../constants/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET 
// req.user is already set by verifyJWT — no DB call needed here.

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      { user: req.user.toSafeObject() },
      "User profile fetched successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT method for update profile
// Both name and avatar are optional in the Zod schema (either or both can update).

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  // name is already trimmed + HTML-escaped by Zod
  // avatar is already trimmed + URL-validated by Zod

  const allowedUpdates = {};
  if (name !== undefined) allowedUpdates.name = name;
  if (avatar !== undefined) allowedUpdates.avatar = avatar;

  if (Object.keys(allowedUpdates).length === 0) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Please provide at least one field to update (name or avatar)"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  );

  return res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      { user: user.toSafeObject() },
      "Profile updated successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT method for password change

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  // Zod has already guaranteed: newPassword !== currentPassword, confirmNewPassword matches

  const user = await User.findById(req.user._id).select("+password");

  // OAuth-only users have no password field at all
  if (!user.password) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Your account uses social login (Google/GitHub) and has no password set. " +
      "Use 'Forgot Password' from the login page to create one."
    );
  }

  // try/catch: bcrypt.compare() throws (not just returns false) on a corrupted hash
  let isCurrentPasswordValid;
  try {
    isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
  } catch (bcryptError) {
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Error verifying current password. Please try again.",
      [],
      bcryptError.stack
    );
  }

  if (!isCurrentPasswordValid) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Your current password is incorrect");
  }

  // try/catch: bcrypt hash + DB write — critical path
  try {
    user.password = newPassword; // Mongoose pre-save hook hashes this
    user.refreshTokens = [];     // clear ALL sessions — security event
    await user.save();
  } catch (saveError) {
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Failed to update password. Please try again.",
      [],
      saveError.stack
    );
  }

  // Clear the cookie on this device too — user must log in again
  clearRefreshTokenCookie(res);

  return res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      null,
      "Password changed successfully. Please log in again with your new password."
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE 
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  // Password-based accounts require confirmation before deletion
  if (user.password) {
    if (!password) {
      // password is undefined/null — user didn't send it
      // Zod schema accepts undefined/null, but we require it for password accounts
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Please provide your password to confirm account deletion"
      );
    }

    // try/catch: bcrypt throws on corrupted hash
    let isPasswordValid;
    try {
      isPasswordValid = await user.isPasswordCorrect(password);
    } catch (bcryptError) {
      throw new ApiError(
        HttpStatus.INTERNAL,
        "Error verifying password. Please try again.",
        [],
        bcryptError.stack
      );
    }

    if (!isPasswordValid) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        "Incorrect password. Account deletion cancelled."
      );
    }
  }

  // try/catch: deletion is irreversible — fail loudly and clearly
  try {
    await User.findByIdAndDelete(req.user._id);
  } catch (deleteError) {
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Failed to delete account. Please try again.",
      [],
      deleteError.stack
    );
  }

  clearRefreshTokenCookie(res);

  return res.status(HttpStatus.OK).json(
    new ApiResponse(HttpStatus.OK, null, "Account permanently deleted. Goodbye! ")
  );
});

export { getCurrentUser, updateProfile, changePassword, deleteAccount };