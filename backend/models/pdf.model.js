const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
 
    file_name: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

pdfSchema.virtual("fullUrl").get(function () {
  const baseUrl = process.env.BASE_URL;
  return this.file_path.startsWith("http")
    ? this.file_path
    : `${baseUrl}${this.file_path}`;
});

pdfSchema.set("toJSON", { virtuals: true });
pdfSchema.set("toObject", { virtuals: true });

pdfSchema.virtual("embeddings",{
  ref:'FileEmbedding',
  localField:'_id',
  foreignField:'pdf_id'
})

const pdfFileModel = mongoose.model("PdfFile", pdfSchema);

module.exports = pdfFileModel;
