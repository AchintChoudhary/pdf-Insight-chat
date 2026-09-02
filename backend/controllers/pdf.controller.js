const { validationResult } = require("express-validator");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const singlePdfModel = require("../models/singlePDF.model.js");
const pdfFileModel = require("../models/pdf.model.js");
const singlePdfChatModel = require("../models/singlePDFChat.model.js");
const helper = require("../utils/helper.js");
const pdfConversationModel = require("../models/pdfConversation.model.js");
const pdfChatModel = require("../models/pdfChat.model.js");
const PdfConversationModel = require("../models/pdfConversation.model.js");

const fileEmbeddingModel = require("../models/fileEmbedding.model.js");

module.exports.savePdfFile = async (req, res) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload PDF File",
      });
    }
    const user_id = req.user._id;

    const bufferData = await fs.promises.readFile(req.file.path);
    const parser = new PDFParse({ data: bufferData });
    const pdfData = await parser.getText();
    await parser.destroy();
    const pdfText = pdfData.text;
    console.log("pdfText", pdfText);
    const pdfCreateData = await singlePdfModel.create({
      user_id,
      content: pdfText,
      file_name: req.file.filename,
      file_path: "pdfs/" + req.file.filename,
    });

    return res.status(200).json({
      success: true,
      msg: "PDF uploaded successfully",
      data: pdfCreateData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.getPdfFile = async (req, res, next) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const user_id = req.user._id;

    const pdfData = await singlePdfModel.find({
      user_id,
    });

    return res.status(200).json({
      success: true,
      msg: "PDF data",
      data: pdfData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.chatWithPdf = async (req, res, next) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const user_id = req.user._id;
    const { pdf_id, question } = req.body;
    console.log(pdf_id);
    const pdfData = await singlePdfModel.findOne({
      _id: pdf_id,
      user_id,
    });

    if (!pdfData) {
      return res.status(200).json({
        success: false,
        msg: "PDF doesn't exist",
      });
    }

    const ai_message = await helper.chatWithPdf(pdfData.content, question);

    const pdfChat = await singlePdfChatModel.create({
      user_id,
      pdf_id,
      user_message: question,
      ai_message,
    });
    return res.status(200).json({
      success: true,
      msg: "PDF Chat data",
      data: pdfChat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.getSinglPdfChats = async (req, res, next) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const user_id = req.user._id;
    const { pdf_id } = req.query;

    const pdfData = await singlePdfModel.findOne({
      _id: pdf_id,
      user_id,
    });

    if (!pdfData) {
      return res.status(400).json({
        success: false,
        message: "PDF not Found",
      });
    }

    const pdfChats = await singlePdfChatModel
      .find({
        pdf_id,
        user_id,
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      msg: "PDF data",
      data: pdfChats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.savePdfs = async (req, res) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload PDF File",
      });
    }
    const user_id = req.user._id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No file uploaded",
      });
    }

    const savedFiles = await Promise.all(
      req.files.map(async (file) => {
        const newPdfEntry = new pdfFileModel({
          user_id,
          file_name: file.filename,
          file_path: "pdfs/" + file.filename,
        });
        const savePdf = await newPdfEntry.save();

        const bufferData = await fs.promises.readFile(file.path);
        const parser = new PDFParse({ data: bufferData });
        const pdfData = await parser.getText();
        await parser.destroy();
        const pdfText = pdfData.text;
        console.log(pdfText);
        const chunks = helper.splitIntoChunks(pdfText, 300);

        console.log("Chunks:", chunks);
        await helper.processChunks(chunks, savePdf);
      }),
    );

    return res.status(200).json({
      success: true,
      msg: "PDFs uploaded successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.chatWithMultiplePdf = async (req, res) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const user_id = req.user._id;

    const { question, conversation_id } = req.body;

    let chatConversationId = conversation_id;
    if (!chatConversationId) {
      const newConversation = await pdfConversationModel.create({
        user_id,
        last_message: question,
      });

      chatConversationId = newConversation._id;
    } else {
      await PdfConversationModel.findByIdAndUpdate(chatConversationId, {
        last_message: question,
      });
    }

    const newChat = await pdfChatModel.create({
      user_id,
      conversation_id: chatConversationId,
      user_message: question,
      ai_message: "",
    });

    const queryEmbedding = await helper.generateEmbedding(question);

    const embeddings = await fileEmbeddingModel.find({
      pdf_id: {
        $in: await pdfFileModel
          .find({
            user_id,
          })
          .distinct("_id"),
      },
    });

    let bestMatch = null;
    let highestSimilarity = -1;
    for (const embedding of embeddings) {
      const similarity = helper.consineSimilarity(
        embedding.embedding,
        queryEmbedding,
      );

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = embedding;
      }
    }

    if (!bestMatch) {
      const contentNotFound = "No relevant content found.";
      await pdfConversationModel.findByIdAndUpdate(chatConversationId, {
        last_message: contentNotFound,
      });

      await pdfChatModel.findByIdAndUpdate(newChat._id, {
        ai_message: contentNotFound,
      });
      return res.status(200).json({
        success: true,
        id: newChat._id,
        message: contentNotFound,
        conversation_id: chatConversationId,
      });
    }

    const aiReply = await helper.pdfChatAi(bestMatch, question);
    await pdfConversationModel.findByIdAndUpdate(chatConversationId, {
      last_message: aiReply,
    });

   const updatedChat= await pdfChatModel.findByIdAndUpdate(newChat._id, {$set:{ai_message:aiReply}},{new:true});
    return res.status(200).json({
      success: true,
      id: newChat._id,
      message: aiReply,
      conversation_id: chatConversationId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.getPdfs = async (req, res) => {
  try {
    const user_id = req.user._id;

    const { pdf_id } = req.query;
    let data = null;

    if (pdf_id) {
      data = await pdfFileModel
        .findOne({
          _id: pdf_id,
        })
        .populate("embeddings");
    } else {
      data = await pdfFileModel
        .find({
          user_id,
        })
        .populate("embeddings");
    }

    return res.status(200).json({
      success: true,
      msg: "PDFs data",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.updateChunk = async (req, res) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const { id, text } = req.body;
    const chunkData = await fileEmbeddingModel.findOne({
      _id: id,
    });

    if (!chunkData) {
      return res.status(400).json({
        success: false,
        msg: "chunk not found",
      });
    }

    const embedding = await helper.generateEmbedding(text);
    chunkData.embedding = embedding;
    chunkData.content = text;
    const updateData = await chunkData.save();

    return res.status(200).json({
      success: true,
      msg: "chunk updated successfully",
      data: updateData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.deletePdfData = async (req, res) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const { id, is_pdf } = req.body;
    if (is_pdf == 1) {
      const deletePdf = await pdfFileModel.findByIdAndDelete(id);
      if (!deletePdf) {
        return res.status(400).json({
          success: false,
          msg: "pdf not found",
        });
      }

      await fileEmbeddingModel.deleteMany({
        pdf_id: id,
      });
      return res.status(200).json({
        success: true,
        msg: "pdf deleted successfully",
        data: deletePdf,
      });
    }
    const deletedData = await fileEmbeddingModel.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(400).json({
        success: false,
        msg: "chunk not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "chunk deleted successfully",
      data: deletedData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.getConversations = async (req, res, next) => {
  const error = validationResult(req);
  try {
    const user_id = req.user._id;
    const data = await PdfConversationModel.find({ user_id }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      msg: "Conversations",
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports.getConversationMessages = async (req, res) => {
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { conversation_id } = req.query;

    const user_id = req.user._id;

    const isExists = await pdfConversationModel.findOne({
      _id: conversation_id,
      user_id,
    });

    if (!isExists) {
      return res.status(200).json({
        success: false,
        msg: "conversation doesn't exists!",
      });
    }

    const chats = await pdfChatModel
      .find({
        conversation_id,
        user_id: user_id,
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      msg: "Messages get successfully",

      data: chats,
    });
  } catch (error) {
    console.error("GROQ ERROR:", error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
