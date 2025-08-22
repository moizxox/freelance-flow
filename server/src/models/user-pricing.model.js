import mongoose from "mongoose";

const userPricingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    payment: [
      {
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
          required: true,
        },
        hours: { type: Number, required: true },
        payment: {
          usdPrice: { type: Number, required: true },
          pkrPrice: { type: Number, required: true },
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        date: { type: Date, default: Date.now },
      },
    ],
    paid: [
      {
        paidAmount: {
          usdPrice: { type: Number, required: true },
          pkrPrice: { type: Number, required: true },
        },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const UserPrice = mongoose.model("UserPrice", userPricingSchema);
