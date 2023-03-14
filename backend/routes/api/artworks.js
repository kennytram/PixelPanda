const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Artwork = mongoose.model('Artwork');
const { requireUser } = require('../../config/passport');
const validateArtworkInput = require('../../validations/artworks');

router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find()
                              .populate("author", "_id username")
                              .sort({ createdAt: -1 });
      return res.json(artworks);
  }
  catch(err) {
    return res.json([]);
  }
});

router.get('/user/:userId', async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.params.userId);
  } catch(err) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errors = { message: "No user found with that id" };
    return next(error);
  }
  try {
      const artworks = await Artwork.find({ author: user._id })
                              .sort({ createdAt: -1 })
                              .populate("author", "_id username");
      return res.json(artworks);
  }
  catch(err) {
    return res.json([]);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
      const artwork = await Artwork.findById(req.params.id)
                             .populate("author", "_id username");
      return res.json(artwork);
  }
  catch(err) {
    const error = new Error('Artworkrtwork not found');
    error.statusCode = 404;
      error.errors = { message: "No artwork found with that id" };
    return next(error);
  }
});

router.post('/', requireUser, validateArtworkInput, async (req, res, next) => {
  try {
      const newArtwork = new Artwork({
          name: req.body.name,
          description: req.body.description,
          author: req.user._id,
          ArtworkImageUrl: req.body.ArtworkImageUrl

    });
      let artwork = await newArtwork.save();
      artwork = await artwork.populate('author', '_id username');
      return res.json(artwork);
  }
  catch(err) {
    next(err);
  }
});
router.patch("/:id", validateArtworkInput, async (req, res, next) => {
    Artwork.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          description:req.body.description,
          ArtworkImageUrl: req.body.ArtworkImageUrl,
          price: req.body.price
        },
        { new: true }

    )
        .then((artwork)=>{
            return res.json(artwork);
        })
        .catch((err) => {
          const error = new Error("Artwork can't be updated.");
          error.statusCode = 422;
          error.errors = { message: "Invalid artwork input values." };
          return next(error);
        }); 
})
router.delete("/:artworkId", async (req, res, next) => {
  // res.json({ message: "DELETE /product" });

    Artwork.findByIdAndDelete(req.params.artworkId)
    .then((artwork) => {
        return res.json(artwork);
    })
    .catch((err) => {
        const error = new Error("Artwork can't be deleted.");
      error.statusCode = 422;
      error.errors = { message: "Artwork can't be found." };
      return next(error);
    });
});
module.exports = router;