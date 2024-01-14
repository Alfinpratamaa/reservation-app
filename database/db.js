import mongoose from "mongoose";

const connectDB = async (MONGO_URI) => {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

export default connectDB;
