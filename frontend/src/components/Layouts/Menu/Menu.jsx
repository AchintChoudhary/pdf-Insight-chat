import { Link } from "react-router-dom";

export default function Menu() {
  return <ul className="list-unstyled components mb-s">
    <li><Link to="/dashboard">My PDFs</Link></li>
    <li><Link to="/single-pdf-chat">Single PDF Chat</Link></li>
    <li><Link to="/multiple-pdf-chat">Upload PDFs</Link></li>
    <li><Link to="/chat-with-pdfs">PDF Conversations</Link></li>
  </ul>;
}
