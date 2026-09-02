import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import Layout from '../Layouts/Layout/Layout';
import CreateBot from '../CreateBot/CreateBot';
import AuthService from '../../../services/AuthService';
import DeleteBot from '../DeleteBot/DeleteBot';

const AdminDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState(null);

const [selectedEditBot, setSelectedEditBot] = useState(null);

const [isEditing,setIsEditing]=useState(false)

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await AuthService.getBots();
      const data=response.data
      if (data.success) {
        setBots(data.data);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBot = async () => {
    if (!selectedBot) return;

    try {
      await AuthService.deleteBot({ id: selectedBot._id });
      setBots(prev => prev.filter(bot => bot._id !== selectedBot._id));
      setShowDeleteModal(false);
      setSelectedBot(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Chat Bots</h4>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowCreateModal(true)
            setIsEditing(false)
          }
          }
        >
          Create Bot
        </button>
      </div>

     <CreateBot
  id="createModal"
  title={isEditing ? "Edit chat bot" : "Create chat bot"}
  show={showCreateModal}
  onBotCreated={(newBot) => {
    setBots(prevBots => {
      if (isEditing) {
        return prevBots.map(bot =>
          bot._id === newBot._id ? newBot : bot
        );
      }
      return [...prevBots, newBot];
    });
  }}
  isEditing={isEditing}
  selectedBot={selectedEditBot}
  onClose={() => {
    setShowCreateModal(false);
    setIsEditing(false);
    setSelectedEditBot(null);
    fetchBots();
  }}
/>


      <DeleteBot
        show={showDeleteModal}
        bot={selectedBot}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteBot}
      />

      {loading ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Loading chat bots...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Message</th>
                <th>Type</th>
                <th>Status</th>
                <th width="120">Action</th>
              </tr>
            </thead>

            <tbody>
  {bots.filter(Boolean).length === 0 ? (
    <tr>
      <td colSpan="7" className="text-center">
        No bots found
      </td>
    </tr>
  ) : (
    bots.filter(Boolean).map((bot, index) => (
      <tr key={bot?._id || index}>
        <td>{index + 1}</td>

        <td>
          <img
            src={bot?.fullImageUrl }
            alt={bot?.name || 'bot'}
            width="50"
            height="50"
            style={{ objectFit: 'cover', borderRadius: '6px' }}
          />
        </td>

        <td>{bot?.name || '-'}</td>
        <td>{bot?.message || '-'}</td>
        <td>{bot?.type === 0 ? 'Chat Bot' : 'Image Generator'}</td>
        <td>{bot?.status === 1 ? 'Active' : 'Inactive'}</td>

        <td>
          <button onClick={()=>{
 setIsEditing(true)
            setSelectedEditBot(bot)
            setShowCreateModal(true)
          }
           
          } className="btn btn-sm btn-warning me-2">
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              setSelectedBot(bot);
              setShowDeleteModal(true);
            
            }}
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

          </table>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
