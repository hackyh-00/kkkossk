const cloudinary = require("cloudinary").v2;

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

async function uploadImage(url) {
  const response = await cloudinary.uploader.upload(url, {
    folder: "tinder-valle",
  });

  return response;
}

module.exports = {
  uploadImage,
};
