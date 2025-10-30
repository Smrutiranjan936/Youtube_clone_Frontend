import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "viewer",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/api/registerUser", formData)
      .then((res) => {
        alert(res.data.message);

        // Auto-login after registration
        axios.post("http://localhost:8000/api/loginUser", {
          email: formData.email,
          password: formData.password,
        })
        .then(loginRes => {
          localStorage.setItem("user", JSON.stringify(loginRes.data));
          localStorage.setItem("role", loginRes.data.role);

          // Redirect based on role
          if (loginRes.data.role === "admin") navigate("/adminhome");
          else if (loginRes.data.role === "creator") navigate("/creatorhome");
          else navigate("/viewerhome");
        })
        .catch(err => console.log("Auto-login failed:", err));
      })
      .catch((err) => console.log(err));
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: "#f5f5f5",
    },
    box: {
      background: "#fff",
      padding: "40px 30px",
      borderRadius: "12px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      textAlign: "center",
      width: "350px",
    },
    logo: { width: "80px", marginBottom: "20px" },
    heading: { fontSize: "1.8rem", marginBottom: "25px", color: "#333" },
    input: {
      width: "100%",
      padding: "12px 15px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "12px 15px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
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
      marginTop: "15px",
      transition: "0.3s",
    },
    buttonHover: { backgroundColor: "#ff3360" },
    loginLink: { marginTop: "15px", fontSize: "14px", color: "#555" },
    link: { color: "#ff4d6d", fontWeight: "600", textDecoration: "none" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h2 style={styles.heading}>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="viewer">Viewer</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = styles.button.backgroundColor)
            }
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
