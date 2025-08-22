import mongoose from "mongoose";

const userProjectSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"Auth", required:true},
    projectId:{type:mongoose.Schema.Types.ObjectId, ref:"Project", required:true},
    perHourRate:{type:Number, required:true},
    status:{type:String, enum:["pending","approved","rejected"], default:"pending"},
}, { timestamps: true });

export const UserProject = mongoose.model("UserProject", userProjectSchema);
