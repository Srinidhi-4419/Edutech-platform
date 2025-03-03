require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const cloudname=process.env.name;
const api_key=process.env.key;
const api_secret=process.env.secret;
console.log(cloudname);
console.log(api_key);
console.log(api_secret);
cloudinary.config({
  cloud_name: cloudname,
  api_key: api_key,
  api_secret: api_secret,
});

module.exports = cloudinary;
