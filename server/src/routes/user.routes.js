import express from "express";
import { 
  getUserProjects, 
  addHoursToProject, 
  getUserPaymentsDetails, 
  getUserPayments 
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply isAuthenticated middleware to all user routes
router.use(isAuthenticated);

// Project related routes
router.get("/projects", getUserProjects);
router.post("/add-hours", addHoursToProject);

// Payment related routes
router.get("/payments", getUserPayments);
router.get("/payments/details", getUserPaymentsDetails);

export default router;
