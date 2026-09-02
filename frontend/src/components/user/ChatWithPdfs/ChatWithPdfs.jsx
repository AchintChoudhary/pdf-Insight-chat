import React, { useEffect, useRef, useState } from "react";

import Layout from "../../Layouts/Layout/Layout";
import AuthService from "../../../services/AuthService";
import { useParams, useNavigate } from "react-router-dom";
import "./ChatWithPdfs.css";

const ChatWithPdfs = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState({});
  const [type, setType] = useState(0);
  const [conversations, setConversations] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  
    setMessages([]);
    setConversations([]);
    setSelectedConversation(null);

    const getConversation = async () => {
      try {
        const response = await AuthService.getPdfConversations(id);
        const data = response.data;
      
        if (data.success) {
          setConversations(data.data);
        } else {
          alert(data.msg);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getConversation();
  }, [id, navigate]);


  const sendMessage = async () => {
    setErrors({});

    setLoading(true);
    const userMessageObj = {
      _id: new Date().getTime(),
      user_message: message,
      ai_message: "",
    };

    setMessages((prevMessages) => [...prevMessages, userMessageObj]);
    setMessage("");
    const formData = new FormData();
  
    formData.append("question", message);
    formData.append("type", type);
    formData.append(
      "conversation_id",
      selectedConversation ? selectedConversation._id : "",
    );

    try {
      const response = await AuthService.askQuestionwithPdfs(formData);
      const data = response.data;

      if (data.success) {
        // alert(data.msg);

     const aiMessageObj = {
  _id: userMessageObj._id,
  user_message: userMessageObj.user_message,
  ai_message: data.message, 
};


        if (!selectedConversation) {
          setConversations((preConversations) => [
            {
              _id: data.conversation?._id || data.conversation_id,
              last_message: data.message,
             
      updatedAt: new Date(),
      createdAt: new Date(),
            },
            ...preConversations,
          ]);
          setSelectedConversation({
            _id: data.conversation?._id || data.conversation_id,
            last_message: data.message,
            
          });
        } else {
        setConversations((preConversations)=>{
      const updated =preConversations.map((conv)=>  conv._id === selectedConversation._id
                ? { ...conv, last_message: data.message }
                : conv 
              );
           const moveToTop=updated.find(conv=>conv._id===selectedConversation._id)

const others=updated.filter(conv=>conv._id !==selectedConversation._id)
return [moveToTop, ...others]

        })
        }

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === userMessageObj._id ? aiMessageObj : msg,
          ),
        );
        setLoading(false);
      } else {
        alert(data.msg);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);

      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 401)
      ) {
        if (error.response.data.errors) {
          const apiErrors = error.response.data.errors;
          const newErrors = {};

          apiErrors.forEach((apiError) => {
            newErrors[apiError.path] = apiError.msg;
          });

          setErrors(newErrors);
        } else {
          alert(error.response.data.msg || error.message);
        }
      } else {
        alert(error.message);
      }
      setLoading(false);
    }
  };

  const loadMessages = async (conv) => {
    setSelectedConversation(conv);
    try {
      const response = await AuthService.getPdfConversationMessages(conv._id);

      const data = response.data;
      if (data.success) {
      const normalizedMessages = (data.data || []).map((m, index) => ({
    _id: m?._id || index,
    user_message: m?.user_message || "",
    ai_message: m?.ai_message || "",
  }));

  setMessages(normalizedMessages);
        console.log(data);
      } else {
        alert(data.msg);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const truncateMessage = (message, wordLimit = 8) => {
    const words = message.split(" ");
    if (words.length <= wordLimit) {
      return message;
    }
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  return (
    <Layout>
      <h3 className="mb-4">
    Chat With Multiple PDF
      </h3>

      <div className="row">
        <div className="col-md-4">
          <h5 className="text-black ">Conversations</h5>
          <div className="list-group">
            {conversations.length ? (
              conversations.map((conv) => (
                <a
                  href="#!"
                  key={conv._id}
                  className={`list-group-item list-group-item-action ${selectedConversation && selectedConversation._id === conv._id ? "active" : ""}`}
                  onClick={() => {
                    loadMessages(conv);
                  }}
                >
                  <div>
                    <p className="mb-1">{truncateMessage(conv.last_message)}</p>
                    <small className="text-muted">
                      {new Date(conv.updatedAt).toLocaleString()}
                    </small>
                  </div>
                </a>
              ))
            ) : (
              <div className="p-2">No Conversation found!</div>
            )}
          </div>
        </div>
        <div className="col-md-8">
          <div className="container">
            <div className="card">
              <div className="card-body">
                <div
                  className="mb-3"
                  style={{
                    maxHeight: "300px",
                    overflow: "auto",
                    height: "300px",
                  }}
                >
                  {messages?.length > 0 ? (
  messages
    .filter((msg) => msg && msg._id)   // removes undefined/null
    .map((msg) => (
      <div key={msg._id} className="mb-3">

        {msg?.user_message && (
          <div className="text-end mt-2">
            <div className="d-inline-block p-2 rounded bg-light">
              <p className="mb-1">
                <strong>Question:- </strong>
                {msg.user_message}
              </p>
            </div>
          </div>
        )}

        {msg?.ai_message && (
          <div className="text-start mt-1">
            <div className="d-inline-block p-2 rounded bg-light text-dark">
              <p className="mb-1">
                <strong>Answer:- </strong>
                {msg.ai_message}
              </p>
            </div>
          </div>
        )}

      </div>
    ))
) : (
  <div>No messages yet.</div>
)}


                  {loading && (
                    <div className="text-start mt-1">
                      <div className="d-inline-block p-2 rounded bg-light text-dark">
                        <p className="mb-1">
                        
                          <span className="typing-bots">
                            Typing<span>.</span>
                            <span>.</span>
                            <span>.</span>
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="row">
                  <div className="col-md-10">
                    <textarea
                      className="form-control"
                      placeholder="Type a message..."
                      rows="3"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                      }}
                    ></textarea>
                    {errors.message && (
                      <div className="text-danger">{errors.message}</div>
                    )}
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-primary" onClick={sendMessage}>
                      send message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatWithPdfs;




