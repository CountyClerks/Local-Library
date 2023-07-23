const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator')

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre list");
});

exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await  Genre.find().sort({ genre_name: 1}).exec();

  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres
  })
})

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});


// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', { title: "Create Genre" })
};

// Handle Genre create on POST.
exports.genre_create_post = [
  //Validate and sanitize the name field.
  body("name", "Genre must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  //Process request after validation
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const genre = new Genre({ name: req.body.name})

    if(!errors.isEmpty()) {
      //There are errors
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      })
      return;
    } else {
      //Check if genre with the same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec()

      if(genreExists) {
        //If genre exists, redirect to the details page
        res.redirect(genreExists.url);
      } else {
        await genre.save()
        //Save new genre. Redirect to details page.
        res.redirect(genre.url)
      }
    }
  })
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ])

  if(genre === null) {
    res.redirect("/catalog/genres")
  }

  res.render("genre_delete", {
    title: "Delete Genre",
    genre: genre,
    genre_books: booksInGenre,
  })
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id}, "title summary").exec(),
  ])

  if (booksInGenre.length > 0) {
    res.render("genre_delete", {
      title: "Delete Genre",
      genre: genre,
      genre_books: allGenresByBooks
    })
    return;
  } else {
    await Genre.findByIdAndRemove(req.body.genreid)
    res.redirect("/catalog/genres")
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec()

  if(genre === null) {
    const err = new Error("Genre not found")
    err.status = 404
    return next(err)
  }
  res.render("genre_form", {title: "Update Genre", genre: genre})
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre must contain at least 3 characters")
    .trim()
    .isLength({min: 3})
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const genre = new Genre({
      name: req.body.name,
      _id: req.params._id
    })
    
    if(!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre: genre,
        errors: errors.array(),
      })
      return;
    } else {
      await Genre.findByIdAndUpdate(req.paramrs.id, genre)
      res.redirect(genre.url)
    }
  })
]