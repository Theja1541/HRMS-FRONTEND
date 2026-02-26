import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const { loginAdmin, loginHR } = useAuth();

  const handleAdminLogin = () => {
    loginAdmin();
    navigate("/dashboard", { replace: true });
  };

  const handleHRLogin = () => {
    loginHR();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>HRMS Login</h2>

        <p className="login-subtitle">
          Select your role to continue
        </p>

        <button className="login-btn" onClick={handleAdminLogin}>
          Login as Admin
        </button>

        <button
          className="login-btn secondary"
          onClick={handleHRLogin}
        >
          Login as HR
        </button>
      </div>
    </div>
  );
}
