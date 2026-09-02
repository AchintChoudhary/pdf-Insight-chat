import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import AuthService from "./services/AuthService";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import SinglePdfChat from "./components/user/SinglePdfChat/SinglePdfChat";
import MultiplePdfChat from "./components/user/MultiplePdfChat/MultiplePdfChat";
import ChatWithPdfs from "./components/user/ChatWithPdfs/ChatWithPdfs";

// Unprotected Route
const UnProtectedRoute = ({ element: Element }) => {
  const isAuthenticated = AuthService.isLoggedIn();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Element />;
};

// Common Protected Route (only for logged-in users)
const ProtectedRoute = ({ element: Element }) => {
  const isAuthenticated = AuthService.isLoggedIn();
  return isAuthenticated ? <Element /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Unprotected Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<UnProtectedRoute element={Login} />} />
        <Route
          path="/register"
          element={<UnProtectedRoute element={Register} />}
        />
        <Route
          path="/forgot-password"
          element={<UnProtectedRoute element={ForgotPassword} />}
        />
        <Route
          path="/reset-password/:token"
          element={<UnProtectedRoute element={ResetPassword} />}
        />

        {/* Protected Common route for admin & User */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={Dashboard} />}
        />
        <Route
          path="/single-pdf-chat"
          element={<ProtectedRoute element={SinglePdfChat} />}
        />
        <Route
          path="/multiple-pdf-chat"
          element={<ProtectedRoute element={MultiplePdfChat} />}
        />
        <Route
          path="/chat-with-pdfs"
          element={<ProtectedRoute element={ChatWithPdfs} />}
        />

      </Routes>
    </Router>
  );
}

export default App;
