import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bookRouter from "./routes/bookRoutes.js";
export const app = express();

// Middleware to parse JSON
app.use(express.json());

// Use CORS middleware
app.use(cors());
app.use(bodyParser.json());

// Mount the bookRouter
app.use("/api", bookRouter);

// connect to mongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/bookAPI", {
    useNewUrlParser: true, // Ensures compatibility with the MongoDB connection string parser
    useUnifiedTopology: true, // Enables the new MongoDB driver connection engine
  })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`running server on port: ${port}`);
});
