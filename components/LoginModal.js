"use client";

import RegisterModal from "./RegisterModal";
import { useState , useEffect} from "react";
import Link from "next/link";
import Modal from "./Modal";
import { IP } from "../config"; 

export default function LoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState("");


    // reset modal when closed
    useEffect(() => {
      if (!isOpen) {
        setTimeout(() => {
          setFormData({
            username: "",
            password: ""
       
          });
          setError("");
          setLoading(false);
        }, 300);
      }
    }, [isOpen]);
  
    useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
  
      return () => clearTimeout(timer);
    }
  }, [error]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
 
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`${IP}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      // ✅ SAVE SESSION (NO JWT)
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");

      // notify app
      window.dispatchEvent(new Event("authChanged"));

             // close modal after short delay
        setTimeout(() => {
          onClose();
        }, 1200);
    } else {
       setError(data.message || "Login failed"); 
    }
  } catch (err) {
    console.error(err);
    setError("Server error. Try again later.");
  }

  setLoading(false);
};

  if (isRegisterMode) {
    return (
      <RegisterModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onSwitchToLogin={() => setIsRegisterMode(false)}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome Back">
      <div className="login-modal">
        <div className="modal-hero">
          <div className="hero-icon">
            <i className="bi bi-shield-lock-fill"></i>
          </div>

 {error ? (
  <div className="alert alert-danger">
    <i className="bi bi-exclamation-triangle-fill me-2"></i>
    {error}
  </div>
) : (
  <>
    <h4>Sign in to your account</h4>
    <p>Access your dashboard and track your CPD credits</p>
  </>
)}

        </div>


        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-envelope-fill"></i>
             Username
            </label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={formData.username || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-lock-fill"></i>
              Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password || ""}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <>
                Sign In
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>



   <div className="divider">
           
             <button 
              className="switch-mode-btn"
              onClick={() => setIsRegisterMode(true)}
            >
              Or Create account
            </button>
        </div>

      </div>

      <style jsx>{`
        .login-modal {
          text-align: left;
        }
        
        .modal-hero {
          text-align: center;
          margin-bottom: 32px;
        }
        
.hero-icon {
          width: 80px;
          height: 80px;
          background: #0980bf;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 25px -5px rgba(9, 128, 191, 0.3);
        }
        
        .hero-icon i {
          font-size: 40px;
          color: white;
        }
        
        .modal-hero h4 {
          font-size: 20px;
          font-weight: 700;
          color: #37423b;
          margin-bottom: 8px;
        }
        
        .modal-hero p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
.form-label i {
          color: #0980bf;
          font-size: 14px;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }
        
.form-input:focus {
          outline: none;
          border-color: #0980bf;
          box-shadow: 0 0 0 3px rgba(9, 128, 191, 0.1);
        }
        
        .password-wrapper {
          position: relative;
        }
        
        .password-wrapper input {
          padding-right: 45px;
        }
        
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
        
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #475569;
        }
        
.checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #0980bf;
        }
        
        .forgot-link {
          font-size: 14px;
          color: #0980bf;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .forgot-link:hover {
          color: #37423b;
          text-decoration: underline;
        }
        
.submit-btn {
          width: 100%;
          padding: 14px;
          background: #0980bf;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(9, 128, 191, 0.3);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }


        .switch-mode-btn:hover {
          background: none;
       
          color: #1de3f1;
         
        }




        .alert {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
        }

        .alert-danger {
          background: #fee2e2;
          color: #842727;
        }

        
        .divider {
          position: relative;
          text-align: center;
          margin: 24px 0;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: calc(50% - 70px);
          height: 1px;
          background: #e2e8f0;
        }
        
        .divider::before {
          left: 0;
        }
        
        .divider::after {
          right: 0;
        }
        
        .divider span {
          background: transparent;
          padding: 0 15px;
          color: #94a3b8;
          font-size: 13px;
        }
        
        .social-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .modal-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        
        .modal-footer p {
          color: #64748b;
          margin: 0;
          font-size: 14px;
        }
        
.switch-mode-btn {
          background: none;
          border: none;
          color: #0980bf;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }
     
      `}</style>
    </Modal>
  );
}
