import express from "express";
import {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  patchBook,
  deleteBook,
} from "../controllers/bookController.js";
// create a router
const bookRouter = express.Router();

// add a GET route for /api/books
bookRouter.route("/books").get(getBooks).post(addBook);

bookRouter
  .route("/books/:bookId")
  .get(getBookById)
  .put(updateBook)
  .patch(patchBook)
  .delete(deleteBook);

// export the Router
export default bookRouter;
