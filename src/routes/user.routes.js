import { Router } from "express";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "../validators/user.validators.js";

const router = Router();

router.use(verifyJWT);

router.route("/profile")
  .get(getCurrentUser)
  .put(validate(updateProfileSchema), updateProfile);

router.route("/change-password").put(validate(changePasswordSchema), changePassword);
router.route("/account").delete(validate(deleteAccountSchema), deleteAccount);

export default router;
