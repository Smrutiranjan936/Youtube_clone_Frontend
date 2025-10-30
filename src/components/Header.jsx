import { Link } from "react-router-dom";
import { FaYoutube, FaUserCircle, FaVideo, FaSignOutAlt, FaSearch, FaMicrophone } from "react-icons/fa";
import React, { useState } from "react";

function Header({ isLoggedIn, role, setIsLoggedIn, setRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole("");
    window.location.href = "/";
  };

  // 🎤 Voice Search Functionality
  const startVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setSearchQuery(spokenText);
    };

    recognition.start();
  };

  return (
    <>
      <style>{`
        .yt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #202020;
          color: white;
          padding: 8px 20px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .yt-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .yt-logo-icon {
          color: #ff0000;
          font-size: 2rem;
        }

        .yt-logo-text {
          font-size: 1.4rem;
          font-weight: 600;
        }

        .yt-center {
          display: flex;
          align-items: center;
          flex: 0.6;
          justify-content: center;
        }

        .yt-search-input {
          width: 100%;
          max-width: 500px;
          padding: 8px 10px;
          border: 1px solid #444;
          background-color: #121212;
          color: white;
          border-radius: 2px 0 0 2px;
          outline: none;
        }

        .yt-search-btn {
          background-color: #333;
          border: 1px solid #444;
          border-left: none;
          color: white;
          padding: 8px 15px;
          cursor: pointer;
          border-radius: 0 2px 2px 0;
          transition: background 0.2s;
        }

        .yt-search-btn:hover {
          background-color: #444;
        }

        .yt-mic-btn {
          background: none;
          border: none;
          margin-left: 10px;
          font-size: 1.4rem;
          cursor: pointer;
          color: ${isListening ? "#ff0000" : "white"};
          transition: color 0.3s;
        }

        .yt-mic-btn:hover {
          color: #ff0000;
        }

        .yt-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .yt-icon-btn {
          color: white;
          font-size: 1.4rem;
          cursor: pointer;
          background: none;
          border: none;
          transition: color 0.2s;
        }

        .yt-icon-btn:hover {
          color: #ff0000;
        }

        .logout-btn {
          color: #ff5555;
        }

        .yt-auth-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
        }

        .yt-auth-link:hover {
          color: #ff0000;
        }

        @media (max-width: 768px) {
          .yt-center {
            display: none;
          }
        }
      `}</style>

      <header className="yt-header">
        <div className="yt-left">
          <FaYoutube className="yt-logo-icon" />
          <span className="yt-logo-text">YouTube</span>
        </div>

        <div className="yt-center">
          <input
            type="text"
            placeholder="Search"
            className="yt-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="yt-search-btn">
            <FaSearch />
          </button>
          <button className="yt-mic-btn" onClick={startVoiceRecognition}>
            <FaMicrophone />
          </button>
        </div>

        <div className="yt-right">
          {isLoggedIn ? (
            <>
              {role === "creator" && (
                <Link to="/uploadVideo" className="yt-icon-btn" title="Upload Video">
                  <FaVideo />
                </Link>
              )}
              {role === "admin" && (
                <Link to="/adminhome" className="yt-icon-btn" title="Admin Dashboard">
                  <FaUserCircle />
                </Link>
              )}
              {role === "viewer" && (
                <Link to="/viewerhome" className="yt-icon-btn" title="Viewer Home">
                  <FaUserCircle />
                </Link>
              )}
              <button onClick={logout} className="yt-icon-btn logout-btn" title="Logout">
                <FaSignOutAlt />
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="yt-auth-link">Login</Link>
              <Link to="/register" className="yt-auth-link">Register</Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}

export default Header;
