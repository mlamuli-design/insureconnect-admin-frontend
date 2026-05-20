"use client";

import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";
import { IP } from "../../config";

export default function Certificates() {
  const [visibleCards, setVisibleCards] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalCredits: 0,
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCertificates(parsedUser.email);
    } else {
      setLoading(false);
    }

    initAOS();
  }, []);

  const fetchCertificates = async (email) => {
    try {
      const response = await fetch(`${IP}/api/certificates?email=${email}`);
      const data = await response.json();

      console.log("eeeeeee", data);
      
      if (data.success && data.data.length > 0) {
        setCertificates(data.data);
        setStats({
          total: data.data.length,
          totalCredits: data.data.length * 3,
        });
      } else {
        setCertificates([]);
        setStats({ total: 0, totalCredits: 0 });
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Intersection Observer for card animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.6, rootMargin: "0px 0px -50px 0px" }
    );

    const cards = document.querySelectorAll(".certificate-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [certificates]);

  const initAOS = () => {
    if (typeof window !== "undefined" && window.AOS) {
      window.AOS.init({
        duration: 800,
        easing: "ease-in-out",
        once: true,
        mirror: false,
        offset: 120,
      });
      window.AOS.refresh();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

   // Function to generate and download PDF certificate
  const generateCertificate = async (cert) => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    
    const fullName = user ? `${user.name} ${user.surname}` : cert.fullnames || cert.username;
    const completionDate = formatDate(cert.completion_date);
    const certificateName = cert.certificate_name;
    const certificateId = cert.certificate || `IC-${String(cert.id).padStart(6, '0')}`;
    
    // Generate unique serial number
    const serialNumber = `IC-${new Date().getFullYear()}-${String(cert.id).padStart(4, '0')}${Math.floor(Math.random() * 1000)}`;
    
    
    // Create HTML template for A4 certificate
  // Create HTML template for A4 certificate
const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Certificate of Completion - ${fullName}</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Georgia', 'Times New Roman', 'Palatino', serif;
        background: #e0f2fe;
        background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
      }
      
      .certificate {
        width: 297mm;
        height: 210mm;
        background: white;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        page-break-after: avoid;
        break-inside: avoid;
      }
      
      /* Watermarks - Multiple positions */
      .watermark {
        position: absolute;
        font-size: 70px;
        font-weight: 800;
        color: #0980bf;
        opacity: 0.06;
        pointer-events: none;
        z-index: 0;
        white-space: nowrap;
        transform: rotate(-25deg);
      }
      
      .watermark-top {
        top: 15%;
        left: -10%;
        right: -10%;
        text-align: center;
        transform: rotate(-25deg);
      }
      
      .watermark-middle {
        top: 45%;
        left: -15%;
        right: -15%;
        text-align: center;
        transform: rotate(-25deg);
        font-size: 90px;
      }
      
      .watermark-bottom {
        bottom: 15%;
        left: -10%;
        right: -10%;
        text-align: center;
        transform: rotate(-25deg);
      }
      
      /* Additional subtle watermark pattern */
      .watermark-pattern {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50" font-size="20" fill="%230980bf" opacity="0.03" transform="rotate(-25, 50, 50)">INSURE CONNECT</text></svg>');
        background-repeat: repeat;
        background-size: 150px 150px;
        pointer-events: none;
        z-index: 0;
      }
      
      /* Main Border - doesn't strike through content */
      .border-main {
        position: absolute;
        top: 12mm;
        left: 12mm;
        right: 12mm;
        bottom: 12mm;
        border: 2.5px solid #0980bf;
        z-index: 1;
        pointer-events: none;
      }
      
      /* Inner Border */
      .border-inner {
        position: absolute;
        top: 15mm;
        left: 15mm;
        right: 15mm;
        bottom: 15mm;
        border: 1px solid #60a5fa;
        z-index: 1;
        pointer-events: none;
      }
      
      /* Corner Decorations */
      .corner {
        position: absolute;
        width: 25px;
        height: 25px;
        border-color: #0980bf;
        border-style: solid;
        border-width: 0;
        z-index: 2;
        pointer-events: none;
      }
      
      .corner-tl {
        top: 12mm;
        left: 12mm;
        border-top-width: 2.5px;
        border-left-width: 2.5px;
      }
      
      .corner-tr {
        top: 12mm;
        right: 12mm;
        border-top-width: 2.5px;
        border-right-width: 2.5px;
      }
      
      .corner-bl {
        bottom: 12mm;
        left: 12mm;
        border-bottom-width: 2.5px;
        border-left-width: 2.5px;
      }
      
      .corner-br {
        bottom: 12mm;
        right: 12mm;
        border-bottom-width: 2.5px;
        border-right-width: 2.5px;
      }
      
      .certificate-content {
        position: relative;
        z-index: 3;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 20mm 18mm 15mm 18mm;
      }
      
      /* Header */
      .header {
        text-align: center;
        margin-bottom: 8px;
      }
      
      .logo-icon {
        font-size: 40px;
        margin-bottom: 5px;
      }
      
      .header h1 {
        color: #1e3a8a;
        font-size: 38px;
        letter-spacing: 5px;
        margin-bottom: 3px;
        font-weight: 700;
        text-transform: uppercase;
      }
      
      .header p {
        color: #64748b;
        font-size: 11px;
        letter-spacing: 2px;
      }
      
      .gold-line {
        width: 80px;
        height: 2px;
        background: linear-gradient(90deg, #c9a03d, #f4c542, #c9a03d);
        margin: 8px auto 0;
      }
      
      /* Seal */
      .seal {
        text-align: center;
        margin: 10px 0;
      }
      
      .seal-icon {
        display: inline-block;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #0980bf 0%, #1e3a8a 100%);
        border-radius: 50%;
        line-height: 60px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(9, 128, 191, 0.25);
      }
      
      .seal-icon span {
        font-size: 32px;
        color: white;
      }
      
      /* Title Section */
      .title-section {
        text-align: center;
        margin: 10px 0;
      }
      
      .certifies-text {
        color: #64748b;
        font-size: 14px;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      
      .title {
        font-size: 32px;
        font-weight: 800;
        color: #0980bf;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
      
      /* Recipient Name */
      .recipient-section {
        text-align: center;
        margin: 20px 0;
      }
      
      .recipient-name {
        font-size: 44px;
        color: #1e3a8a;
        font-weight: 800;
        font-family: 'Georgia', serif;
        letter-spacing: 2px;
        border-bottom: 2px solid #c9a03d;
        display: inline-block;
        padding-bottom: 8px;
      }
      
      /* Course Name */
      .course-section {
        text-align: center;
        margin: 15px 0;
      }
      
      .for-text {
        color: #64748b;
        font-size: 13px;
        margin-bottom: 8px;
      }
      
      .course-name {
        font-size: 24px;
        color: #0980bf;
        font-weight: 700;
        font-style: italic;
      }
      
      /* Achievement Details */
      .achievement-details {
        text-align: center;
        margin: 15px 0;
      }
      
      .details-grid {
        display: flex;
        justify-content: center;
        gap: 50px;
        margin-top: 10px;
      }
      
      .detail-item {
        text-align: center;
      }
      
      .detail-label {
        font-size: 9px;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .detail-value {
        font-size: 13px;
        color: #334155;
        font-weight: 600;
        margin-top: 4px;
      }
      
      /* Signatures */
      .signatures {
        display: flex;
        justify-content: center;
        gap: 80px;
        margin: 20px 0 15px;
      }
      
      .signature {
        text-align: center;
        width: 180px;
      }
      
      .signature-line {
        width: 160px;
        height: 1px;
        background: #333;
        margin-bottom: 8px;
      }
      
      .signature-name {
        font-size: 12px;
        font-weight: 600;
        color: #1e3a8a;
      }
      
      .signature-title {
        font-size: 10px;
        color: #64748b;
      }
      
      /* Footer */
      .footer {
        text-align: center;
        margin-top: 10px;
      }
      
      .footer p {
        font-size: 9px;
        color: #94a3b8;
      }
      
      .certificate-footer {
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        font-size: 7px;
        color: #94a3b8;
      }
      
      @media print {
        body {
          background: white;
          padding: 0;
          margin: 0;
        }
        .certificate {
          box-shadow: none;
          margin: 0;
          page-break-after: avoid;
          break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="certificate">
      <!-- Multiple Watermarks -->
      <div class="watermark watermark-top">INSURE CONNECT</div>
      <div class="watermark watermark-middle">INSURE CONNECT</div>
      <div class="watermark watermark-bottom">INSURE CONNECT</div>
      <div class="watermark-pattern"></div>
      
      <!-- Borders -->
      <div class="border-main"></div>
      <div class="border-inner"></div>
      
      <!-- Corner Decorations -->
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      
      <div class="certificate-content">
        <!-- Header -->
        <div class="header">
          <div class="logo-icon">🏆</div>
          <h1>INSURE CONNECT</h1>
          <p>Professional Training & Certification Institute</p>
          <div class="gold-line"></div>
        </div>
        
        <!-- Seal -->
        <div class="seal">
          <div class="seal-icon">
            <span>⚡</span>
          </div>
        </div>
        
        <!-- Title -->
        <div class="title-section">
          <div class="certifies-text">This certificate is awarded to</div>
          <div class="title">CERTIFICATE OF COMPLETION</div>
        </div>
        
        <!-- Recipient -->
        <div class="recipient-section">
          <div class="recipient-name">${fullName}</div>
        </div>
        
        <!-- Course -->
        <div class="course-section">
          <div class="for-text">for successfully completing the course</div>
          <div class="course-name">${certificateName}</div>
        </div>
        
        <!-- Achievement Details -->
        <div class="achievement-details">
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">DATE ISSUED</div>
              <div class="detail-value">${completionDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">CERTIFICATE ID</div>
              <div class="detail-value">${serialNumber}</div>
            </div>
          </div>
        </div>
        
        <!-- Signatures -->
        <div class="signatures">
          <div class="signature">
            <div class="signature-name">Scott Powell</div>
            <div class="signature-title">Chief Content Officer</div>
            <div class="signature-line"></div>
          </div>
          <div class="signature">
            <div class="signature-name">Dr. Sarah Johnson</div>
            <div class="signature-title">Executive Director</div>
            <div class="signature-line"></div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>This certificate is issued by InsureConnect and is proof of completion</p>
        </div>
        
        <div class="certificate-footer">
          <span>Issued by InsureConnect</span>
          <span>Acknowledged by InsureConnect</span>
          <span>Verified by InsureConnect</span>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${certificateName.replace(/\s/g, '_')}_${fullName.replace(/\s/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoryFromName = (name) => {
    if (!name) return "Certificate";
    if (name.toLowerCase().includes("risk")) return "Risk Management";
    if (name.toLowerCase().includes("claim")) return "Claims Processing";
    if (name.toLowerCase().includes("compliance")) return "Compliance";
    if (name.toLowerCase().includes("insurance")) return "Insurance";
    if (name.toLowerCase().includes("leadership")) return "Leadership";
    return "Professional Development";
  };

  const getLevelFromName = (name) => {
    if (!name) return "Intermediate";
    if (name.toLowerCase().includes("advanced")) return "Advanced";
    if (name.toLowerCase().includes("fundamental")) return "Beginner";
    if (name.toLowerCase().includes("excellence")) return "Advanced";
    return "Intermediate";
  };

  const getCreditsFromName = (name) => {
    if (!name) return 3;
    if (name.toLowerCase().includes("advanced")) return 5;
    if (name.toLowerCase().includes("comprehensive")) return 6;
    return 3;
  };

  return (
    <>
      <Header />
      
      <main className="main">
        {/* Hero Section */}
        <div className="page-title position-relative" data-aos="fade">
          <div className="heading">
            <div className="container">
              <div className="row d-flex justify-content-center text-center">
                <div className="col-lg-8">
                  <div className="mb-4">
                    <span className="badge bg-primary px-4 py-2 rounded-pill mb-3">
                      <i className="bi bi-award me-2"></i>
                      My Achievements
                    </span>
                  </div>
                  <h1 className="display-4 fw-bold mb-4">Certificates</h1>
                  <p className="lead mb-0">
                    Access your CPD certificates and track your professional development journey.
                    Complete courses, earn credits, and advance your career in insurance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid Section or Loading Spinner */}
        <section id="courses" className="courses section py-5">
          <div className="container">
            {loading ? (
              <div className="loading-wrapper">
                <div className="loading-container">
                  <div className="spinner-wrapper">
                    <div className="spinner-ring spinner-ring-outer"></div>
                    <div className="spinner-ring spinner-ring-inner"></div>
                    <div className="spinner-center">
                      <i className="bi bi-broadcast"></i>
                    </div>
                  </div>
                  <h3 className="loading-title">Loading Certificates</h3>
                  <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <p className="loading-message">Fetching your achievements...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-5" data-aos="fade-up">
                  <h2 className="fw-bold" style={{ color: '#1e3a8a' }}>My Learning Achievements</h2>
                  <p className="text-muted">Track your progress and download your certificates</p>
                </div>

                <div className="row g-4">
                  {certificates.length > 0 ? (
                    certificates.map((cert, index) => (
                      <div 
                        key={cert.id} 
                        className="col-lg-4 col-md-6 d-flex align-items-stretch"
                        data-aos="zoom-in"
                        data-aos-delay={100 + (index * 50)}
                      >
                        <div 
                          id={`cert-${cert.id}`}
                          className={`certificate-card w-100 ${visibleCards[`cert-${cert.id}`] ? 'card-visible' : ''}`}
                        >
                          <div className="card-img-wrapper position-relative">
                            {cert.course_img ? (
                              <img 
                                src={`data:image/png;base64,${cert.course_img}`}
                                className="card-img-top" 
                                alt={cert.certificate_name}
                              />
                            ) : (
                              <div className="placeholder-img d-flex align-items-center justify-content-center bg-light">
                                <i className="bi bi-file-text-fill" style={{ fontSize: "60px", color: "#0980bf" }}></i>
                              </div>
                            )}
                            <div className="card-overlay">
                              <span className="credit-badge" style={{backgroundColor: '#1976d2'}}>
                                <i className="bi bi-patch-check-fill me-1"></i>
                                {getCreditsFromName(cert.certificate_name)} CPD
                              </span>
                            </div>
                          </div>
                          
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <span className="category-badge">
                                {getCategoryFromName(cert.certificate_name)}
                              </span>
                              <span className="level-badge" style={{
                                background: getLevelFromName(cert.certificate_name) === 'Beginner' ? '#e3f2fd' : 
                                             getLevelFromName(cert.certificate_name) === 'Intermediate' ? '#fff3e0' : 
                                             '#e8f5e9',
                                color: getLevelFromName(cert.certificate_name) === 'Beginner' ? '#1976d2' : 
                                       getLevelFromName(cert.certificate_name) === 'Intermediate' ? '#f57c00' : 
                                       '#388e3c'
                              }}>
                                {getLevelFromName(cert.certificate_name)}
                              </span>
                            </div>

                            <h3 className="card-title h5 fw-bold mb-3">{cert.certificate_name}</h3>
                            
                            <div className="cert-details mb-3">
                              <div className="detail-item">
                                <i className="bi bi-person-badge"></i>
                                <span>Issued to: {cert.fullnames || cert.username}</span>
                              </div>
                              <div className="detail-item">
                                <i className="bi bi-calendar-check"></i>
                                <span>Issued: {formatDate(cert.completion_date)}</span>
                              </div>
                              <div className="detail-item">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span>Status: {cert.status || "Active"}</span>
                              </div>
                            </div>

                            <div className="progress-container mb-4">
                              <div className="progress-label d-flex justify-content-between mb-1">
                                <small className="text-muted">Completion</small>
                                <small className="text-success fw-bold">100%</small>
                              </div>
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: '100%' }}
                                ></div>
                              </div>
                            </div>

                            <button 
                              onClick={() => generateCertificate(cert)}
                              className="download-btn w-100"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "12px",
                                background: "linear-gradient(135deg, #0980bf 0%, #78b4f5 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "all 0.3s ease",
                                cursor: "pointer"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.boxShadow = "0 5px 15px rgba(9, 128, 191, 0.4)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <i className="bi bi-download me-2"></i>
                              Download Certificate
                              <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <h4 className="mt-3">No Certificates Yet</h4>
                      <p className="text-muted">Complete courses to earn your first certificate!</p>
                      <Link href="/events" className="btn btn-primary mt-2">
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>

      <style jsx global>{`
        .stats-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        
        .stats-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(30px);
        }
        
        .certificate-card.card-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .certificate-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card-img-wrapper {
          position: relative;
          overflow: hidden;
          height: 200px;
        }
        
        .card-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .placeholder-img {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 100%);
        }
        
        .certificate-card:hover .card-img-wrapper img {
          transform: scale(1.05);
        }
        
        .card-overlay {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
        }
        
        .credit-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }
        
        .category-badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .level-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .cert-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }
        
        .detail-item i {
          font-size: 13px;
          color: #0980bf;
          width: 20px;
        }
        
        /* Loading Spinner Styles */
        .loading-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          padding: 60px 20px;
        }
        
        .loading-container {
          text-align: center;
          background: white;
          padding: 50px 60px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          animation: fadeInUp 0.5s ease;
        }
        
        .spinner-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 30px;
        }
        
        .spinner-ring {
          position: absolute;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .spinner-ring-outer {
          width: 100%;
          height: 100%;
          border: 3px solid #e2e8f0;
          border-top-color: #60a5fa;
          border-right-color: #3b82f6;
        }
        
        .spinner-ring-inner {
          width: 70%;
          height: 70%;
          top: 15%;
          left: 15%;
          border: 3px solid #e2e8f0;
          border-bottom-color: #60a5fa;
          border-left-color: #60a5fa;
          animation-direction: reverse;
          animation-duration: 0.6s;
        }
        
        .spinner-center {
          position: absolute;
          width: 40%;
          height: 40%;
          top: 30%;
          left: 30%;
          background: linear-gradient(135deg, #0980bf 0%, #60a5fa 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
        
        .loading-title {
          font-size: 22px;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 15px;
        }
        
        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #0980bf 0%, #60a5fa 100%);
          border-radius: 50%;
          animation: bounce 1.4s ease infinite;
        }
        
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        
        .loading-message {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-12px); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2rem;
          }
          
          .stats-card {
            margin-bottom: 1rem;
          }
          
          .certificate-card {
            margin-bottom: 1rem;
          }
          
          .loading-container {
            padding: 40px 30px;
          }
          
          .spinner-wrapper {
            width: 80px;
            height: 80px;
          }
          
          .loading-title {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
}