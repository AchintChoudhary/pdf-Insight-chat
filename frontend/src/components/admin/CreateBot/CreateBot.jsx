import React, { useState, useEffect } from "react";
import AuthService from "../../../services/AuthService";

const CreateBot = ({
  id,
  title,
  isEditing, 
  selectedBot,
  show,
  onClose,
  onBotCreated,
}) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [prompt_message, setPromptMessage] = useState("");
  const [image, setImage] = useState(null);
  const [type, setType] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setName("");
    setMessage("");
    setPromptMessage("");
    setImage(null);
    setType(0);
    setErrors({});

if(isEditing && selectedBot){
 setName(selectedBot.name);
    setMessage(selectedBot.message);
    setPromptMessage(selectedBot.prompt_message);
    setImage(null);
    setType(selectedBot.type);
    
}


  }, [isEditing,selectedBot]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData();
    if(image){
      formData.append('image',image)
    }
    if(isEditing){
      formData.append('id',selectedBot._id)
    }
   
    formData.append("name", name);
    formData.append("message", message);
    formData.append("prompt_message", prompt_message);
    formData.append("type", type);

    try {
      let response;
if(isEditing && selectedBot){
   response = await AuthService.updateBot(formData);
}else{
    response = await AuthService.createBot(formData);
}


   

      console.log(response.data);

      alert(response.data.msg);
      onBotCreated(response.data);
    
      setName("");
      setMessage("");
      setPromptMessage("");
      setImage(null);
      setType(0);
      setErrors({});
      onClose(); // close modal only after success
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
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label>Select Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  {errors.image && (
                    <div className="text-danger">{errors.image}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label>Enter Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    placeholder="Enter Name"
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <div className="text-danger">{errors.name}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label>Enter Message</label>
                  <textarea
                    className="form-control"
                    value={message}
                    placeholder="Enter Message"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  {errors.message && (
                    <div className="text-danger">{errors.message}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label>Enter Prompt Message</label>
                  <textarea
                    className="form-control"
                    value={prompt_message}
                    placeholder="Enter Prompt Message"
                    onChange={(e) => setPromptMessage(e.target.value)}
                  />
                  {errors.prompt_message && (
                    <div className="text-danger">{errors.prompt_message}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label>Select Type</label>
                  <select
                    className="form-control"
                    value={type}
                    onChange={(e) => setType(Number(e.target.value))}
                  >
                    <option value={0}>Text</option>
                    <option value={1}>Image</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>

                <button type="submit" className="btn btn-primary">
                  {isEditing? "Update":"create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default CreateBot;
