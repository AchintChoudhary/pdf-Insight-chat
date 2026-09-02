import React, { useState, useEffect } from "react";
import AuthService from "../../../services/AuthService";
import { Link } from "react-router-dom";
const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bots, setBots] = useState([]);
  const togleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const fetchBot = async () => {
      try {
        const response = await AuthService.getUserBots();
        const data = response.data;

        if (data.success) {
          setBots(data.data);
          
        }
      } catch (error) {
        alert(error.message);
      }
    };
    fetchBot();
  }, []);

  return (
    <>
      <ul className="list-unstyled components mb-s">
        <div className="dropdown">
          <li onClick={togleDropdown} aria-expanded={isOpen}>
            <a href="#">Chat Bots</a>
          </li>

          <div className={`dropdown-menu  ${isOpen ? "show" : ""}`}>
            {bots.map((bot) => (
              <Link
                key={bot._id}
                className="dropdown-item show"
                to={`/chat/${bot._id}`}  //Link to ChatPage
              >
                {bot.name}
              </Link>
            ))}
          </div>
        </div>

        <li className="active">
          <Link className="dropdown-item" to={'/single-pdf-chat'}>Singel PDF Chat</Link>
        </li>
          <li className="active">
          <Link className="dropdown-item" to={'/multiple-pdf-chat'}>Multiple PDF Chat</Link>
        </li>
      </ul>
    </>
  );
};

export default Menu;
