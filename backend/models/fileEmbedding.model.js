const mongoose = require("mongoose");

const embeddingSchema = new mongoose.Schema(
  {
    pdf_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PdfFile",
    },
 
    embedding: {
      type: [Number],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);


const pdfFileModel = mongoose.model("FileEmbedding", embeddingSchema);

module.exports = pdfFileModel;
