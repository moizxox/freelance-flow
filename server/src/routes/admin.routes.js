import express from "express";
import { addProject } from "../controllers/admin.controller.js";
const router = express.Router();

router.post("/add-project", addProject);
router.get("/all-projects", getAllProjects);
router.put("/update-project/:id", updateProject);
router.delete("/delete-project/:id", deleteProject);
router.post("/assign-freelancers", assignFreelancers);
router.get("/:projectId/freelancers", getAssignedFreelancers);
router.post("/remove-freelancer", removeFreelancer);

