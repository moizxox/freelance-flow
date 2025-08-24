import express from "express";
import { addProject, getAllProjects, updateProject, deleteProject, assignFreelancers, removeFreelancer } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/add", addProject);
router.get("/all", getAllProjects);
router.put("/update", updateProject);
router.delete("/delete/:id", deleteProject);
router.post("/assign-freelancers", assignFreelancers);
router.post("/remove-freelancer", removeFreelancer);

export default router;
