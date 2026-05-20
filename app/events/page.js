"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { IP } from "../../config";

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    course_name: "",
    course_description: "",
    course_catergory: "",
    status: "active",
    course_img: null,
    course_video: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!storedUser || !isLoggedIn) {
     window.location.href = "/"
    }
    
    setUser(JSON.parse(storedUser));
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${IP}/api/courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: 'no-store' // Prevent caching
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${IP}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, course_img: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, course_video: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Optimistic update for create
const handleSubmit = async (e) => {
  e.preventDefault();
  setActionLoading(true);

  const formDataToSend = new FormData();
  formDataToSend.append("course_name", formData.course_name);
  formDataToSend.append("course_description", formData.course_description);
  formDataToSend.append("course_catergory", formData.course_catergory);
  formDataToSend.append("status", formData.status);
  
  if (formData.course_img && formData.course_img instanceof File) {
    formDataToSend.append("course_img", formData.course_img);
  }
  if (formData.course_video && formData.course_video instanceof File) {
    formDataToSend.append("course_video", formData.course_video);
  }

  try {
    let url, method, successMessage, headers = {};
    
    if (editingEvent) {
      url = `${IP}/api/update/${editingEvent.id}`;
      method = "PUT";
      successMessage = "Event updated successfully!";
      // For update with files, don't set Content-Type - let browser set it for FormData
      // If no files are being uploaded, you could use JSON, but keeping FormData is simpler
    } 
    else {
      url = `${IP}/api/create`;
      method = "POST";
      successMessage = "Event created successfully!";
      // For create with files, don't set Content-Type - browser handles it
    }
    
    const res = await fetch(url, {
      method: method,
      body: formDataToSend
      // NO Content-Type header here - browser will add correct multipart boundary
    });
    
    const data = await res.json();
    if (data.success) {
      resetForm();
      await fetchEvents();
      alert(successMessage);
    } else {
      alert(data.message || "Error saving event");
    }
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Error saving event");
  } finally {
    setActionLoading(false);
  }
};

  // Optimistic delete
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this event?")) {
      // Optimistically remove from UI
      const deletedEvent = events.find(event => event.id === id);
      setEvents(prev => prev.filter(event => event.id !== id));
      
      try {
        const res = await fetch(`${IP}/api/delete/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) {
          // Revert if failed
          setEvents(prev => [...prev, deletedEvent].sort((a,b) => b.id - a.id));
          alert(data.message || "Error deleting event");
        } 
      } catch (error) {
        // Revert on error
        setEvents(prev => [...prev, deletedEvent].sort((a,b) => b.id - a.id));
        console.error("Error deleting event:", error);
        alert("Error deleting event");
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      course_name: event.course_name,
      course_description: event.course_description,
      course_catergory: event.course_catergory,
      status: event.status,
      course_img: null,
      course_video: null
    });
    if (event.course_img) {
      setImagePreview(event.course_img);
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      course_name: "",
      course_description: "",
      course_catergory: "",
      status: "active",
      course_img: null,
      course_video: null
    });
    setImagePreview(null);
    setVideoPreview(null);
    setShowModal(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.course_catergory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    if (status === "active" || status === "true") {
      return <span className="status-badge active"><i className="bi bi-check-circle-fill"></i> Active</span>;
    }
    return <span className="status-badge inactive"><i className="bi bi-x-circle-fill"></i> Inactive</span>;
  };

if (loading && events.length === 0) {
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
      
      <div className="events-page">
        <div className="page-header">
          <div className="container">
            <div className="header-content">
              <div>
                <h1><i className="bi bi-calendar-event-fill"></i> Events Management</h1>
                <p>Manage your courses, workshops, and training events</p>
              </div>
              <button className="btn-create" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-lg"></i> Create New Event
              </button>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="filters-section">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filters">
              <button 
                className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All Events
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="events-grid">
            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-calendar-x"></i>
                <h3>No events found</h3>
                <p>Create your first event to get started</p>
                <button className="btn-create" onClick={() => setShowModal(true)}>
                  <i className="bi bi-plus-lg"></i> Create Event
                </button>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div className="event-card" key={event.id}>
                  <div className="event-image">
                    {event.course_img ? (
                      <img src={event.course_img} alt={event.course_name} />
                    ) : (
                      <div className="image-placeholder">
                        <i className="bi bi-image"></i>
                      </div>
                    )}
                    <div className="event-status">{getStatusBadge(event.status)}</div>
                  </div>
                  <div className="event-content">
                    <div className="event-category">
                      <i className="bi bi-tag-fill"></i>
                      <span>{event.course_catergory}</span>
                    </div>
                    <h3>{event.course_name}</h3>
                    <p>{event.course_description}</p>
                    <div className="event-meta">
                      <span><i className="bi bi-clock-history"></i> Created: {new Date(event.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="event-actions">
                      <button className="btn-edit" onClick={() => handleEdit(event)} disabled={actionLoading}>
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(event.id)} disabled={actionLoading}>
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
              <button className="modal-close" onClick={resetForm}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label><i className="bi bi-type"></i> Event Name *</label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter event name"
                />
              </div>

              <div className="form-group">
                <label><i className="bi bi-text-paragraph"></i> Description *</label>
                <textarea
                  name="course_description"
                  value={formData.course_description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Enter event description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><i className="bi bi-tag"></i> Category *</label>
                  <select
                    name="course_catergory"
                    value={formData.course_catergory}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Conference">Conference</option>
                    <option value="Training">Training</option>
                    <option value="Webinar">Webinar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label><i className="bi bi-toggle-on"></i> Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><i className="bi bi-image"></i> Event Image</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="file-label">
                      <i className="bi bi-cloud-upload"></i>
                      <span>Choose Image</span>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" onClick={() => setImagePreview(null)}>
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label><i className="bi bi-camera-reels"></i> Event Video</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="file-input"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="file-label">
                      <i className="bi bi-cloud-upload"></i>
                      <span>Choose Video</span>
                    </label>
                  </div>
                  {videoPreview && (
                    <div className="video-preview">
                      <video src={videoPreview} controls />
                    </div>
                  )}
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
                    editingEvent ? "Update Event" : "Create Event"
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
        
        .events-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%);
        }
        
        .page-header {
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          padding: 2rem 0;
          color: white;
          margin-bottom: 2rem;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
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
        
        .btn-create {
          background: white;
          color: #1976d2;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-create:hover:not(:disabled) {
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
          transition: all 0.3s ease;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }
        
        .category-filters {
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
        
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .event-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px -12px rgba(0,0,0,0.2);
        }
        
        .event-image {
          position: relative;
          height: 200px;
          background: #f1f5f9;
          overflow: hidden;
        }
        
        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e2e8f0, #f1f5f9);
        }
        
        .image-placeholder i {
          font-size: 3rem;
          color: #94a3b8;
        }
        
        .event-status {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        
        .status-badge.active {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }
        
        .status-badge.inactive {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }
        
        .event-content {
          padding: 1.25rem;
        }
        
        .event-category {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.75rem;
          background: #e8f4f8;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #1976d2;
          margin-bottom: 0.75rem;
        }
        
        .event-content h3 {
          font-size: 1.2rem;
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }
        
        .event-content p {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 1rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .event-meta {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }
        
        .event-meta i {
          margin-right: 0.25rem;
        }
        
        .event-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .btn-edit, .btn-delete {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-edit:disabled, .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-edit {
          background: #e8f4f8;
          color: #1976d2;
        }
        
        .btn-edit:hover:not(:disabled) {
          background: #1976d2;
          color: white;
        }
        
        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .btn-delete:hover:not(:disabled) {
          background: #dc2626;
          color: white;
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
          max-width: 700px;
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
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
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
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
        
        .file-upload {
          position: relative;
        }
        
        .file-input {
          display: none;
        }
        
        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .file-label:hover {
          border-color: #1976d2;
          background: #e8f4f8;
        }
        
        .image-preview {
          position: relative;
          margin-top: 0.5rem;
        }
        
        .image-preview img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 10px;
        }
        
        .image-preview button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0,0,0,0.5);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
        }
        
        .video-preview {
          margin-top: 0.5rem;
        }
        
        .video-preview video {
          width: 100%;
          max-height: 150px;
          border-radius: 10px;
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
          .events-grid {
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
          
          .filters-section {
            flex-direction: column;
          }
          
          .search-box {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}