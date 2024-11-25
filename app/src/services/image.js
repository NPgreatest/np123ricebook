const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const stream = require('stream');
require('dotenv').config();


// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary configuration. Please set the environment variables:');
  console.error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
  process.exit(1);
}

// Multer middleware to handle file upload in memory
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload image to Cloudinary
 * @param {Object} file - The file object from multer
 * @param {String} publicId - (Optional) A custom public ID for the image
 * @returns {Promise<Object>} - The upload result including url and public_id
 */
const uploadImage = (file, publicId = null) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            public_id: publicId,
            folder: 'ricebook', // Optional: organize images in folders
            resource_type: 'auto',
            transformation: [
                { width: 500, height: 500, crop: 'limit' } // Optional: resize images
            ]
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        const passthrough = new stream.PassThrough();
        passthrough.end(file.buffer);
        passthrough.pipe(uploadStream);
    });
};


/**
 * Generate a URL for an image using its public ID
 * @param {String} publicId - The public ID of the image
 * @param {Object} options - (Optional) Transformation options
 * @returns {String} - The generated URL
 */
const getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, options);
};

module.exports = {
  upload,
  uploadImage,
  getImageUrl,
};