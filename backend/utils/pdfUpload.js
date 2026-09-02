const multer = require("multer");

const allowMimeTypes = [
 "application/pdf"
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extension = file.originalname.toLowerCase().split(".").pop();
  if (allowMimeTypes.includes(file.mimetype) && extension === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF file allowed"));
  }
};

const singleUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("pdf");


const multipleUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
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
