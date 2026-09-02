const Groq = require("groq-sdk");
const { pipeline } = require("@xenova/transformers");
const embeddingModel = require("../models/fileEmbedding.model");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
let embedderPromise;

async function getEmbedder() {
  if (!embedderPromise) embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  return embedderPromise;
}

function validVector(vector) {
  return Array.isArray(vector) && vector.length > 0 && vector.every((value) => Number.isFinite(value));
}

module.exports.splitIntoChunks = (text, chunkSize = 300) => {
  if (typeof text !== "string" || !text.trim()) return [];
  const words = text.trim().split(/\s+/);
  const chunks = [];
  for (let index = 0; index < words.length; index += chunkSize) chunks.push(words.slice(index, index + chunkSize).join(" "));
  return chunks;
};

module.exports.generateEmbedding = async (text) => {
  if (typeof text !== "string" || !text.trim()) return null;
  try {
    const output = await (await getEmbedder())(text, { pooling: "mean", normalize: true });
    const vector = Array.from(output.data);
    return validVector(vector) ? vector : null;
  } catch (error) {
    console.error("Embedding error:", error.message);
    return null;
  }
};

module.exports.processChunks = async (chunks, pdf) => {
  const records = [];
  for (const content of chunks) {
    const embedding = await module.exports.generateEmbedding(content);
    if (!embedding) throw new Error("Unable to generate a valid PDF embedding");
    records.push({ pdf_id: pdf._id, embedding, content });
  }
  if (!records.length) throw new Error("PDF contains no extractable text");
  return embeddingModel.insertMany(records);
};

module.exports.cosineSimilarity = (vecA, vecB) => {
  if (!validVector(vecA) || !validVector(vecB) || vecA.length !== vecB.length) return null;
  let dot = 0; let magA = 0; let magB = 0;
  for (let index = 0; index < vecA.length; index += 1) {
    dot += vecA[index] * vecB[index];
    magA += vecA[index] ** 2;
    magB += vecB[index] ** 2;
  }
  if (!magA || !magB) return null;
  const similarity = dot / (Math.sqrt(magA) * Math.sqrt(magB));
  return Number.isFinite(similarity) ? similarity : null;
};
module.exports.consineSimilarity = module.exports.cosineSimilarity;

module.exports.answerFromContext = async (context, question, history = []) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a PDF question-answering assistant. Answer using only the supplied PDF context and recent conversation. If the answer is not in the context, say: I couldn't find this information in the uploaded PDF. Do not invent facts." },
      ...history.flatMap((message) => [{ role: "user", content: message.user_message }, { role: "assistant", content: message.ai_message }]),
      { role: "user", content: `PDF context:\n${context}\n\nQuestion: ${question}` },
    ],
    temperature: 0.1,
    max_tokens: 700,
  });
  return response.choices?.[0]?.message?.content || "I couldn't find this information in the uploaded PDF.";
};
