const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
  originalName: { type: String, required: true, trim: true },
  storagePath: { type: String, required: true, unique: true },
  fileSize: { type: Number, required: true, min: 1 },
  mimeType: { type: String, required: true, enum: ["application/pdf"] },
  processingStatus: { type: String, enum: ["uploaded", "processing", "ready", "failed"], default: "uploaded" },
}, { timestamps: true });

pdfSchema.index({ user_id: 1, createdAt: -1 });
pdfSchema.virtual("embeddings", { ref: "FileEmbedding", localField: "_id", foreignField: "pdf_id" });
pdfSchema.set("toJSON", { virtuals: true });
pdfSchema.set("toObject", { virtuals: true });

const pdfFileModel = mongoose.model("PdfFile", pdfSchema);

module.exports = pdfFileModel;
