import React, { useState } from 'react';
import AuthService from '../../../services/AuthService';


const DeleteBot = ({show, onClose,bot,onDelete}) => {
 

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Create Bot</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

           
              <div className="modal-body">
{
    bot?(
<p>Are you sure you want to delete <strong>{bot.name}</strong></p>
    ):(
<p>Loading ...</p>
    )
}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  onClick={onDelete}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
         

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default DeleteBot;
