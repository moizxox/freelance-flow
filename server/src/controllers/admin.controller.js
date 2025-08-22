import { Project } from "../models/projects.model.js";
import { Auth } from "../models/auth.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";
import { UserProject } from "../models/user-project.model.js";

// Add Project
// -----------
const addProject = asyncHandler(async (req, res, next) => {
  const { title, description, users } = req.body;

  if (!title || !description) return next(new CustomError(400, "Please provide all required fields"));

  const project = await Project.create({
    title,
    description,
    totalHours: 0,
  });

  if (!project) return next(new CustomError(400, "Error while creating project"));

  if (users && users.length > 0) {
    const validFreelancers = await Auth.find({
      _id: { $in: users.userId },
      role: "freelancer",
    });
    if (validFreelancers.length !== users.length) {
      return next(new CustomError(400, "One or more freelancer IDs are invalid"));
    }

    validFreelancers.map(async (f, i) => {
      const userProject = await UserProject.create({
        projectId: project._id,
        userId: f._id,
        perHourRate: users[i].perHourRate,
      });

      project.users.push(f._id);
      await project.save();
    });
  }

  return res.status(201).json({ success: true, message: "Project created successfully", data: project });
});

// Get All Projects
// ----------------
const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find().populate("users");
  return res.status(200).json({ success: true, data: projects });
});

// Update Project
// --------------
const updateProject = asyncHandler(async (req, res, next) => {
  const { title, description, users, projectId } = req.body;

  const project = await Project.findByIdAndUpdate(projectId);
  if (!project) return next(new CustomError(404, "Project not found"));

  if (title) project.title = title;
  if (description) project.description = description;

  if (users && users.length > 0) {
    const validFreelancers = await Auth.find({
      _id: { $in: users.userId },
      role: "freelancer",
    });
    if (validFreelancers.length !== users.length) {
      return next(new CustomError(400, "One or more freelancer IDs are invalid"));
    }

    validFreelancers.map(async (f, i) => {
      await UserProject.create({
        projectId: project._id,
        userId: f._id,
        perHourRate: users[i].perHourRate,
      });

      project.users.push(f._id);
    });
  }

  await project.save();

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
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
  const { projectId, users } = req.body;

  if (!projectId || !users || !Array.isArray(users)) {
    return next(new CustomError(400, "Project ID and an array of Freelancer IDs are required"));
  }

  const project = await Project.findById(projectId);
  if (!project) return next(new CustomError(404, "Project not found"));

  if (!users.length > 0) return next(new CustomError(400, "No freelancers provided"));

  const validFreelancers = await Auth.find({
    _id: { $in: users.userId },
    role: "freelancer",
  });
  if (validFreelancers.length !== users.length) {
    return next(new CustomError(400, "One or more freelancer IDs are invalid"));
  }

  validFreelancers.map(async (f, i) => {
    await UserProject.create({
      projectId: project._id,
      userId: f._id,
      perHourRate: users[i].perHourRate,
    });

    project.users.push(f._id);
  });

  await project.save();

  return res.status(200).json({
    success: true,
    message: "Freelancers assigned successfully",
    data: project,
  });
});

// Remove Freelancer
// -----------------
const removeFreelancer = asyncHandler(async (req, res, next) => {
  const { projectId, freelancerId } = req.body;

  if (!projectId || !freelancerId) {
    return next(new CustomError(400, "Project ID and Freelancer ID are required"));
  }

  const project = await Project.findById(projectId);
  if (!project) return next(new CustomError(404, "Project not found"));

  const freelancer = await Auth.findById(freelancerId);
  if (!freelancer || freelancer.role !== "freelancer") return next(new CustomError(404, "Freelancer not found"));

  const userProject = await UserProject.findOne({ projectId, userId: freelancerId });
  if (!userProject) return next(new CustomError(404, "User not found for this project"));

  userProject.remove();

  project.users.pull(freelancerId);
  await project.save();

  return res.status(200).json({
    success: true,
    message: "Freelancer removed successfully",
    data: project,
  });
});

export { addProject, getAllProjects, updateProject, deleteProject, assignFreelancers, getAssignedFreelancers, removeFreelancer };
