import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/";
const apiUrl = new URL(configuredApiUrl);

if (!['http:', 'https:'].includes(apiUrl.protocol)) {
  throw new Error("VITE_API_URL must use http:// or https://");
}

class AuthService {
  constructor() {
    this.axiosInstance = axios.create({ baseURL: apiUrl.toString() });
  }

  authConfig() {
    return { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } };
  }

  register(formData) { return this.axiosInstance.post("users/register", formData); }
  login(data) { return this.axiosInstance.post("users/login", data); }
  forgotPassword(data) { return this.axiosInstance.post("users/forgot-password", data); }
  resetPassword(data) { return this.axiosInstance.post("users/reset-password", data); }
  getProfile() { return this.axiosInstance.get("users/profile", this.authConfig()); }
  logout() { return this.axiosInstance.get("users/logout", this.authConfig()); }

  loginUser(data) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  logoutUser() {
    localStorage.removeItem("isLoggedIn"); localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("user");
  }
  isLoggedIn() { return localStorage.getItem("isLoggedIn") === "true"; }
  getUserData() { const user = localStorage.getItem("user"); return user ? JSON.parse(user) : null; }

  uploadPdf(formData) { return this.axiosInstance.post("ai/pdf", formData, this.authConfig()); }
  singlePdfUpload(formData) { return this.uploadPdf(formData); }
  getPdfs() { return this.axiosInstance.get("ai/get-pdf", this.authConfig()); }
  getPDFs() { return this.getPdfs(); }
  getPdfUrl(id) { return this.axiosInstance.get(`ai/pdf/${id}/url`, this.authConfig()); }
  deletePdf(id) { return this.axiosInstance.delete(`ai/pdf/${id}`, this.authConfig()); }
  chatWithPdf(data) { return this.axiosInstance.post("ai/chat-with-pdf", data, this.authConfig()); }
  getPdfChats(id) { return this.axiosInstance.get(`ai/single-pdf-chat?pdf_id=${id}`, this.authConfig()); }
  getSinglePdfChats(id) { return this.getPdfChats(id); }
  uploadMultiplePdfs(formData) { return this.axiosInstance.post("ai/pdfs", formData, this.authConfig()); }
  multiplePdfUpload(formData) { return this.uploadMultiplePdfs(formData); }
  chatWithMultiplePdfs(data) { return this.axiosInstance.post("ai/chat-with-multiple-pdf", data, this.authConfig()); }
  askQuestionwithPdfs(data) { return this.chatWithMultiplePdfs(data); }
  getPdfConversations() { return this.axiosInstance.get("ai/pdf-conversations", this.authConfig()); }
  getPdfConversationMessages(id) { return this.axiosInstance.get(`ai/pdf-conversation-messages?conversation_id=${id}`, this.authConfig()); }
}

export default new AuthService();
