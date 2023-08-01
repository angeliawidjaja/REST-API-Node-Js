const { nanoid } = require('nanoid');
const books = require('./books');

// #region Utils
const handleErrorObject = (status, message) => {
  const error = new Error(message);
  error.code = status;
  return error;
};

const showErrorResponse = (error, h) => {
  const errorResponseBody = {
    status: 'fail',
    message: error.message,
  };

  const errorResponse = h.response(errorResponseBody);
  errorResponse.code(error.code);
  return errorResponse;
};
// #endregion

const saveNewBookHandler = (request, h) => {
  try {
    const {
      name, year, author, summary, publisher, pageCount, readPage, reading,
    } = request.payload;

    if (name === undefined) {
      throw handleErrorObject(400, 'Gagal menambahkan buku. Mohon isi nama buku');
    }

    if (readPage > pageCount) {
      throw handleErrorObject(400, 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount');
    }

    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);

    const isSuccess = books.filter((note) => note.id === id).length > 0;

    if (isSuccess) {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });

      response.code(201);

      return response;
    }

    throw handleErrorObject(500, 'Gagal menambahkan buku');
  } catch (error) {
    return showErrorResponse(error, h);
  }
};

const getAllBooksHandler = (request) => {
  const { name, reading, finished } = request.query;
  let targetedBooks = null;

  if (name) {
    targetedBooks = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading === '1') {
    targetedBooks = books.filter((book) => book.reading === true);
  }

  if (reading === '0') {
    targetedBooks = books.filter((book) => book.reading === false);
  }

  if (finished === '1') {
    targetedBooks = books.filter((book) => book.finished === true);
  }

  if (finished === '0') {
    targetedBooks = books.filter((book) => book.finished === false);
  }

  if (targetedBooks === null) {
    targetedBooks = books;
  }

  return {
    status: 'success',
    data: {
      // eslint-disable-next-line no-shadow
      books: targetedBooks.map(({ id, name, publisher }) => ({ id, name, publisher })),
    },
  };
};

const getBookByIdHandler = (request, h) => {
  try {
    const { bookId } = request.params;

    const book = books.filter((n) => n.id === bookId)[0];

    if (book !== undefined) {
      return {
        status: 'success',
        data: {
          book,
        },
      };
    }

    throw handleErrorObject(404, 'Buku tidak ditemukan');
  } catch (error) {
    return showErrorResponse(error, h);
  }
};

const editBookByIdHandler = (request, h) => {
  try {
    const { bookId } = request.params;

    const {
      name, year, author, summary, publisher, pageCount, readPage, reading,
    } = request.payload;

    if (name === undefined) {
      throw handleErrorObject(400, 'Gagal memperbarui buku. Mohon isi nama buku');
    }

    if (readPage > pageCount) {
      throw handleErrorObject(400, 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount');
    }

    const updatedAt = new Date().toISOString();

    const index = books.findIndex((book) => book.id === bookId);

    if (index !== -1) {
      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
      };

      const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });

      response.code(200);
      return response;
    }

    throw handleErrorObject(404, 'Gagal memperbarui buku. Id tidak ditemukan');
  } catch (error) {
    return showErrorResponse(error, h);
  }
};

const deleteBookByIdHandler = (request, h) => {
  try {
    const { bookId } = request.params;

    const index = books.findIndex((book) => book.id === bookId);

    if (index !== -1) {
      books.splice(index, 1);
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      });
      response.code(200);
      return response;
    }

    throw handleErrorObject(404, 'Buku gagal dihapus. Id tidak ditemukan');
  } catch (error) {
    return showErrorResponse(error, h);
  }
};

module.exports = {
  saveNewBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
