const Book = require("../models/Book");
const bookReleases = require("../worker/bookReleases");

const asyncMiddlewareAuth = (handler) => {
    return async (req, res, next) => {
        console.log(req.body.role, "req.body.role")
        try {
            if (req.body.role !== "admin") {
                return res.status(401).json({
                    status: 0,
                    message: "Request not authorized.",
                });
            }
            await handler(req, res, next);
        } catch (ex) {
            next(ex);
        }
    };
};
const asyncMiddleware = (handler) => {
    return async (req, res, next) => {
        try {
            // if (req.body.role !== "user") {
            //   return res.status(401).json({
            //     status: 0,
            //     message: "Request not authorized.",
            //   });
            // }
            await handler(req, res, next);
        } catch (ex) {
            next(ex);
        }
    };
};

exports.addBooks = asyncMiddlewareAuth(async (req, res) => {
    const { authorsId, title, description, price } = req.body;
    if (!authorsId || !title || !description || !price) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    let slugURL = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const newBook = await Book.create({
        authorsId,
        title,
        description,
        price,
        slugURL
    });
    if (!newBook) {
        return res.status(404).json({ message: "data not found" });
    }

    bookReleases.sendBook(authorsId, title, description, price)
    return res.status(201).json({
        status: 1,
        message: newBook,
    });

})
exports.updateBook = asyncMiddlewareAuth(async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(404).json({ message: "data not found" });
    }
    const { authors, title, description, price } = req.body;
    if (!authors || !title || !description || !price) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const book = await Book.findByIdAndUpdate(id, {
        authors,
        title,
        description,
        price
    })
    return res.status(201).json({
        status: 1,
        message: book,
    });
})
exports.deleteBookById = asyncMiddlewareAuth(async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(404).json({ message: "data not found" });
    }
    const data = await Book.findByIdAndDelete(id)
    return res.status(200).json({
        status: 1,
        message: "DELETE successfully ",
    })
})


exports.getBooks = asyncMiddleware(async (req, res) => {
    const books = await Book.find();
    return res.status(201).json({
        status: 1,
        message: books,
    });
})
exports.getBookById = asyncMiddleware(async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(404).json({ message: "data not found" });
    }
    const book = await Book.findById(id);
    return res.status(201).json({
        status: 1,
        message: book,
    });
})