"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { IP } from "../../config";

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    status: "admin",
    password: ""
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === "admin" || currentUser?.status === "admin";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!storedUser || !isLoggedIn) {
      router.push("/");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setCurrentUser(userData);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${IP}/api/users-with-details`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch(`${IP}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        resetForm();
        await fetchUsers();
        alert("User created successfully!");
      } else {
        alert(data.message || "Error creating user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      const res = await fetch(`${IP}/api/users/update/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await res.json();
      if (data.success) {
        resetForm();
        await fetchUsers();
        alert("User updated successfully!");
      } else {
        alert(data.message || "Error updating user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (editingUser) {
      handleUpdate(e);
    } else {
      handleCreate(e);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email,
      username: user.username,
      status: user.status,
      password: ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      surname: "",
      email: "",
      username: "",
      status: "active",
      password: ""
    });
    setShowPassword(false);
    setShowModal(false);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.name} ${user.surname}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === "active" || status === "admin") {
      return <span className="status-badge active"><i className="bi bi-check-circle-fill"></i> Active</span>;
    }
    return <span className="status-badge inactive"><i className="bi bi-x-circle-fill"></i> Inactive</span>;
  };

if (loading && users.length === 0) {
  return (
    <>
      <Header />
      <div className="loading-container">
        <div className="loading-wrapper">
          {/* Animated rings */}
          <div className="loading-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
          
          
          {/* Loading text with dots animation */}
          <div className="loading-text">
            <span>L</span>
            <span>o</span>
            <span>a</span>
            <span>d</span>
            <span>i</span>
            <span>n</span>
            <span>g</span>
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .loading-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%);
          position: relative;
          overflow: hidden;
        }
        
        /* Animated background */
        .loading-container::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(25, 118, 210, 0.05) 0%, transparent 70%);
          animation: rotateBg 20s linear infinite;
        }
        
        @keyframes rotateBg {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-wrapper {
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        /* Animated Rings */
        .loading-rings {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 2rem;
        }
        
        .ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }
        
        .ring-1 {
          border-top-color: #1976d2;
          animation-delay: 0s;
        }
        
        .ring-2 {
          border-right-color: #2563eb;
          animation-delay: 0.3s;
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
        }
        
        .ring-3 {
          border-bottom-color: #3b82f6;
          animation-delay: 0.6s;
          width: 60%;
          height: 60%;
          top: 20%;
          left: 20%;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Pulsing Logo */
        .loading-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #1976d2, #2563eb);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .loading-logo i {
          font-size: 1.8rem;
          color: white;
          animation: iconPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: 0 0 0 20px rgba(25, 118, 210, 0);
          }
        }
        
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        /* Animated Text */
        .loading-text {
          margin-top: 2rem;
          font-size: 1.8rem;
          font-weight: 700;
          display: flex;
          justify-content: center;
          gap: 0.1rem;
        }
        
        .loading-text span {
          display: inline-block;
          background: linear-gradient(135deg, #1976d2, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bounceLetter 0.5s ease infinite alternate;
          animation-delay: calc(var(--i, 0) * 0.05s);
        }
        
        .loading-text span:nth-child(1) { --i: 1; }
        .loading-text span:nth-child(2) { --i: 2; }
        .loading-text span:nth-child(3) { --i: 3; }
        .loading-text span:nth-child(4) { --i: 4; }
        .loading-text span:nth-child(5) { --i: 5; }
        .loading-text span:nth-child(6) { --i: 6; }
        .loading-text span:nth-child(7) { --i: 7; }
        
        @keyframes bounceLetter {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-8px);
          }
        }
        
        /* Dots animation */
        .dots {
          display: inline-flex;
          gap: 0.1rem;
          margin-left: 0.2rem;
        }
        
        .dots span {
          animation: blink 1.4s infinite;
          animation-fill-mode: both;
          background: linear-gradient(135deg, #1976d2, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .dots span:nth-child(1) { animation-delay: 0s; }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes blink {
          0%, 20%, 100% {
            opacity: 0.2;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
        
        .loading-subtitle {
          margin-top: 1rem;
          color: #64748b;
          font-size: 0.9rem;
          animation: fadeInOut 2s ease-in-out infinite;
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        /* Optional: Floating particles */
        .loading-container::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle at 20% 40%, rgba(25, 118, 210, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          animation: floatParticles 20s linear infinite;
        }
        
        @keyframes floatParticles {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }
        
        @media (max-width: 768px) {
          .loading-text {
            font-size: 1.3rem;
          }
          
          .loading-rings {
            width: 90px;
            height: 90px;
          }
          
          .loading-logo {
            width: 40px;
            height: 40px;
          }
          
          .loading-logo i {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  );
}

  return (
    <>
      <Header />
      
      <div className="users-page">
        <div className="page-header">
          <div className="container">
            <div className="header-content">
              <div>
                <h1><i className="bi bi-people-fill"></i> User Directory</h1>
                <p>View all registered users, their certificates and course enrollments</p>
              </div>
              <div className="header-stats">
                <div className="stat-badge">
                  <i className="bi bi-person-check"></i>
                  <span>{users.filter(u => u.status === "active").length} Normal Users</span>
                </div>
                <div className="stat-badge">
                  <i className="bi bi-person-x"></i>
                  <span>{users.filter(u => u.status === "admin").length} Admin Users</span>
                </div>
                {isAdmin && (
                  <button className="btn-create" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg"></i> Add Admin User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="filters-section">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search by name, email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="status-filters">
              <button 
                className={`filter-chip ${selectedStatus === "all" ? "active" : ""}`}
                onClick={() => setSelectedStatus("all")}
              >
                <i className="bi bi-people"></i> All Users
              </button>
              <button 
                className={`filter-chip ${selectedStatus === "active" ? "active" : ""}`}
                onClick={() => setSelectedStatus("active")}
              >
                <i className="bi bi-check-circle"></i> Normal Users
              </button>
              <button 
                className={`filter-chip ${selectedStatus === "admin" ? "active" : ""}`}
                onClick={() => setSelectedStatus("admin")}
              >
                <i className="bi bi-x-circle"></i> Admin Users
              </button>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-people"></i>
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div className="user-card" key={user.id}>
                  <div className="user-card-header">
                    <div className="user-avatar-wrapper">
                      <div className="user-avatar">
                        <i className="bi bi-person-circle"></i>
                      </div>
                      <div className="user-status-dot" data-status={user.status}></div>
                    </div>
                    <div className="user-basic-info">
                      <h3>{user.username}</h3>
                      <p className="user-username">@{user.name} {user.surname}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <div className="user-card-actions">
                      {getStatusBadge(user.status)}
                      {user.status == 'admin' && (
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(user)}
                          title="Edit user"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="user-stats">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <i className="bi bi-award-fill"></i>
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{user.certificates_count || 0}</span>
                        <span className="stat-label">Certificates</span>
                      </div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <i className="bi bi-book-fill"></i>
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{user.courses_count || 0}</span>
                        <span className="stat-label">Courses Taken</span>
                      </div>
                    </div>
                    {/* <div className="stat-divider"></div> */}
                    {/* <div className="stat-item">
                      <div className="stat-icon">
                        <i className="bi bi-calendar-check-fill"></i>
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{user.cpd_points || 0}</span>
                        <span className="stat-label">CPD Points</span>
                      </div>
                    </div> */}
                  </div>

                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewDetails(user)}
                  >
                    <i className="bi bi-eye-fill"></i> View Full Details
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <h2>{selectedUser.name} {selectedUser.surname}</h2>
                  <p>@{selectedUser.username} • {selectedUser.email}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Certificates Section */}
              <div className="details-section">
                <div className="section-header">
                  <i className="bi bi-award-fill"></i>
                  <h3>Certificates Earned</h3>
                  <span className="section-count">{selectedUser.certificates?.length || 0}</span>
                </div>
                {selectedUser.certificates && selectedUser.certificates.length > 0 ? (
                  <div className="certificates-list">
                    {selectedUser.certificates.map((cert, index) => (
                      <div className="certificate-item" key={index}>
                        <div className="certificate-icon">
                          <i className="bi bi-file-earmark-pdf-fill"></i>
                        </div>
                        <div className="certificate-details">
                          <h4>{cert.certificate_name}</h4>
                          <p>Completed: {new Date(cert.completion_date).toLocaleDateString()}</p>
                        </div>
                        <div className="certificate-badge">
                          <span>+{cert.cpd_points || 5} CPD</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-subsection">
                    <i className="bi bi-file-earmark-text"></i>
                    <p>No certificates earned yet</p>
                  </div>
                )}
              </div>

              {/* Courses Section */}
              <div className="details-section">
                <div className="section-header">
                  <i className="bi bi-book-fill"></i>
                  <h3>Courses Taken</h3>
                  <span className="section-count">{selectedUser.courses?.length || 0}</span>
                </div>
                {selectedUser.courses && selectedUser.courses.length > 0 ? (
                  <div className="courses-list">
                    {selectedUser.courses.map((course, index) => (
                      <div className="course-item" key={index}>
                        <div className="course-image">
                          {course.course_img ? (
                            <img src={course.course_img} alt={course.course_name} />
                          ) : (
                            <i className="bi bi-camera-reels"></i>
                          )}
                        </div>
                        <div className="course-details">
                          <h4>{course.course_name}</h4>
                          <p>{course.course_description?.substring(0, 100)}...</p>
                          <div className="course-meta">
                            <span><i className="bi bi-tag-fill"></i> {course.course_catergory}</span>
                            <span><i className="bi bi-calendar"></i> {new Date(course.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="course-status-badge">
                          <i className="bi bi-check-circle-fill"></i> Completed
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-subsection">
                    <i className="bi bi-journal-bookmark-fill"></i>
                    <p>No courses taken yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal (Admin Only) */}
      {showModal && isAdmin && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
              <button className="modal-close" onClick={resetForm}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label><i className="bi bi-person"></i> First Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>

                <div className="form-group">
                  <label><i className="bi bi-person"></i> Last Name *</label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><i className="bi bi-envelope"></i> Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label><i className="bi bi-person-badge"></i> Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><i className="bi bi-key"></i> Password {!editingUser && "*"}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                      placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label><i className="bi bi-toggle-on"></i> Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={actionLoading}>
                  {actionLoading ? (
                    <span className="spinner"></span>
                  ) : (
                    editingUser ? "Update User" : "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        .loading-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%);
          position: relative;
          overflow: hidden;
        }
        
        .loading-container::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(25, 118, 210, 0.05) 0%, transparent 70%);
          animation: rotateBg 20s linear infinite;
        }
        
        @keyframes rotateBg {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-wrapper {
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .loading-rings {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 2rem;
        }
        
        .ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }
        
        .ring-1 {
          border-top-color: #1976d2;
          animation-delay: 0s;
        }
        
        .ring-2 {
          border-right-color: #2563eb;
          animation-delay: 0.3s;
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
        }
        
        .ring-3 {
          border-bottom-color: #3b82f6;
          animation-delay: 0.6s;
          width: 60%;
          height: 60%;
          top: 20%;
          left: 20%;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          margin-top: 2rem;
          font-size: 1.8rem;
          font-weight: 700;
          display: flex;
          justify-content: center;
          gap: 0.1rem;
        }
        
        .loading-text span {
          display: inline-block;
          background: linear-gradient(135deg, #1976d2, #2563eb);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bounceLetter 0.5s ease infinite alternate;
        }
        
        .loading-text span:nth-child(1) { animation-delay: 0s; }
        .loading-text span:nth-child(2) { animation-delay: 0.05s; }
        .loading-text span:nth-child(3) { animation-delay: 0.1s; }
        .loading-text span:nth-child(4) { animation-delay: 0.15s; }
        .loading-text span:nth-child(5) { animation-delay: 0.2s; }
        .loading-text span:nth-child(6) { animation-delay: 0.25s; }
        .loading-text span:nth-child(7) { animation-delay: 0.3s; }
        
        @keyframes bounceLetter {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        
        .dots {
          display: inline-flex;
          gap: 0.1rem;
          margin-left: 0.2rem;
        }
        
        .dots span {
          display: inline-block;
          background: linear-gradient(135deg, #1976d2, #2563eb);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: blink 1.4s infinite;
          animation-fill-mode: both;
        }
        
        .dots span:nth-child(1) { animation-delay: 0s; }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes blink {
          0%, 20%, 100% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
        
        .users-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
        }
        
        .page-header {
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          padding: 2rem 0;
          color: white;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .page-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 15s linear infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50%, 50%); }
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          position: relative;
          z-index: 1;
        }
        
        .header-content h1 {
          font-size: 1.75rem;
          margin: 0 0 0.25rem 0;
        }
        
        .header-content h1 i {
          margin-right: 0.75rem;
        }
        
        .header-content p {
          margin: 0;
          opacity: 0.9;
        }
        
        .header-stats {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .stat-badge {
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .btn-create {
          background: white;
          color: #1976d2;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .search-box {
          flex: 1;
          max-width: 400px;
          position: relative;
        }
        
        .search-box i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          background: white;
          transition: all 0.3s ease;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }
        
        .status-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .filter-chip {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        
        .filter-chip:hover {
          border-color: #1976d2;
          color: #1976d2;
        }
        
        .filter-chip.active {
          background: linear-gradient(135deg, #1976d2, #2563eb);
          color: white;
          border-color: transparent;
        }
        
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .user-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .user-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px -12px rgba(0,0,0,0.15);
        }
        
        .user-card-header {
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .user-avatar-wrapper {
          position: relative;
        }
        
        .user-avatar {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #e8f4f8, #dbeafe);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .user-avatar i {
          font-size: 2.5rem;
          color: #1976d2;
        }
        
        .user-status-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .user-status-dot[data-status="active"] {
          background: #10b981;
        }
        
        .user-status-dot[data-status="inactive"] {
          background: #ef4444;
        }
        
        .user-basic-info {
          flex: 1;
        }
        
        .user-basic-info h3 {
          font-size: 1.1rem;
          margin: 0 0 0.25rem 0;
          color: #1a202c;
        }
        
        .user-username {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 0.2rem 0;
        }
        
        .user-email {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }
        
        .user-card-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .status-badge.active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        
        .status-badge.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #dc2626;
        }
        
        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          background: #e8f4f8;
          color: #1976d2;
        }
        
        .btn-icon:hover {
          background: #1976d2;
          color: white;
        }
        
        .user-stats {
          display: flex;
          justify-content: space-around;
          padding: 1rem 1.5rem;
          background: #f8fafc;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .stat-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-icon i {
          font-size: 1.2rem;
          color: #1976d2;
        }
        
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a202c;
        }
        
        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .stat-divider {
          width: 1px;
          background: #e2e8f0;
        }
        
        .btn-view-details {
          width: calc(100% - 3rem);
          margin: 0 1.5rem 1.5rem 1.5rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          color: #1976d2;
          font-weight: 500;
        }
        
        .btn-view-details:hover {
          background: #1976d2;
          color: white;
          border-color: #1976d2;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 20px;
        }
        
        .empty-state i {
          font-size: 4rem;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          margin: 0 0 0.5rem;
          color: #1a202c;
        }
        
        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-container {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .modal-container.large {
          max-width: 800px;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
        }
        
        .modal-header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .modal-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #e8f4f8, #dbeafe);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-avatar i {
          font-size: 2rem;
          color: #1976d2;
        }
        
        .modal-header-info h2 {
          margin: 0;
          font-size: 1.2rem;
        }
        
        .modal-header-info p {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.3s ease;
        }
        
        .modal-close:hover {
          color: #dc2626;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .details-section {
          margin-bottom: 2rem;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .section-header i {
          font-size: 1.3rem;
          color: #1976d2;
        }
        
        .section-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #1a202c;
        }
        
        .section-count {
          background: #e8f4f8;
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          color: #1976d2;
          font-weight: 600;
        }
        
        .certificates-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .certificate-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
        }
        
        .certificate-icon i {
          font-size: 2rem;
          color: #ef4444;
        }
        
        .certificate-details {
          flex: 1;
        }
        
        .certificate-details h4 {
          margin: 0 0 0.25rem;
          font-size: 0.9rem;
        }
        
        .certificate-details p {
          margin: 0;
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .certificate-badge span {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .courses-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .course-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
        }
        
        .course-image {
          width: 80px;
          height: 80px;
          background: #e2e8f0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .course-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .course-image i {
          font-size: 2rem;
          color: #94a3b8;
        }
        
        .course-details {
          flex: 1;
        }
        
        .course-details h4 {
          margin: 0 0 0.25rem;
          font-size: 0.9rem;
        }
        
        .course-details p {
          margin: 0 0 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .course-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
          color: #94a3b8;
        }
        
        .course-meta i {
          margin-right: 0.25rem;
        }
        
        .course-status-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          height: fit-content;
        }
        
        .empty-subsection {
          text-align: center;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
        }
        
        .empty-subsection i {
          font-size: 2rem;
          color: #cbd5e1;
          margin-bottom: 0.5rem;
        }
        
        .empty-subsection p {
          margin: 0;
          color: #64748b;
          font-size: 0.8rem;
        }
        
        .modal-form {
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1a202c;
          font-size: 0.85rem;
        }
        
        .form-group label i {
          color: #1976d2;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .password-input-wrapper {
          position: relative;
        }
        
        .password-input-wrapper input {
          padding-right: 2.5rem;
        }
        
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .btn-cancel, .btn-submit {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-cancel {
          background: #e2e8f0;
          color: #64748b;
        }
        
        .btn-cancel:hover {
          background: #cbd5e1;
        }
        
        .btn-submit {
          background: linear-gradient(135deg, #1976d2, #2563eb);
          color: white;
        }
        
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
        }
        
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .header-stats {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .filters-section {
            flex-direction: column;
          }
          
          .search-box {
            max-width: 100%;
          }
          
          .user-card-header {
            flex-wrap: wrap;
          }
          
          .user-card-actions {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}