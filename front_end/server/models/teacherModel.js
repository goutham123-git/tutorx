import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  institutionEmail: String,
  institutionName: String,
  isVerified: { type: Boolean, default: false },

  subjects: [String],
  experienceYears: Number,
  profilePic: String,
  bio: String,

}, { timestamps: true });

export default mongoose.model("Teacher", teacherSchema);