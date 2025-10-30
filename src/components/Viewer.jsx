import React, { useState, useEffect } from "react";
import axios from "axios";

function Viewer() {
  const [videos, setVideos] = useState([]);
  const [showCommentBox, setShowCommentBox] = useState({});
  const [comments, setComments] = useState({});
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const token = localStorage.getItem('token');
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    fetchVideos();
    if (storedUser) fetchSubscriptions(storedUser._id);
  }, []);

  // Fetch all videos
  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/getAllVideos", {
        headers: { Authorization: token }
      });
      setVideos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Fetch subscriptions for current user
  const fetchSubscriptions = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/getSubscriptions/${userId}`, {
        headers: { Authorization: token }
      });
      setSubscriptions(res.data.subscribedTo || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  // Subscribe / Unsubscribe
  const handleSubscribe = async (uploaderId) => {
    if (!user) {
      alert("Please log in to subscribe.");
      return;
    }

    try {
      if (subscriptions.includes(uploaderId)) {
        // Unsubscribe
        await axios.post(`http://localhost:8000/api/unsubscribe/${uploaderId}`, {
          userId: user._id,
        }, {
          headers: { Authorization: token }
        });
        setSubscriptions((prev) => prev.filter((id) => id !== uploaderId));
      } else {
        // Subscribe
        await axios.post(`http://localhost:8000/api/subscribe/${uploaderId}`, {
          userId: user._id,
        }, {
          headers: { Authorization: token }
        });
        setSubscriptions((prev) => [...prev, uploaderId]);
      }
    } catch (error) {
      console.error("Error subscribing/unsubscribing:", error);
    }
  };

  // Like video
  const handleLike = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/likeVideo/${id}`, { userId: user._id },{
                headers: { Authorization: token }
            });
      fetchVideos();
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  // Dislike video
  const handleDislike = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/dislikeVideo/${id}`, { userId: user._id },{
                headers: { Authorization: token }
            });
      fetchVideos();
    } catch (error) {
      console.error("Error disliking video:", error);
    }
  };

  // Show / Hide comment box
  const toggleCommentBox = (id) => {
    setShowCommentBox((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Submit comment
  const handleCommentSubmit = async (id) => {
    if (!comments[id] || comments[id].trim() === "") return;
    try {
      await axios.post(`http://localhost:8000/api/commentVideo/${id}`, {
        text: comments[id],
        userId: user._id,
      },{
                headers: { Authorization: token }
            });
      setComments((prev) => ({ ...prev, [id]: "" }));
      fetchVideos();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="youtube-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">YouTube</h2>
        <ul>
          <li>🏠 Home</li>
          <li>🔥 Trending</li>
          <li>🎵 Music</li>
          <li>🎮 Gaming</li>
          <li>🎥 Subscriptions</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {videos.length === 0 ? (
          <p className="no-videos">No videos available.</p>
        ) : (
          <div className="video-grid">
            {videos.map((video) => {
              const uploaderId = video.uploader?._id;

              return (
                <div key={video._id} className="video-card">
                  <div className="video-wrapper">
                    {video.videoUrl ? (
                      <video
                        src={`http://localhost:8000/${video.videoUrl}`}
                        poster={
                          video.thumbnailUrl
                            ? `http://localhost:8000/${video.thumbnailUrl}`
                            : "https://via.placeholder.com/300x200?text=No+Thumbnail"
                        }
                        controls
                      />
                    ) : (
                      <img
                        src={
                          video.thumbnailUrl
                            ? `http://localhost:8000/${video.thumbnailUrl}`
                            : "https://via.placeholder.com/300x200?text=No+Thumbnail"
                        }
                        alt={video.title}
                      />
                    )}
                  </div>

                  <div className="video-info">
                    <h3>{video.title || "Untitled Video"}</h3>
                    <p className="desc">{video.description || "No description"}</p>

                    <div className="video-meta">
                      <span className="uploader">
                        👤 {video.uploader?.username || "Unknown"}
                      </span>

                      {/* Subscribe / Unsubscribe Button */}
                      {user && uploaderId && uploaderId !== user._id && (
                        <button
                          className={`subscribe-btn ${subscriptions.includes(uploaderId) ? "subscribed" : ""}`}
                          onClick={() => handleSubscribe(uploaderId)}
                        >
                          {subscriptions.includes(uploaderId) ? "Unsubscribe" : "Subscribe"}
                        </button>
                      )}
                    </div>

                    {/* Like / Dislike / Comment */}
                    <div className="video-actions">
                      <button onClick={() => handleLike(video._id)}>👍 {video.likes?.length ?? 0}</button>
                      <button onClick={() => handleDislike(video._id)}>👎 {video.dislikes?.length ?? 0}</button>
                      <button onClick={() => toggleCommentBox(video._id)}>💬 Comment</button>
                    </div>

                    {/* Comment Box */}
                    {showCommentBox[video._id] && (
                      <div className="comment-box">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={comments[video._id] || ""}
                          onChange={(e) =>
                            setComments((prev) => ({ ...prev, [video._id]: e.target.value }))
                          }
                        />
                        <button onClick={() => handleCommentSubmit(video._id)}>Submit</button>
                      </div>
                    )}

                    {/* Comments List */}
                    {video.comments && video.comments.length > 0 && (
                      <div className="comment-list">
                        <h4>Comments:</h4>
                        {video.comments.map((c, i) => (
                          <p key={i} className="comment">
                            <strong>{c.userId?.username || "User"}:</strong> {c.text}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CSS Styling */}
      <style>{`
        body { margin:0; padding:0; font-family:'Poppins',sans-serif; background-color:#0f0f0f; color:#fff; }
        .youtube-page { display:flex; height:100vh; overflow:hidden; }
        .sidebar { width:240px; background-color:#181818; padding:25px; border-right:1px solid #2a2a2a; display:flex; flex-direction:column; }
        .logo { color:#ff4b4b; font-weight:bold; font-size:22px; margin-bottom:25px; text-align:center; }
        .sidebar ul { list-style:none; padding:0; margin:0; }
        .sidebar li { padding:12px 10px; font-size:15px; color:#bbb; border-radius:6px; cursor:pointer; transition:0.3s; }
        .sidebar li:hover { background-color:#2a2a2a; color:#fff; }
        .main-content { flex:1; overflow-y:auto; padding:20px 40px; background-color:#0f0f0f; }
        .video-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(350px,1fr)); gap:25px; }
        .video-card { background-color:#202020; border-radius:12px; overflow:hidden; transition:transform 0.3s ease, box-shadow 0.3s ease; box-shadow:0px 3px 8px rgba(0,0,0,0.4); }
        .video-card:hover { transform:translateY(-6px); box-shadow:0px 6px 20px rgba(0,0,0,0.6); }
        .video-wrapper video, .video-wrapper img { width:100%; height:200px; object-fit:cover; }
        .video-info { padding:15px; }
        .video-info h3 { font-size:18px; color:#fff; margin:5px 0; }
        .desc { color:#aaa; font-size:14px; margin-bottom:8px; }
        .video-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .uploader { color:#ddd; font-size:13px; }
        .subscribe-btn { background-color:#ff0000; border:none; padding:6px 14px; border-radius:20px; color:white; cursor:pointer; font-weight:500; transition:all 0.3s ease; }
        .subscribe-btn:hover { background-color:#e60000; transform:scale(1.05); }
        .subscribe-btn.subscribed { background-color:#3a3a3a; color:#ccc; }
        .subscribe-btn.subscribed:hover { background-color:#444; }
        .video-actions { display:flex; justify-content:space-around; margin:12px 0; }
        .video-actions button { background:none; border:none; color:#fff; cursor:pointer; font-size:16px; transition:0.3s; }
        .video-actions button:hover { color:#ff0000; transform:scale(1.1); }
        .comment-box { display:flex; flex-direction:column; gap:8px; margin-top:10px; }
        .comment-box input { padding:8px; border-radius:6px; border:none; outline:none; }
        .comment-box button { background-color:#ff0000; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; transition:0.3s; }
        .comment-box button:hover { background-color:#cc0000; }
        .comment-list { margin-top:12px; background-color:#282828; padding:10px; border-radius:8px; }
        .comment { margin:5px 0; font-size:14px; color:#ddd; }
        .comment strong { color:#fff; }
        .no-videos { text-align:center; color:#999; font-size:18px; margin-top:60px; }
      `}</style>
    </div>
  );
}

export default Viewer;
