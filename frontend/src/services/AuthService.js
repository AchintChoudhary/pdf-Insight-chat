import axios from "axios";

class AuthService {
  url = import.meta.env.VITE_API_URL || "http://localhost:8000/";
  configMultipartData = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  configJsonData = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  authMultiPart = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
  };

  authconfigJsonData() {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    };
  }

  constructor() {
    this.axiosInstance = axios.create();
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            //if refresh token is not expired
            await this.refreshToken();
            const newAccessToken = localStorage.getItem("accessToken");
            originalRequest.headers["Authorization"] =
              "Bearer " + newAccessToken;
            return this.axiosInstance(originalRequest);
          } catch (e) {
            //refresh token also expired
            this.logoutUser();
            window.location.href = "/login";
            return Promise.reject(e);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  async refreshToken() {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const authorizationHeader = {
      headers: {
        Authorization: "Bearer " + storedRefreshToken,
      },
    };
    const response = await axios.get(
      this.url + "refresh-token",
      authorizationHeader,
    );
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  register(formData) {
    return axios.post(
      this.url + "users/register",
      formData,
      this.configMultipartData,
    );
  }

  login(formData) {
    return axios.post(this.url + "users/login", formData, this.configJsonData);
  }

  forgotPassword(formData) {
    return axios.post(
      this.url + "users/forgot-password",
      formData,
      this.configJsonData,
    );
  }

  loginUser(data) {
    localStorage.setItem("isLoggedIn", true);
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("user");
  }

  isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
  }

  getUserData() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  setUserData(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }

  createBot(formData) {
    return axios.post(
      this.url + "admin/add-chat-bot",
      formData,
      this.authMultiPart,
    );
  }
  updateBot(formData) {
    return axios.put(
      this.url + "admin/update-chat-bot",
      formData,
      this.authMultiPart,
    );
  }
  getBots() {
    return axios.get(
      this.url + "admin/get-chat-bot",
      this.authconfigJsonData(),
    );
  }
  deleteBot(data) {
    return axios.delete(this.url + "admin/delete-chat-bot", {
      data: data,
      ...this.authconfigJsonData(),
    });
  }

  getUserBots() {
    return axios.get(this.url + "ai/get-chat-bot", this.authconfigJsonData());
  }
  getBot(id) {
    return axios.get(
      this.url + "ai/get-chat-bot/?id=" + id,
      this.authconfigJsonData(),
    );
  }
  sendMessage(formData) {
    return axios.post(
      this.url + "chat/send-messages",
      formData,
      this.authconfigJsonData(),
    );
  }

  getConversations(id) {
    return axios.get(
      this.url + "ai/conversations?chat_bot_id=" + id,
      this.authconfigJsonData(),
    );
  }

  getConversationMessages(id) {
    return axios.get(
      this.url + "chat/get-messages?conversation_id=" + id,
      this.authconfigJsonData(),
    );
  }

  singlePdfUpload(formData) {
    return axios.post(this.url + "ai/pdf", formData, this.authMultiPart);
  }

  getPDFs() {
    return axios.get(this.url + "ai/get-pdf", this.authconfigJsonData());
  }

  chatWithPdf(formData) {
    return axios.post(
      this.url + "ai/chat-with-pdf",
      formData,
      this.authconfigJsonData(),
    );
  }

  getSinglePdfChats(pdf_id) {
    return axios.get(
      this.url + "ai/single-pdf-chat?pdf_id=" + pdf_id,
      this.authconfigJsonData(),
    );
  }

  multiplePdfUpload(formData) {
    return axios.post(this.url + "ai/pdfs", formData, this.authMultiPart);
  }

  getMultiplePdf() {
    return axios.get(this.url + "ai/get-pdfs", this.authconfigJsonData());
  }

  updateEmbedding(formData) {
    return axios.put(
      this.url + "ai/update-chunk",
      formData,
      this.authconfigJsonData(),
    );
  }

  deleteEmbedding(formData) {
    return axios.delete(this.url + "ai/delete-pdf-data", {
      data: formData,
      ...this.authconfigJsonData(),
    });
  }

 getPdfConversations() {
    return axios.get(
      this.url + "ai/pdf-conversations",
      this.authconfigJsonData(),
    );
  }



  getPdfConversationMessages(id) {
    return axios.get(
      this.url + "ai/pdf-conversation-messages?conversation_id=" + id,
      this.authconfigJsonData(),
    );
  }

  askQuestionwithPdfs(formData) {
    return axios.post(
      this.url + "ai/chat-with-multiple-pdf",
      formData,
      this.authconfigJsonData(),
    );
  }
  

}

export default new AuthService();
