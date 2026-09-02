const { validationResult } = require("express-validator");
const crypto = require("crypto");
const { PDFParse } = require("pdf-parse");
const Pdf = require("../models/pdf.model");
const Embedding = require("../models/fileEmbedding.model");
const Conversation = require("../models/pdfConversation.model");
const Message = require("../models/pdfChat.model");
const helper = require("../utils/helper");
const storage = require("../services/storage.service");

const notFound = (res, message = "PDF not found") => res.status(404).json({ success: false, message });
const validate = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(422).json({ success: false, message: result.array()[0].msg, errors: result.array() });
    return false;
  }
  return true;
};

async function processPdf(file, userId) {
  const safeName = `${crypto.randomUUID()}.pdf`;
  const storagePath = `${userId}/${safeName}`;
  const pdf = await Pdf.create({ user_id: userId, originalName: file.originalname, storagePath, fileSize: file.size, mimeType: file.mimetype, processingStatus: "processing" });
  let uploaded = false;
  try {
    await storage.uploadPdf(file.buffer, storagePath, file.mimetype);
    uploaded = true;
    const parser = new PDFParse({ data: file.buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    await helper.processChunks(helper.splitIntoChunks(parsed.text), pdf);
    pdf.processingStatus = "ready";
    await pdf.save();
    return pdf;
  } catch (error) {
    pdf.processingStatus = "failed";
    await pdf.save().catch(() => {});
    await Embedding.deleteMany({ pdf_id: pdf._id }).catch(() => {});
    if (uploaded) await storage.deletePdf(storagePath).catch(() => {});
    throw error;
  }
}

module.exports.savePdfFile = async (req, res) => {
  if (!validate(req, res)) return;
  if (!req.file) return res.status(400).json({ success: false, message: "PDF file is required" });
  try {
    const pdf = await processPdf(req.file, req.user._id);
    return res.status(201).json({ success: true, data: pdf });
  } catch (error) {
    return res.status(422).json({ success: false, message: `PDF processing failed: ${error.message}` });
  }
};

module.exports.getPdfFile = async (req, res) => {
  const data = await Pdf.find({ user_id: req.user._id }).sort({ createdAt: -1 });
  return res.json({ success: true, data });
};
module.exports.getPdfs = module.exports.getPdfFile;

module.exports.getPdfUrl = async (req, res) => {
  const pdf = await Pdf.findOne({ _id: req.params.pdfId, user_id: req.user._id });
  if (!pdf) return notFound(res);
  return res.json({ success: true, data: { url: await storage.getSignedPdfUrl(pdf.storagePath) } });
};

async function ownedPdfIds(userId, pdfIds) {
  return Pdf.find({ user_id: userId, ...(pdfIds?.length ? { _id: { $in: pdfIds } } : {}) }).distinct("_id");
}
async function retrieve(userId, question, pdfIds) {
  const queryEmbedding = await helper.generateEmbedding(question);
  if (!queryEmbedding) return [];
  const allowedIds = await ownedPdfIds(userId, pdfIds);
  const embeddings = await Embedding.find({ pdf_id: { $in: allowedIds } }).populate("pdf_id", "originalName").lean();
  return embeddings.map((item) => ({ ...item, similarity: helper.cosineSimilarity(item.embedding, queryEmbedding) }))
    .filter((item) => item.similarity !== null && item.similarity >= 0.25)
    .sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

async function chat(req, res, multiple = false) {
  if (!validate(req, res)) return;
  const { question, conversation_id: conversationId } = req.body;
  const requestedIds = multiple ? (req.body.pdf_ids || []) : [req.body.pdf_id];
  if (!multiple && !req.body.pdf_id) return res.status(400).json({ success: false, message: "pdf_id is required" });
  const ids = await ownedPdfIds(req.user._id, requestedIds);
  if (!ids.length || (!multiple && ids.length !== 1)) return notFound(res);
  let conversation;
  if (conversationId) conversation = await Conversation.findOne({ _id: conversationId, user_id: req.user._id, ...(multiple ? {} : { pdf_id: ids[0] }) });
  if (!conversation) conversation = await Conversation.create({ user_id: req.user._id, ...(multiple ? { pdf_ids: ids } : { pdf_id: ids[0] }) });
  const history = await Message.find({ conversation_id: conversation._id, user_id: req.user._id }).sort({ createdAt: -1 }).limit(8).lean();
  const matches = await retrieve(req.user._id, question, ids);
  const answer = matches.length ? await helper.answerFromContext(matches.map((match) => `[${match.pdf_id.originalName}] ${match.content}`).join("\n\n"), question, history.reverse()) : "I couldn't find this information in the uploaded PDF.";
  const message = await Message.create({ user_id: req.user._id, pdf_id: multiple ? undefined : ids[0], conversation_id: conversation._id, user_message: question, ai_message: answer });
  await Conversation.findByIdAndUpdate(conversation._id, { last_message: answer });
  return res.json({ success: true, data: message, conversation_id: conversation._id });
}
module.exports.chatWithPdf = (req, res) => chat(req, res, false);
module.exports.chatWithMultiplePdf = (req, res) => chat(req, res, true);

module.exports.getSinglPdfChats = async (req, res) => {
  if (!validate(req, res)) return;
  const pdf = await Pdf.findOne({ _id: req.query.pdf_id, user_id: req.user._id });
  if (!pdf) return notFound(res);
  const data = await Message.find({ pdf_id: pdf._id, user_id: req.user._id }).sort({ createdAt: 1 });
  return res.json({ success: true, data });
};
module.exports.getConversations = async (req, res) => res.json({ success: true, data: await Conversation.find({ user_id: req.user._id }).sort({ updatedAt: -1 }) });
module.exports.getConversationMessages = async (req, res) => {
  if (!validate(req, res)) return;
  const conversation = await Conversation.findOne({ _id: req.query.conversation_id, user_id: req.user._id });
  if (!conversation) return notFound(res, "Conversation not found");
  return res.json({ success: true, data: await Message.find({ conversation_id: conversation._id, user_id: req.user._id }).sort({ createdAt: 1 }) });
};

module.exports.savePdfs = async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "At least one PDF file is required" });
  try { return res.status(201).json({ success: true, data: await Promise.all(req.files.map((file) => processPdf(file, req.user._id))) }); }
  catch (error) { return res.status(422).json({ success: false, message: `PDF processing failed: ${error.message}` }); }
};

module.exports.deletePdf = async (req, res) => {
  const pdf = await Pdf.findOne({ _id: req.params.pdfId, user_id: req.user._id });
  if (!pdf) return notFound(res);
  await storage.deletePdf(pdf.storagePath).catch(() => {});
  await Embedding.deleteMany({ pdf_id: pdf._id });
  const conversations = await Conversation.find({ $or: [{ pdf_id: pdf._id }, { pdf_ids: pdf._id }], user_id: req.user._id }).distinct("_id");
  await Message.deleteMany({ conversation_id: { $in: conversations }, user_id: req.user._id });
  await Conversation.deleteMany({ _id: { $in: conversations }, user_id: req.user._id });
  await Pdf.deleteOne({ _id: pdf._id, user_id: req.user._id });
  return res.json({ success: true, data: pdf });
};
module.exports.deletePdfData = async (req, res) => req.body.is_pdf ? module.exports.deletePdf({ ...req, params: { pdfId: req.body.id } }, res) : res.status(410).json({ success: false, message: "Chunk deletion is no longer supported" });
module.exports.updateChunk = async (req, res) => {
  if (!validate(req, res)) return;
  const chunk = await Embedding.findById(req.body.id).populate("pdf_id", "user_id");
  if (!chunk || String(chunk.pdf_id.user_id) !== String(req.user._id)) return notFound(res, "Chunk not found");
  const embedding = await helper.generateEmbedding(req.body.text.trim());
  if (!embedding) return res.status(422).json({ success: false, message: "Chunk text cannot be empty" });
  chunk.content = req.body.text.trim(); chunk.embedding = embedding; await chunk.save();
  return res.json({ success: true, data: chunk });
};
