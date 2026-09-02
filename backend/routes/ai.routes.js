const express = require("express");
const router = express.Router();
const { body, check, query } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const aiController = require("../controllers/ai.controller");
const pdfController = require("../controllers/pdf.controller");

const { uploadSinglePdf, uploadMultiplePdf } = require("../utils/pdfUpload");

router.get("/get-chat-bot", authMiddleware.authUser, aiController.getChatBot);

router.get(
  "/conversations",
  [query("chat_bot_id", "chat_bot_id is required").not().isEmpty()],
  authMiddleware.authUser,
  aiController.getConversations,
);

//Single PDF
router.post(
  "/pdf",
  authMiddleware.authUser,
  uploadSinglePdf,
  pdfController.savePdfFile,
);

router.get("/get-pdf", authMiddleware.authUser, pdfController.getPdfFile);

router.post(
  "/chat-with-pdf",
  authMiddleware.authUser,
  [
    body("pdf_id").notEmpty().withMessage("pdf_id is required"),
    body("question").notEmpty().not().withMessage("question is required"),
  ],
  pdfController.chatWithPdf,
);

router.get(
  "/single-pdf-chat",
  authMiddleware.authUser,
  [query("pdf_id").notEmpty().withMessage("pdf_id is required")],
  pdfController.getSinglPdfChats,
);

//Multiple PDF
//Use Key---pdfs for upload PDF

router.post(
  "/pdfs",
  authMiddleware.authUser,
  uploadMultiplePdf,
  [
    check("pdfs")
      .custom((value, { req }) => {
        if (!req.files || req.files === 0) {
          return false;
        } else {
          return true;
        }
      })
      .withMessage("Atleast one pdf file required."),
  ],
  pdfController.savePdfs,
);

router.post(
  "/chat-with-multiple-pdf",
  authMiddleware.authUser,
  [body("question").notEmpty().withMessage("question is required")],
  pdfController.chatWithMultiplePdf,
);


router.get(
  "/get-pdfs",
  authMiddleware.authUser,
   pdfController.getPdfs,
);

router.put('/update-chunk',authMiddleware.authUser,[
  body('id').notEmpty().withMessage('id is required'),body('text').notEmpty().withMessage('text is required')
],pdfController.updateChunk)

router.delete('/delete-pdf-data',authMiddleware.authUser,[
  body('is_pdf').notEmpty().withMessage('is_pdf is required'),body('id').notEmpty().withMessage('id is required')
],pdfController.deletePdfData)



router.get(
  "/pdf-conversations",
  authMiddleware.authUser,
  pdfController.getConversations,
);


router.get('/pdf-conversation-messages',authMiddleware.authUser,[query('conversation_id').notEmpty().withMessage('conversation_id is required').trim()],pdfController.getConversationMessages)






module.exports = router;
