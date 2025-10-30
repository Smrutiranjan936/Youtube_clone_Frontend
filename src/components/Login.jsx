import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Login.css"; // ✅ New CSS file

function Login({ setIsLoggedIn, setRole }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    if (user && role) {
      if (role === "admin") navigate("/adminhome");
      else if (role === "creator") navigate("/creatorhome");
      else navigate("/viewerhome");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    axios
      .post("http://localhost:8000/api/loginUser", formData)
      .then((res) => {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("role", res.data.user.role);
        setIsLoggedIn(true);
        setRole(res.data.user.role);

        if (res.data.user.role === "admin") navigate("/adminhome");
        else if (res.data.user.role === "creator") navigate("/creatorhome");
        else navigate("/viewerhome");
      })
      .catch((err) => {
        console.log(err);
        setError("Invalid email or password");
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2 className="login-title">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="register-text">
          Don’t have an account?{" "}
          <Link to="/register" className="register-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
