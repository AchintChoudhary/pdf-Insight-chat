import axios from "axios";

class AuthService {
  url = import.meta.env.VITE_API_URL || "http://localhost:8000/";

  constructor() {
    this.axiosInstance = axios.create();
  }

  authConfig() {
    return { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } };
  }

  register(formData) { return axios.post(`${this.url}users/register`, formData); }
  login(data) { return axios.post(`${this.url}users/login`, data); }
  forgotPassword(data) { return axios.post(`${this.url}users/forgot-password`, data); }
  resetPassword(data) { return axios.post(`${this.url}users/reset-password`, data); }
  getProfile() { return this.axiosInstance.get(`${this.url}users/profile`, this.authConfig()); }
  logout() { return this.axiosInstance.get(`${this.url}users/logout`, this.authConfig()); }

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

  uploadPdf(formData) { return this.axiosInstance.post(`${this.url}ai/pdf`, formData, this.authConfig()); }
  singlePdfUpload(formData) { return this.uploadPdf(formData); }
  getPdfs() { return this.axiosInstance.get(`${this.url}ai/get-pdf`, this.authConfig()); }
  getPDFs() { return this.getPdfs(); }
  getPdfUrl(id) { return this.axiosInstance.get(`${this.url}ai/pdf/${id}/url`, this.authConfig()); }
  deletePdf(id) { return this.axiosInstance.delete(`${this.url}ai/pdf/${id}`, this.authConfig()); }
  chatWithPdf(data) { return this.axiosInstance.post(`${this.url}ai/chat-with-pdf`, data, this.authConfig()); }
  getPdfChats(id) { return this.axiosInstance.get(`${this.url}ai/single-pdf-chat?pdf_id=${id}`, this.authConfig()); }
  getSinglePdfChats(id) { return this.getPdfChats(id); }
  uploadMultiplePdfs(formData) { return this.axiosInstance.post(`${this.url}ai/pdfs`, formData, this.authConfig()); }
  multiplePdfUpload(formData) { return this.uploadMultiplePdfs(formData); }
  chatWithMultiplePdfs(data) { return this.axiosInstance.post(`${this.url}ai/chat-with-multiple-pdf`, data, this.authConfig()); }
  askQuestionwithPdfs(data) { return this.chatWithMultiplePdfs(data); }
  getPdfConversations() { return this.axiosInstance.get(`${this.url}ai/pdf-conversations`, this.authConfig()); }
  getPdfConversationMessages(id) { return this.axiosInstance.get(`${this.url}ai/pdf-conversation-messages?conversation_id=${id}`, this.authConfig()); }
}

export default new AuthService();
