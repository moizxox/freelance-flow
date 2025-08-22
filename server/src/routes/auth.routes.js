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

const app = express.Router();

app.post("/register", register);
app.post("/login", login);
app.get("/logout", isAuthenticated, logout);
app.post("/forget-password", forgetPassword);
app.post("/reset-password", resetPassword);
app.route("/me").get(isAuthenticated, getMyProfile);

export default app;
