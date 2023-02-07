const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config()
const multer = require('multer');

const feedRoutes = require('./routes/feed');

const MONGODB_URI = dotenv.parsed.MONGODB_URI;

const app = express();

const fileStorage = multer.diskStorage({
  destination: (res, file, cb) => {
    cb(null, 'images');
  },
  filename: (res, file, cb) => {
    cb(null, `${new Date().toISOString().replace(/:/g, '-')}_${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const fileSize = parseInt(req.headers["content-length"]);

  if (( file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') &&
        fileSize <= 782810 )
  {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({storage: fileStorage, fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
});

mongoose.set("strictQuery", false);
mongoose.connect(MONGODB_URI)
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));