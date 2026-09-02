const { createClient } = require("@supabase/supabase-js");

const bucket = "pdfs";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.warn("Supabase storage is not configured");
}

const supabase = createClient(supabaseUrl || "https://invalid.supabase.co", supabaseSecretKey || "missing-key");

module.exports.uploadPdf = async (buffer, storagePath, contentType = "application/pdf") => {
  const { data, error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return data;
};

module.exports.deletePdf = async (storagePath) => {
  if (!storagePath) return;
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) throw error;
};

module.exports.getSignedPdfUrl = async (storagePath, expiresIn = 300) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
};