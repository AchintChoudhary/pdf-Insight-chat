import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Layouts/Layout/Layout";
import AuthService from "../../services/AuthService";
import "./Dashboard.css";

export default function Dashboard() {
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPdfs = async () => { const response = await AuthService.getPdfs(); setPdfs(response.data.data || []); };
  useEffect(() => {
    let active = true;
    AuthService.getPdfs().then((response) => { if (active) setPdfs(response.data.data || []); }).catch((error) => { if (active) setStatus(error.response?.data?.message || error.message); });
    return () => { active = false; };
  }, []);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return setStatus("Choose a PDF first");
    setBusy(true); setStatus("Processing PDF...");
    try { const data = new FormData(); data.append("pdf", file); await AuthService.uploadPdf(data); setFile(null); event.target.reset(); await loadPdfs(); setStatus("PDF ready"); }
    catch (error) { setStatus(error.response?.data?.message || error.message); }
    finally { setBusy(false); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this PDF and its conversations?")) return;
    setBusy(true);
    try { await AuthService.deletePdf(id); setPdfs((items) => items.filter((pdf) => pdf._id !== id)); }
    catch (error) { setStatus(error.response?.data?.message || error.message); }
    finally { setBusy(false); }
  };
  const view = async (id) => { const response = await AuthService.getPdfUrl(id); window.open(response.data.data.url, "_blank", "noopener,noreferrer"); };

  return <Layout>
    <div className="d-flex justify-content-between align-items-center mb-4"><h2>My PDFs</h2><Link className="btn btn-outline-primary" to="/multiple-pdf-chat">Chat across PDFs</Link></div>
    <form onSubmit={upload} className="card p-4 mb-4">
      <label className="form-label" htmlFor="pdf-upload">Upload a PDF</label>
      <div className="d-flex gap-2"><input id="pdf-upload" className="form-control" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} /><button className="btn btn-primary" disabled={busy}>Upload</button></div>
      {status && <div className="mt-3 text-muted">{status}</div>}
    </form>
    <div className="table-responsive"><table className="table align-middle"><thead><tr><th>PDF name</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {pdfs.map((pdf) => <tr key={pdf._id}><td>{pdf.originalName}</td><td>{new Date(pdf.createdAt).toLocaleDateString()}</td><td>{pdf.processingStatus}</td><td className="d-flex gap-2"><button className="btn btn-sm btn-outline-secondary" onClick={() => view(pdf._id)}>View</button><Link className="btn btn-sm btn-outline-primary" to={`/single-pdf-chat?pdf=${pdf._id}`}>Chat</Link><button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => remove(pdf._id)}>Delete</button></td></tr>)}
      {!pdfs.length && <tr><td colSpan="4" className="text-muted">No PDFs uploaded yet.</td></tr>}
    </tbody></table></div>
  </Layout>;
}
