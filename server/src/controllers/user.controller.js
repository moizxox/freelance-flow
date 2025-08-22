import { isValidObjectId } from "mongoose";
import { Project } from "../models/projects.model.js";
import { Auth } from "../models/auth.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";

const conversionRate = 254;

//Add Hours To Project
// -------------------
const addHoursToProject = asyncHandler(async (req, res, next) => {
  const { projectId, hours, userId } = req.body;

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
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return next(new CustomError(400, "Invalid User Id"));
  const projects = await UserProject.find({ userId }).populate("project", "title perHourRate");
  return res.status(200).json({ success: true, data: projects });
});

//Get User Payments
// ----------------
const getUserPaymentsDetails = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return next(new CustomError(400, "Invalid User Id"));
  const user = await Auth.findById(userId);
  if (!user) return next(new CustomError(404, "User Not Found"));

  const paymentDetails = await UserPrice.find({ userId }).populate("project", "title perHourRate");

  return res.status(200).json({ success: true, data: paymentDetails });
});

const getUserPayments = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return next(new CustomError(400, "Invalid User Id"));
  const user = await Auth.findById(userId);
  if (!user) return next(new CustomError(404, "User Not Found"));

  const payments = await UserPrice.find({ userId }).populate("project", "title perHourRate");

  const totalHours = payments.reduce((total, payment) => total + payment.hours, 0);
  const totalAmount = payments.reduce((total, payment) => total + payment.payment.usdPrice, 0);
  const totalPkrAmount = payments.reduce((total, payment) => total + payment.payment.pkrPrice, 0);

  return res.status(200).json({ success: true, data: payments });
});

export { addHoursToProject, getUserProjects, getUserPaymentsDetails, getUserPayments };
