import { deleteBook } from "../controllers/bookController.js";
import BookModel from "../models/bookModel.js";

// Mock the BookModel to prevent actual database interaction
jest.mock("../models/bookModel.js");

describe("deleteBook Controller:", () => {
  it("should delete a book successfully:", async () => {
    const mockBookID = "12345";
    BookModel.findByIdAndDelete.mockResolvedValue({
      _id: mockBookID,
      title: "Mock Book",
    });
    const req = { params: { bookId: mockBookID } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Act
    await deleteBook(req, res);
    // Asserts
    expect(BookModel.findByIdAndDelete).toHaveBeenCalledWith(mockBookID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: `Book with ID ${mockBookID} deleted successfully.`,
    });
  });
  it("should return 404 if the book is not found", async () => {
    // Arrange
    const mockBookId = "67890";
    BookModel.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { bookId: mockBookId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Act
    await deleteBook(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Book not found. Please check the ID.",
    });
  });
});
