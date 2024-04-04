const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dargk1hq2',
  api_key: '891238794413832',
  api_secret: 'a8xKpwKty7LJblKeuGJrhx4SmBM'
});

module.exports = cloudinary;
