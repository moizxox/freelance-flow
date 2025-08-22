import express from "express";
import {
  forgetPassword,
  getMyProfile,
  login,
  logout,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.route("/me").get(isAuthenticated, getMyProfile);

export default router;
