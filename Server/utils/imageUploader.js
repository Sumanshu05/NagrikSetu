const cloudinary = require("cloudinary").v2;
require("dotenv").config();

/**
 * Uploads an image buffer/file to Cloudinary.
 * @param {Object} file - The file object from express-fileupload (req.files.xxx)
 * @param {string} folder - Cloudinary folder name
 * @param {number} [height] - Optional height for transformation
 * @param {number} [width]  - Optional width for transformation
 * @returns {Promise<Object>} Cloudinary upload response
 */
exports.uploadImageToCloudinary = async (file, folder, height, width) => {
    const options = { folder, resource_type: "auto" };

    if (height) options.height = height;
    if (width) options.width = width;
    if (height || width) options.crop = "fill";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
};

/**
 * Uploads multiple files to a given Cloudinary folder.
 * @param {Array} files - Array of file objects
 * @param {string} [folder="complaints"] - Cloudinary folder
 * @returns {Promise<Array>} Array of { url, publicId }
 */
exports.uploadToCloudinary = async (files, folder = "complaints") => {
    const uploads = Array.isArray(files) ? files : [files];
    const results = await Promise.all(
        uploads.map((file) =>
            cloudinary.uploader.upload(file.tempFilePath, {
                folder,
                resource_type: "auto",
            })
        )
    );
    return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
};

/**
 * Deletes files from Cloudinary by public_id.
 * @param {Array} photos - Array of { publicId } objects
 */
exports.deleteFromCloudinary = async (photos = []) => {
    const ids = photos
        .map((p) => p.publicId || p.public_id)
        .filter(Boolean);

    if (!ids.length) return;

    await Promise.all(
        ids.map((id) => cloudinary.uploader.destroy(id))
    );
};