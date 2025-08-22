import cookieParser from "cookie-parser";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import AuthRoutes from "./routes/auth.routes.js";
import cors from "cors";

const app = express();

// middlewares
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://smart-parking-frontend-mauve.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.get("/", (req, res) => res.status(200).json({ success: true, message: "Hello World!" }));
app.use("/api/auth", AuthRoutes);
app.use('/freelancer',()=>{
  return res.status(200).json({ success: true, message: "Hello Freelancer!" });
})
app.use('/admin',()=>{
  return res.status(200).json({ success: true, message: "Hello Admin!" });
})

// error handler
app.use(errorHandler);

export default app;
