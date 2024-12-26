import mongoose from "mongoose";
import BookModel from "./models/bookModel.js";

// connect to mongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/bookAPI", {
    useNewUrlParser: true, // Ensures compatibility with the MongoDB connection string parser
    useUnifiedTopology: true, // Enables the new MongoDB driver connection engine
  })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Sample data
const books = [
  { title: "Book One", author: "Author A", genre: "Fiction", read: true },
  { title: "Book Two", author: "Author B", genre: "Non-Fiction", read: false },
];

// insert Mock data to our database

BookModel.insertMany(books)
  .then(() => {
    console.log("Mock data Seeded!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("could not seed the Database!!!", err));
