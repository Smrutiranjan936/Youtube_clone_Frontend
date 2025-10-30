import React, { useEffect, useState } from "react";
import axios from "axios";

function Creator() {
  const [videos, setVideos] = useState([]);
  const [showCommentBox, setShowCommentBox] = useState({});
  const [comments, setComments] = useState({});
  const token=localStorage.getItem('token');
  useEffect(() => {
    const user=JSON.parse(localStorage.getItem("user"));
    axios
      .get("http://localhost:8000/api/getVideoByUserId/"+user._id,{
                headers: { Authorization: token }
            })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setVideos(response.data);
        } else {
          console.warn("Unexpected response format:", response.data);
          setVideos([]);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the videos!", error);
      });
  }, []);

  const handleLike = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/likeVideo/${id}`, {
        userId: "dummyUser",headers:{Authorization:token}
      });
      setVideos((prev) =>
        prev.map((v) =>
          v._id === id ? { ...v, likes: [...v.likes, { userId: "dummyUser" }] } : v
        )
      );
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleDislike = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/dislikeVideo/${id}`, {
        userId: "dummyUser",headers:{Authorization:token}
      });
      setVideos((prev) =>
        prev.map((v) =>
          v._id === id
            ? { ...v, dislikes: [...v.dislikes, { userId: "dummyUser" }] }
            : v
        )
      );
    } catch (error) {
      console.error("Error disliking video:", error);
    }
  };

  const toggleCommentBox = (id) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCommentSubmit = async (id) => {
    if (!comments[id] || comments[id].trim() === "") return;
    try {
      await axios.post(`http://localhost:8000/api/commentVideo/${id}`, {
        text: comments[id],
        userId: "dummyUser",
        headers:{Authorization:token}
      });
      alert("Comment added!");
      setComments((prev) => ({ ...prev, [id]: "" }));
      setShowCommentBox((prev) => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  return (
    <div className="youtube-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li>🏠 Home</li>
          <li>📈 Dashboard</li>
          <li>🎥 My Videos</li>
          <li>⬆️ Upload</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>🎬 Creator Dashboard</h1>
        {videos.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          <div className="video-grid">
            {videos.map((video) => (
              <div key={video._id} className="video-card">
                <div className="video-wrapper">
                  <img
                    src={
                      video.thumbnailUrl
                        ? `http://localhost:8000/${video.thumbnailUrl}`
                        : "https://via.placeholder.com/300x200?text=No+Thumbnail"
                    }
                    alt={video.title}
                  />
                  {video.videoUrl && (
                    <video
                      src={`http://localhost:8000/${video.videoUrl}`}
                      muted
                      loop
                      preload="metadata"
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => e.target.pause()}
                    />
                  )}
                </div>

                <h3>{video.title || "Untitled Video"}</h3>
                <p>{video.description || "No description"}</p>

                <div className="video-actions">
                  <button onClick={() => handleLike(video._id)}>
                    👍 {video.likes?.length ?? 0}
                  </button>
                  <button onClick={() => handleDislike(video._id)}>
                    👎 {video.dislikes?.length ?? 0}
                  </button>
                  <button onClick={() => toggleCommentBox(video._id)}>
                    💬 Comment
                  </button>
                </div>

                {showCommentBox[video._id] && (
                  <div className="comment-box">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={comments[video._id] || ""}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [video._id]: e.target.value,
                        }))
                      }
                    />
                    <button onClick={() => handleCommentSubmit(video._id)}>
                      Submit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Styles */}
      <style>{`
        body {
          background-color: #0f0f0f;
          color: #fff;
          font-family: Arial, sans-serif;
        }

        .youtube-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .sidebar {
          width: 200px;
          background: #181818;
          padding: 20px;
        }

        .sidebar h2 {
          color: #ff0000;
          font-size: 18px;
          margin-bottom: 15px;
        }

        .sidebar ul {
          list-style: none;
          padding: 0;
        }

        .sidebar li {
          padding: 10px 0;
          cursor: pointer;
        }

        .sidebar li:hover {
          color: #ff0000;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .video-card {
          background: #202020;
          border-radius: 10px;
          padding: 10px;
          transition: transform 0.3s;
        }

        .video-card:hover {
          transform: scale(1.02);
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          height: 160px;
          border-radius: 8px;
          overflow: hidden;
        }

        .video-wrapper img,
        .video-wrapper video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 8px;
          transition: opacity 0.3s ease-in-out;
        }

        .video-wrapper video {
          opacity: 0;
          pointer-events: none;
        }

        .video-wrapper:hover video {
          opacity: 1;
          pointer-events: auto;
        }

        .video-wrapper:hover img {
          opacity: 0;
        }

        .video-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .video-actions button {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 16px;
        }

        .video-actions button:hover {
          color: #ff0000;
          transform: scale(1.1);
        }

        .comment-box {
          margin-top: 10px;
        }

        .comment-box input {
          width: 100%;
          padding: 6px;
          border-radius: 4px;
          border: none;
        }

        .comment-box button {
          margin-top: 5px;
          width: 100%;
          background-color: #ff0000;
          color: #fff;
          border: none;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default Creator;
