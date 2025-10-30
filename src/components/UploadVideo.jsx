import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UploadVideo() {
  const navigate = useNavigate();
  const token=localStorage.getItem('token');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    thumbnail: null,
    video: null,
    duration: "",
    status: "public", // public / private / unlisted
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file changes (auto detect duration)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (name === "video" && file) {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        const durationInSeconds = videoElement.duration;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60)
          .toString()
          .padStart(2, "0");
        const formatted = `${minutes}:${seconds}`;

        setFormData((prev) => ({
          ...prev,
          [name]: file,
          duration: formatted, // Auto-fill duration
        }));
      };

      videoElement.src = URL.createObjectURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: file }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video) {
      setMessage("❌ Please provide at least a title and a video file!");
      return;
    }

    setUploading(true);
    setMessage("");
    let user = localStorage.getItem("user");
    user = JSON.parse(user);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("tags", formData.tags);
      data.append("thumbnail", formData.thumbnail);
      data.append("video", formData.video);
      data.append("duration", formData.duration);
      data.append("status", formData.status);
      data.append("uploader", user._id);
      data.append("views", 0);
      data.append("likes", 0);
      data.append("dislikes", 0);
      data.append("comments", JSON.stringify([]));
      data.append("createdAt", new Date().toISOString());
      data.append("updatedAt", new Date().toISOString());

      await axios.post("http://localhost:8000/api/uploadVideo", data, {
        headers: { "Content-Type": "multipart/form-data",Authorization:token },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      setMessage("✅ Video uploaded successfully!");
      alert("Video uploaded successfully!");
      setUploading(false);
      setProgress(0);

      // Redirect after 2 seconds
      setTimeout(() => navigate("/creatorhome"), 2000);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setMessage("❌ Upload failed. Please try again.");
      setProgress(0);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Poppins', sans-serif",
      padding: "20px",
    },
    card: {
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      padding: "40px",
      width: "100%",
      maxWidth: "550px",
    },
    heading: {
      fontSize: "1.8rem",
      fontWeight: "600",
      textAlign: "center",
      color: "#333",
      marginBottom: "25px",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "14px",
      marginBottom: "15px",
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "14px",
      marginBottom: "15px",
      backgroundColor: "#fff",
    },
    button: {
      width: "100%",
      padding: "12px 0",
      backgroundColor: "#ff4d6d",
      border: "none",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "0.3s",
    },
    progressBar: {
      width: `${progress}%`,
      height: "8px",
      backgroundColor: "#ff4d6d",
      borderRadius: "4px",
      transition: "width 0.3s ease",
      marginTop: "10px",
    },
    message: {
      textAlign: "center",
      marginTop: "15px",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>🎬 Upload Video</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Video Title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <textarea
            name="description"
            placeholder="Video Description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...styles.input, height: "100px", resize: "none" }}
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma-separated)"
            value={formData.tags}
            onChange={handleChange}
            style={styles.input}
          />

          <label>Thumbnail Image:</label>
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.input}
          />

          <label>Video File:</label>
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            style={styles.input}
            required
          />

          <p>
            <strong>Duration:</strong>{" "}
            {formData.duration ? formData.duration : "Calculating..."}
          </p>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>

          <button
            type="submit"
            disabled={uploading}
            style={{
              ...styles.button,
              backgroundColor: uploading ? "#999" : "#ff4d6d",
            }}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>

        {uploading && (
          <div style={{ width: "100%", backgroundColor: "#eee", borderRadius: "4px", marginTop: "15px" }}>
            <div style={styles.progressBar}></div>
          </div>
        )}

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.startsWith("✅") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default UploadVideo;