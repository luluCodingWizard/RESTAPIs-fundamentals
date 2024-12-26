import mongoose from "mongoose";

// define the Schema

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  read: { type: Boolean, default: false },
});

// create a Model

const BookModel = mongoose.model("BookModel", bookSchema);

export default BookModel;
