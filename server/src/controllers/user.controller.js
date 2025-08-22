import { Project } from "../models/projects.model.js";
import { Auth } from "../models/auth.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";


//Add Hours To Project
// -------------------
const addHoursToProject = asyncHandler(async (req, res, next) => {
  const { projectId, hours,userId } = req.body;

  if (!projectId || !hours) {
    return next(new CustomError(400, "Project ID and Hours are required"));
  }
const user = await Auth.findById(userId);
const project = await Project.findById(projectId);
if (!user) return next(new CustomError(404, "User not found"));
if (!project) return next(new CustomError(404, "Project not found"));

if(!project?.assignedFreelancers?.includes(userId)) return next(new CustomError(400, "User is not assigned to this project"));

project.totalHours += hours;
await project.save();

user.payment.push({
  project: projectId,
  hours,
  date: new Date()
});
await user.save();

  return res.status(200).json({
    success: true,
    message: "Hours added successfully",
    data: {project,user}
  });
});

//Get User Projects
// ---------------- 
const getUserProjects = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;
    if(!isValidObjectId(userId)) return next(new CustomError(400, "Invalid User Id"));
const projects = await Project.find({ assignedFreelancers: userId }).populate("assignedFreelancers", "name email ");
return res.status(200).json({ success: true, data: projects });
});