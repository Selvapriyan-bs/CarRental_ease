const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

const resizeImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    req.resizedFiles = [];
    
    for (const file of req.files) {
      const resizedPath = file.path.replace(path.extname(file.path), '_resized.jpg');
      
      await sharp(file.path)
        .resize(1500, 1024, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 90 })
        .toFile(resizedPath);
      
      fs.unlinkSync(file.path);
      req.resizedFiles.push('/uploads/' + path.basename(resizedPath));
    }
    
    next();
  } catch (error) {
    console.error('Image resize error:', error);
    next(error);
  }
};

module.exports = { upload, resizeImages };