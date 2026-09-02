import { useEffect, useState } from "react";
import Layout from "../../Layouts/Layout/Layout";
import AuthService from "../../../services/AuthService";
import "./ChatWithPdfs.css";

export default function ChatWithPdfs() {
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = async () => {
    const response = await AuthService.getPdfConversations();
    setConversations(response.data.data || []);
  };
  useEffect(() => {
    AuthService.getPdfConversations().then((response) => setConversations(response.data.data || [])).catch((reason) => setError(reason.message));
  }, []);

  const loadMessages = async (conversation) => {
    setSelected(conversation); setError("");
    try { const response = await AuthService.getPdfConversationMessages(conversation._id); setMessages(response.data.data || []); }
    catch (reason) { setError(reason.response?.data?.message || reason.message); }
  };
  const send = async (event) => {
    event.preventDefault();
    if (!question.trim() || loading) return;
    const text = question.trim(); setQuestion(""); setLoading(true); setError("");
    try {
      const response = await AuthService.chatWithMultiplePdfs({ question: text, conversation_id: selected?._id });
      const reply = response.data.data;
      setMessages((items) => [...items, reply]);
      await loadConversations();
      if (!selected) setSelected({ _id: response.data.conversation_id, last_message: reply.ai_message });
    } catch (reason) { setError(reason.response?.data?.message || reason.message); }
    finally { setLoading(false); }
  };
  return <Layout><h2 className="mb-4">PDF Conversations</h2><div className="row"><aside className="col-md-4"><div className="list-group">{conversations.map((conversation) => <button type="button" key={conversation._id} className={`list-group-item list-group-item-action ${selected?._id === conversation._id ? "active" : ""}`} onClick={() => loadMessages(conversation)}>{conversation.last_message || "Conversation"}</button>)}{!conversations.length && <div className="p-3 text-muted">No conversations yet.</div>}</div></aside><section className="col-md-8"><div className="card"><div className="card-body" style={{ minHeight: "320px" }}>{messages.map((item) => <div key={item._id} className="mb-3"><div className="text-end"><span className="badge bg-light text-dark">{item.user_message}</span></div><p className="mt-2">{item.ai_message}</p></div>)}{loading && <p className="text-muted">Thinking...</p>}</div><form className="card-footer d-flex gap-2" onSubmit={send}><input className="form-control" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your PDFs" disabled={loading} /><button className="btn btn-primary" disabled={loading || !question.trim()}>Send</button></form></div>{error && <div className="text-danger mt-3">{error}</div>}</section></div></Layout>;
}
