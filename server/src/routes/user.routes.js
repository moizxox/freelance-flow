import express from "express";
import { getUserProjects, addHoursToProject } from "../controllers/user.controller.js";
const router = express.Router();

router.get("/projects", getUserProjects);
router.post("/add-hours", addHoursToProject);

export default router;
