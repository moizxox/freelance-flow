import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      hourlyRates: {
        usd: { type: Number, required: true }
      },
      status: { 
        type: String, 
        enum: ["active", "completed", "on-hold", "cancelled"], 
        default: "active" 
      },
      assignedFreelancers: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Auth" }
      ],
      totalHours:{type:Number, default:0},
    },
    { timestamps: true }
  );
  

export const Project = mongoose.model("Project", projectSchema);
