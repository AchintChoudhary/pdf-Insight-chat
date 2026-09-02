const { createClient } = require("@supabase/supabase-js");

const bucket = "pdfs";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase storage is not configured");
  }

  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error("SUPABASE_URL must be a valid URL");
  }

  return createClient(supabaseUrl, supabaseSecretKey);
};

const getStorage = () => {
  return getSupabaseClient().storage.from(bucket);
};

module.exports.uploadPdf = async (buffer, storagePath, contentType = "application/pdf") => {
  const { data, error } = await getStorage().upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return data;
};

module.exports.deletePdf = async (storagePath) => {
  if (!storagePath) return;
  const { error } = await getStorage().remove([storagePath]);
  if (error) throw error;
};

module.exports.getSignedPdfUrl = async (storagePath, expiresIn = 300) => {
  const { data, error } = await getStorage().createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
};