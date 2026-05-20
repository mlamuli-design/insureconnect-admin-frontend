"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { IP } from "../config"; 

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",

  }); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // reset modal when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
     
        });
        setError("");
        setSuccess("");
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

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value || "",
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${IP}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      });

      const data = await response.json();

      if (data.success) { 
        // ✅ AUTO LOGIN 
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        setSuccess("Account created successfully!");

        // notify app (navbar/dashboard/etc.)
        window.dispatchEvent(new Event("authChanged"));

        // close modal after short delay
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Account">
      <div className="register-modal">
        <div className="modal-icon">
          <i className="bi bi-person-badge-fill"></i>
        </div>

        <p className="modal-subtitle">
          Join our community of insurance professionals
        </p>

        {/* SUCCESS */}
        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* FULL NAME */}
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-person"></i>
              Fullname
            </label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              placeholder="John Doe"
              value={formData.fullName || ""}
              onChange={handleChange}
              required
            />
          </div>

          {/* USERNAME */}
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-person-fill"></i>
              Username
            </label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="johndoe"
              value={formData.username || ""}
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-envelope-fill"></i>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email || ""}
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
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
                placeholder="Enter password"
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

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-check-circle-fill"></i>
              Confirm Password
            </label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm password"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                <i className={`bi ${showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <>
                Create Account
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        {/* SWITCH */}
        <div className="divider">
          <button className="switch-mode-btn" onClick={onSwitchToLogin}>
            Or Sign in
          </button>
        </div>
      </div>

      {/* YOUR ORIGINAL CSS (UNCHANGED) */}
      <style jsx>{`
        .register-modal {
          text-align: center;
        }

        .modal-icon {
          width: 60px;
          height: 60px;
          background: #0980bf;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }

        .modal-icon i {
          font-size: 28px;
          color: white;
        }

        .modal-subtitle {
          font-size: 20px;
          font-weight: 700;
          color: #37423b;
          margin-bottom: 8px;
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

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 14px;
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
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

           .switch-mode-btn:hover {
          background: none;
     
          color: #1de3f1;
          font-weight: 600;
       
        }

          .switch-mode-btn {
    background: none;
    border: none;
    color: #0980bf;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
  }

  .switch-mode-btn:hover {
    color: #5fbef1;
  }

    /* DIVIDER */
  .divider {
    position: relative;
    text-align: center;
    margin: 20px 0;
  }

  .divider::before,
  .divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 60px);
    height: 1px;
    background: #dddddd;
  }

  .divider::before {
    left: 0;
  }

  .divider::after {
    right: 0;
  }

  .divider span {
    padding: 0 12px;
    color: #aaaaaa;
    font-size: 13px;
  }


      `}</style>
    </Modal>
  );
}