import { Project } from "../models/projects.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";

// Add Project
// -----------
const addProject = asyncHandler(async (req, res, next) => {
  const { title, description, hourlyUSD, freelancersId } = req.body;

  if (!title || !description || !hourlyUSD) {
    return next(new CustomError(400, "Please provide all required fields"));
  }

  // If freelancers are passed, validate them
  let validFreelancers = [];
  if (freelancersId && freelancersId.length > 0) {
    validFreelancers = await User.find({
      _id: { $in: freelancersId },
      role: "freelancer"
    });
    if (validFreelancers.length !== freelancersId.length) {
      return next(new CustomError(400, "One or more freelancer IDs are invalid"));
    }
  }

  const project = await Project.create({
    title,
    description,
    hourlyUSD,
    assignedFreelancers: validFreelancers.map(f => f._id)
  });

  return res.status(201).json({
    success: true,
    message: "Project added successfully",
    data: project
  });
});

// Get All Projects
// ----------------
const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find().populate("assignedFreelancers", "name email role");
  return res.status(200).json({ success: true, data: projects });
});

// Update Project
// --------------
const updateProject = asyncHandler(async (req, res, next) => {
  const { title, description, hourlyUSD, freelancersId } = req.body;

  if (!title || !description || !hourlyUSD) {
    return next(new CustomError(400, "Please provide all required fields"));
  }

  let validFreelancers = [];
  if (freelancersId && freelancersId.length > 0) {
    validFreelancers = await User.find({
      _id: { $in: freelancersId },
      role: "freelancer"
    });
    if (validFreelancers.length !== freelancersId.length) {
      return next(new CustomError(400, "One or more freelancer IDs are invalid"));
    }
  }

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      hourlyUSD,
      assignedFreelancers: validFreelancers.map(f => f._id)
    },
    { new: true }
  ).populate("assignedFreelancers", "name email role");

  if (!project) {
    return next(new CustomError(404, "Project not found"));
  }

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project
  });
});

// Delete Project
// --------------
const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return next(new CustomError(404, "Project not found"));
  return res.status(200).json({ success: true, message: "Project deleted successfully" });
});

// Assign Freelancers
// ------------------
const assignFreelancers = asyncHandler(async (req, res, next) => {
  const { projectId, freelancersId } = req.body;

  if (!projectId || !freelancersId || !Array.isArray(freelancersId)) {
    return next(new CustomError(400, "Project ID and an array of Freelancer IDs are required"));
  }

  // Validate freelancer IDs
  const validFreelancers = await User.find({
    _id: { $in: freelancersId },
    role: "freelancer"
  });

  if (validFreelancers.length !== freelancersId.length) {
    return next(new CustomError(400, "One or more freelancer IDs are invalid"));
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { assignedFreelancers: { $each: freelancersId } } },
    { new: true }
  ).populate("assignedFreelancers", "name email role");

  if (!project) {
    return next(new CustomError(404, "Project not found"));
  }

  return res.status(200).json({
    success: true,
    message: "Freelancers assigned successfully",
    data: project
  });
});

// Get Assigned Freelancers
// ------------------------
const getAssignedFreelancers = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId).populate("assignedFreelancers", "name email");
  if (!project) return next(new CustomError(404, "Project not found"));
  return res.status(200).json({ success: true, data: project.assignedFreelancers });
});

// Remove Freelancer
// -----------------
const removeFreelancer = asyncHandler(async (req, res, next) => {
  const { projectId, freelancerId } = req.body;

  if (!projectId || !freelancerId) {
    return next(new CustomError(400, "Project ID and Freelancer ID are required"));
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { $pull: { assignedFreelancers: freelancerId } },
    { new: true }
  ).populate("assignedFreelancers", "name");

  if (!project) {
    return next(new CustomError(404, "Project not found"));
  }

  return res.status(200).json({
    success: true,
    message: "Freelancer removed successfully",
    data: project
  });
});

export {
  addProject,
  getAllProjects,
  updateProject,
  deleteProject,
  assignFreelancers,
  getAssignedFreelancers,
  removeFreelancer
};
