import mongoose from "mongoose";

export const ConnectDB = async () => {
  try {
	const conn = await mongoose.connect(process.env.MONGO_URI);
	console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
	console.error(`Error: ${error.message}`.red.underline.bold);
	process.exit(1); // Exit with failure, 0 means succes s
  }
}