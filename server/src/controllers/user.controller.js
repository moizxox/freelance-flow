import { isValidObjectId } from "mongoose";
import { Project } from "../models/projects.model.js";
import { Auth } from "../models/auth.model.js";
import { UserProject } from "../models/user-project.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";
import { UserPrice } from "../models/user-pricing.model.js";

const conversionRate = 254;

//Add Hours To Project
// -------------------
const addHoursToProject = asyncHandler(async (req, res, next) => {
  const { projectId, hours } = req.body;
  const userId = req.user._id; // Get user ID from authenticated token

  if (!hours || !projectId || !userId) return next(new CustomError(400, "Please Provide All Fields"));

  if (!isValidObjectId(projectId)) return next(new CustomError(400, "Invalid Project Id"));
  if (!isValidObjectId(userId)) return next(new CustomError(400, "Invalid User Id"));

  const project = await Project.findById(projectId);
  if (!project) return next(new CustomError(404, "Project Not Found"));

  const user = await Auth.findById(userId);
  if (!user) return next(new CustomError(404, "User Not Found"));

  const userForProject = await UserProject.findOne({ projectId, userId });
  if (!userForProject) return next(new CustomError(404, "User Not Found For This Project"));

  const hourRate = userForProject.perHourRate;
  const amount = hourRate * hours;
  const pkrAmount = amount * conversionRate;

  project.totalHours += hours;
  await project.save();

  const userInPayment = await UserPrice.findOne({ userId });
  if (!userInPayment) return next(new CustomError(404, "User Not Found In Payment"));
  userInPayment.payment.push({
    project: projectId,
    hours,
    payment: {
      usdPrice: amount,
      pkrPrice: pkrAmount,
    },
    status: "pending",
    date: new Date(),
  });
  await userInPayment.save();

  return res.status(200).json({ success: true, message: "Hours added successfully" });
});

//Get User Projects
// ----------------
const getUserProjects = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Get user ID from authenticated token

  // Get all projects where the user is assigned
  const userProjects = await UserProject.find({ userId }).populate({
    path: "projectId",
    select: "title description totalHours",
    populate: {
      path: "users",
      select: "firstName lastName email",
      match: { _id: userId },
    },
  });

  if (!userProjects || userProjects.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No projects found for this user",
      data: [],
    });
  }

  // Format the response
  const formattedProjects = userProjects.map((up) => ({
    _id: up.projectId._id,
    title: up.projectId.title,
    description: up.projectId.description,
    totalHours: up.projectId.totalHours,
    perHourRate: up.perHourRate,
    assignedAt: up.createdAt,
  }));

  return res.status(200).json({
    success: true,
    data: formattedProjects,
  });
});

//Get User Payments
// ----------------
const getUserPaymentsDetails = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Get user ID from authenticated token

  const paymentDetails = await UserPrice.find({ userId }).populate({
    path: "project",
    select: "title description totalHours",
    populate: {
      path: "users",
      select: "firstName lastName email",
      match: { _id: userId },
    },
  });

  return res.status(200).json({
    success: true,
    data: paymentDetails,
  });
});

const getUserPayments = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Get user ID from authenticated token

  const payments = await UserPrice.find({ userId }).populate({
    path: "project",
    select: "title description totalHours",
    populate: {
      path: "users",
      select: "firstName lastName email",
      match: { _id: userId },
    },
  });

  const totalHours = payments.reduce((total, payment) => total + (payment.hours || 0), 0);
  const totalAmount = payments.reduce((total, payment) => total + (payment.payment?.usdPrice || 0), 0);
  const totalPkrAmount = payments.reduce((total, payment) => total + (payment.payment?.pkrPrice || 0), 0);

  return res.status(200).json({
    success: true,
    data: {
      payments,
      summary: {
        totalHours,
        totalAmount,
        totalPkrAmount,
      },
    },
  });
});

export { addHoursToProject, getUserProjects, getUserPaymentsDetails, getUserPayments };
