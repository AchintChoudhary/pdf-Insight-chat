const multer = require("multer");
const path = require("path");

const allowMimeTypes = [
 "application/pdf"
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/pdfs"));
  },
  filename: function (req, file, cb) {
    cb(null, `pdf_${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF file allowed"));
  }
};

const singleUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single("pdf");


const multipleUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).array("pdfs",5);

const uploadSinglePdf = (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};



const uploadMultiplePdf = (req, res, next) => {
  multipleUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

module.exports = {uploadSinglePdf,
    uploadMultiplePdf
};
