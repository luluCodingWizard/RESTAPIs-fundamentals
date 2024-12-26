import Joi from "joi";
import BookModel from "../models/bookModel.js";

// Joi Schema for Query validation

const querySchema = Joi.object({
  genre: Joi.string().min(2).max(50).optional().messages({
    "string.base": "Genre must be a string.",
    "string.min": "Genre must have at least 2 characters.",
    "string.max": "Genre must not exceed 50 characters.",
  }),
  author: Joi.string().min(2).max(50).optional().messages({
    "string.base": "Author must be a string.",
    "string.min": "Author must have at least 2 characters.",
    "string.max": "Author must not exceed 50 characters.",
  }),
  title: Joi.string().optional().messages({
    "string.base": "Title must be a string.",
  }),
});

export const getBooks = async (req, res) => {
  try {
    // Validate the query params using Joi
    const { error, value } = querySchema.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      // send error response with validation details
      return res.status(400).json({
        success: false,
        message: "Validation failed!",
        errors: error.details.map((err) => err.message),
      });
    }
    // initialize an empty query object
    const query = {};

    // destructure the query paramter from the request
    const { genre, author, title } = value;

    // dynamically add filters if a specific query param exist

    if (genre) {
      query.genre = genre;
    }
    if (author) {
      query.author = author;
    }
    if (title) {
      // Case-insensitive partial match for the title
      query.title = { $regex: title, $options: "i" };
    }

    const limit = parseInt(req.query.limit) || 10; // Default 10 items per page
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const skip = (page - 1) * limit;
    const books = await BookModel.find(query).limit(limit).skip(skip); // fetch all books from the database

    // Add hypermedia links to each book
    const booksWithLinks = books.map((book) => ({
      ...book.toJSON(),
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/books/${book._id}`,
          method: "GET",
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/books/${book._id}`,
          method: "PUT",
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/books/${book._id}`,
          method: "DELETE",
        },
      ],
    }));

    // res.status(200).json({
    //   success: true,
    //   data: books,
    // }); // response with the list of books in JSON format

    // Respond with hypermedia-enhanced data
    res.status(200).json({
      count: booksWithLinks.length,
      data: booksWithLinks,
      links: [
        {
          rel: "create",
          href: `${req.protocol}://${req.get("host")}/api/books`,
          method: "POST",
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching books.",
    });
  }
};

// get book by ID
export const getBookById = async (req, res) => {
  try {
    // Extract the book id from the route param
    const { bookId } = req.params;

    // fetch the book from the database
    const book = await BookModel.findById(bookId);

    // check if the book exist
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with id of ${bookId} not found`,
      });
    }

    // respond with the book data
    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Error fetching book by ID:", error.message);

    // Handle invalid IDs or other errors
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the book.",
    });
  }
};

// POST calls

export const addBook = async (req, res) => {
  try {
    const { title, author } = req.body;
    // validation
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and author!",
      });
    }

    // create a new book

    const newBook = new BookModel({ title, author });

    // save to database
    await newBook.save();

    res.status(201).json({
      success: true,
      message: "book Added!",
      data: newBook,
    });
  } catch (error) {
    console.error("Error adding book:", error.message);

    res.status(500).json({
      success: false,
      message: "An error occurred while adding the book.",
    });
  }
};

export const updateBook = async (req, res) => {
  try {
    // get the book ID
    const { bookId } = req.params;
    // get the updated fields from the req body
    const { title, author, genre } = req.body;
    // validate
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, author.",
      });
    }
    // find and update the book by ID

    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      { title, author, genre },
      { new: true, runValidators: true }
    );

    // if the book is not found
    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found. Please check the ID.",
      });
    }

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Book updated successfully!",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error.message);

    res.status(500).json({
      success: false,
      message: "An error occurred while updating the book.",
    });
  }
};

export const patchBook = async (req, res) => {
  try {
    // get the book ID
    const { bookId } = req.params;
    // get the updates
    const updates = req.body;

    // Validate that there’s at least one field to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    // find and update the book
    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      updates, // Only update the fields provided
      { new: true, runValidators: true } // Return the updated document and validate inputs
    );

    // If the book isn't found
    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found. Please check the ID.",
      });
    }

    // Respond with the updated book
    res.status(200).json({
      success: true,
      message: "Book updated successfully!",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error.message);

    res.status(500).json({
      success: false,
      message: "An error occurred while updating the book.",
    });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params; // Grab the book ID from the URL

    // Try to find and delete the book
    const deletedBook = await BookModel.findByIdAndDelete(bookId);

    // If no book is found, send a 404
    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found. Please check the ID.",
      });
    }

    // Respond with success
    res.status(200).json({
      success: true,
      message: `Book with ID ${bookId} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting book:", error.message);

    res.status(500).json({
      success: false,
      message: "An error occurred while trying to delete the book.",
    });
  }
};
