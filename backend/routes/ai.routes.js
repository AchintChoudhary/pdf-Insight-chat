const express = require("express");
const { body, query } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const pdfController = require("../controllers/pdf.controller");
const { uploadSinglePdf, uploadMultiplePdf } = require("../utils/pdfUpload");

const router = express.Router();
const questionValidation = [body("question").trim().notEmpty().withMessage("question is required")];

router.post("/pdf", authMiddleware.authUser, uploadSinglePdf, pdfController.savePdfFile);
router.get("/get-pdf", authMiddleware.authUser, pdfController.getPdfFile);
router.get("/pdf/:pdfId/url", authMiddleware.authUser, pdfController.getPdfUrl);
router.delete("/pdf/:pdfId", authMiddleware.authUser, pdfController.deletePdf);
router.post("/chat-with-pdf", authMiddleware.authUser, [body("pdf_id").trim().notEmpty().withMessage("pdf_id is required"), ...questionValidation], pdfController.chatWithPdf);
router.get("/single-pdf-chat", authMiddleware.authUser, [query("pdf_id").trim().notEmpty().withMessage("pdf_id is required")], pdfController.getSinglPdfChats);

router.post("/pdfs", authMiddleware.authUser, uploadMultiplePdf, pdfController.savePdfs);
router.get("/get-pdfs", authMiddleware.authUser, pdfController.getPdfs);
router.post("/chat-with-multiple-pdf", authMiddleware.authUser, questionValidation, pdfController.chatWithMultiplePdf);
router.put("/update-chunk", authMiddleware.authUser, [body("id").trim().notEmpty(), body("text").trim().notEmpty()], pdfController.updateChunk);
router.get("/pdf-conversations", authMiddleware.authUser, pdfController.getConversations);
router.get("/pdf-conversation-messages", authMiddleware.authUser, [query("conversation_id").trim().notEmpty().withMessage("conversation_id is required")], pdfController.getConversationMessages);

module.exports = router;
