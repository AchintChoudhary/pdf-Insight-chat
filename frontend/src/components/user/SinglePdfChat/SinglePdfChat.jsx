import React, { useState, useEffect } from "react";
import Layout from "../../Layouts/Layout/Layout";
import AuthService from "../../../services/AuthService";

const SinglePdfChat = () => {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [selectesPdfId, setSelectedPdfId] = useState("");
  const [userQuestion, setUserQuestion] = useState("");
const [messages,setMessages]=useState([])
const [chatLoading,setChatLoading]=useState(false)
  useEffect(() => {
    getPdfs();
  }, []);

  const getPdfs = async () => {
    try {
      const response = await AuthService.getPDFs();

      setPdfData(response.data.data);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status == 401)
      ) {
        if (error.response.data.errors) {
          const apiErrors = error.response.data.errors;
          const newErrors = {};
          apiErrors.forEach((apiError) => {
            newErrors[apiError.path] = apiError.msg;
          });
          setErrors(newErrors);
        } else {
          alert(
            error.response.data.msg ? error.response.data.msg : error.message,
          );
        }
      } else {
        alert(error.message);
      }
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFile(selectedFile);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await AuthService.singlePdfUpload(formData);
      const data = response.data;
      setLoading(false);
      if (data.success) {
        e.target.reset();
        setFile(null);
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status == 401)
      ) {
        if (error.response.data.errors) {
          const apiErrors = error.response.data.errors;
          const newErrors = {};
          apiErrors.forEach((apiError) => {
            newErrors[apiError.path] = apiError.msg;
          });
          setErrors(newErrors);
        } else {
          alert(
            error.response.data.msg ? error.response.data.msg : error.message,
          );
        }
      } else {
        alert(error.message);
      }
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setChatLoading(true)
    const userMessageObj={
  _id:new Date().getTime(),
  user_message:userQuestion,
ai_message:""
}


setMessages((preMessages)=>[...preMessages,userMessageObj])
    try {
      const response = await AuthService.chatWithPdf({
        pdf_id: selectesPdfId,
        question: userQuestion,
      });

      const data = response.data;
      console.log(data);
     
      if (data.success) {
        setUserQuestion("");
        
const aiMessageFromApi = Array.isArray(data.data)
  ? data.data[0]
  : data.data;
const aiMessageObj = {
  _id: aiMessageFromApi?._id || userMessageObj._id,
  user_message:data.data.user_message,
  ai_message: data.data.ai_message
};

setMessages((prevMessages)=>prevMessages.map((msg)=>
msg._id===userMessageObj._id? aiMessageObj: msg
))


      } else {
        alert(data.msg);
      }
       setChatLoading(false)
    } catch (error) {
      setChatLoading(false)
      alert(error.message);
    }
  };

const handlePdfChange=async(event)=>{
setSelectedPdfId(event.target.value)

if(event.target.value!=""){
 try {
      const response = await AuthService.getSinglePdfChats(event.target.value);
      const data = response.data;
      if (data.success) {
     setMessages(data.data)
      }
    } catch (error) {
    
      alert(error.message)
    }
}else{
setMessages([])
}


  


}


  return (
    <>
      <Layout>
        <h3 className="mb-4">Single PDF chat</h3>
        <div className="row">
          <div className="col-sm-4">
            <form onSubmit={handleSubmit}>
              <div className="card p-4">
                <div className="mb-3">
                  <label>Upload File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </div>
                {errors.pdf && <div className="errorMessage">{errors.pdf}</div>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-border"></div>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="col-sm-8">
            <form onSubmit={handleSendMessage}>
              <select
                required
                className="form-control"
                value={selectesPdfId}
                onChange={handlePdfChange}
              >
                <option value="">Select a PDF</option>
                {pdfData.length > 0 ? (
                  pdfData.map((pdf) => (
                    <option key={pdf._id} value={pdf._id}>
                      {pdf.file_name}
                    </option>
                  ))
                ) : (
                  <option value="">No PDFs available</option>
                )}
              </select>
              {errors.pdf_id && (
                <div className="errorMessage">{errors.pdf_id}</div>
              )}
              <div className="card mt-2">
                <div className="card-body">
                  <div
                    className="mb-3 "
                    style={{
                      maxHeight: "300px",
                      overflow: "auto",
                      height: "300px",
                    }}
                  >
 {messages?.length > 0? (
                    messages.map((msg) => (
                      <div key={msg._id} className="mb-3">
                        {msg.user_message && (
                          <div className="text-end mt-2">
                            <div className="d-inline-block p-2 rounded bg-light">
                              <p className="mb-1">
                               
                                {msg.user_message}
                              </p>
                            </div>
                          </div>
                        )}
 {msg.ai_message && (
                          <div className="text-start mt-1">
                            <div className="d-inline-block p-2 rounded bg-light text-dark">
                              <p className="mb-1">
                               
                                {msg.ai_message}
                              </p>
                            </div>
                          </div>
                        )}

                      </div>



                    ))
                  ) : (
                    <div> No messages yet.</div>
                  )}

                 {
                  chatLoading && (
                       <div className="text-start mt-1">
                            <div className="d-inline-block p-2 rounded bg-light text-dark">
                              <p className="mb-1">
                               <span className="typing-bots">Typing<span>.</span><span>.</span><span>.</span></span>
                              </p>
                            </div>
                          </div>
                  )
                 } 




                  </div>
                  <div className="row">
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        placeholder="Ask a question..."
                        row="3"
                        value={userQuestion}
                        required
                        onChange={(e) => {
                          setUserQuestion(e.target.value);
                        }}
                      ></textarea>
                    </div>
                    <div className="col-sm-3">
                      <button type="submit" className="btn btn-primary">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SinglePdfChat;
