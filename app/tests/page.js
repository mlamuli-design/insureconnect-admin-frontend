"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { IP } from "../../config";

export default function CourseTestsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!storedUser || !isLoggedIn) {
      router.push("/");
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchCourses();
    fetchTests();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${IP}/api/courses`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch(`${IP}/api/tests`);
      const data = await res.json();
      if (data.success) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } 
    finally {
      setLoading(false);
    }
  };

  const handleExcelFile = (file) => {
    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(jsonData);
      setPreviewData(jsonData.slice(0, 5));
    };
    reader.readAsArrayBuffer(file);
  };

const handleFileUpload = async (e) => {
  e.preventDefault();
  if (!selectedCourse || !excelFile || excelData.length === 0) {
    alert("Please select a course and upload a valid Excel file");
    return;
  }

  setActionLoading(true);
  setUploadProgress(0);

  const formData = new FormData();
  formData.append("course_id", selectedCourse.id);
  formData.append("course_name", selectedCourse.course_name);
  formData.append("excel_data", JSON.stringify(excelData)); // Stringify the JSON

  const interval = setInterval(() => {
    setUploadProgress(prev => {
      if (prev >= 90) {
        clearInterval(interval);
        return 90;
      }
      return prev + 10;
    });
  }, 200);

  try {
    const res = await fetch(`${IP}/api/tests/upload-excel`, {
      method: "POST",
      body: formData // Don't set Content-Type header
    });
    
    const data = await res.json();
    clearInterval(interval);
    setUploadProgress(100);
    
    if (data.success) {
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedCourse(null);
        setExcelFile(null);
        setExcelData([]);
        setPreviewData([]);
        setUploadProgress(0);
        fetchTests();
        alert(`Successfully uploaded ${data.tests_count} questions!`);
      }, 500);
    } else {
      alert(data.message || "Error uploading test");
      setUploadProgress(0);
    }
  } catch (error) {
    console.error("Error uploading test:", error);
    alert("Error uploading test");
    setUploadProgress(0);
  } finally {
    clearInterval(interval);
    setActionLoading(false);
  }
};

  const handleDeleteAllTests = async (courseId, courseName) => {
    if (confirm(`Are you sure you want to delete ALL tests for "${courseName}"? This action cannot be undone.`)) {
      try {
        const res = await fetch(`${IP}/api/tests/delete-by-course/${courseId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          await fetchTests();
          if (selectedCourse?.id === courseId) {
            setShowTestModal(false);
            setSelectedCourse(null);
            setSelectedTest(null);
          }
          alert(`Successfully deleted ${data.deleted_count} test questions!`);
        } else {
          alert(data.message || "Error deleting tests");
        }
      } catch (error) {
        console.error("Error deleting tests:", error);
        alert("Error deleting tests");
      }
    }
  };

  const handleViewTests = (course) => {
    const courseTests = tests.filter(t => t.course_id === course.id);
    setSelectedCourse(course);
    setSelectedTest({
      course_name: course.course_name,
      course_id: course.id,
      tests: courseTests,
      questionCount: courseTests.length
    });
    setShowTestModal(true);
  };

  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

if (loading && tests.length === 0) {
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
      
      <div className="course-tests-page">
        <div className="page-header">
          <div className="container">
            <div className="header-content">
              <div>
                <h1><i className="bi bi-journal-bookmark-fill"></i> Course Test Management</h1>
                <p>Upload Excel files with test questions, manage assessments per course</p>
              </div>
              <div className="header-stats">
                <div className="stat-badge">
                  <i className="bi bi-book"></i>
                  <span>{courses.length} Courses</span>
                </div>
                <div className="stat-badge">
                  <i className="bi bi-question-circle"></i>
                  <span>{tests.length} Questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="search-section">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-journal-x"></i>
              <h3>No courses found</h3>
              <p>Try adjusting your search or create a new course</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => {
                const courseTests = tests.filter(t => t.course_id === course.id);
                const hasTests = courseTests.length > 0;
                
                return (
                  <div className="course-card" key={course.id}>
                    <div className="course-card-image">
                      {course.course_img ? (
                        <img src={course.course_img} alt={course.course_name} />
                      ) : (
                        <div className="image-placeholder">
                          <i className="bi bi-camera-reels"></i>
                        </div>
                      )}
                      <div className="course-status-badge">
                        {hasTests ? (
                          <span className="status-has-tests">
                            <i className="bi bi-check-circle-fill"></i> Test Available
                          </span>
                        ) : (
                          <span className="status-no-tests">
                            <i className="bi bi-exclamation-circle-fill"></i> No Test
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="course-card-content">
                      <h3>{course.course_name}</h3>
                      <p className="course-description">
                        {course.course_description?.substring(0, 100)}
                        {course.course_description?.length > 100 ? "..." : ""}
                      </p>
                      
                      <div className="course-stats">
                        <div className="stat">
                          <i className="bi bi-tag-fill"></i>
                          <span>{course.course_catergory}</span>
                        </div>
                        <div className="stat">
                          <i className="bi bi-question-circle-fill"></i>
                          <span>{courseTests.length} Questions</span>
                        </div>
                      </div>
                      
                      <div className="course-actions">
                        {hasTests ? (
                          <button 
                            className="btn-view-tests"
                            onClick={() => handleViewTests(course)}
                          >
                            <i className="bi bi-eye-fill"></i> View Tests
                            <i className="bi bi-arrow-right"></i>
                          </button>
                        ) : (
                          <button 
                            className="btn-upload-test"
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowUploadModal(true);
                            }}
                          >
                            <i className="bi bi-file-earmark-excel-fill"></i> Upload Excel
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* View Tests Modal */}
      {showTestModal && selectedTest && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal-container test-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-icon">
                  <i className="bi bi-journal-bookmark-fill"></i>
                </div>
                <div>
                  <h2>{selectedTest.course_name}</h2>
                  <p>{selectedTest.questionCount} Questions • Test Assessment</p>
                </div>
              </div>
              <div className="modal-actions-header">
                {selectedTest.questionCount > 0 && (
                  <button 
                    className="btn-delete-all"
                    onClick={() => handleDeleteAllTests(selectedTest.course_id, selectedTest.course_name)}
                  >
                    <i className="bi bi-trash-fill"></i> Delete All
                  </button>
                )}
                <button className="modal-close" onClick={() => setShowTestModal(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <div className="modal-body">
              {selectedTest.tests.length === 0 ? (
                <div className="empty-tests">
                  <i className="bi bi-file-earmark-excel"></i>
                  <p>No test questions available for this course</p>
                  <button 
                    className="btn-upload-test"
                    onClick={() => {
                      setShowTestModal(false);
                      setSelectedCourse({ id: selectedTest.course_id, course_name: selectedTest.course_name });
                      setShowUploadModal(true);
                    }}
                  >
                    <i className="bi bi-file-earmark-excel-fill"></i> Upload Excel Now
                  </button>
                </div>
              ) : (
                <div className="questions-container">
                  {selectedTest.tests.map((test, index) => (
                    <div className="question-item" key={test.id}>
                      <div className="question-header">
                        <div className="question-number">Question {index + 1}</div>
                        {/* <button 
                          className="btn-delete-question"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button> */}
                      </div>
                      
                      <div className="question-text">
                        <i className="bi bi-quote"></i>
                        {test.question}
                      </div>
                      
                      <div className="answers-grid">
                        <div className={`answer-option ${test.correct_answer === 'A' || test.correct_answer === '1' ? 'correct' : ''}`}>
                          <div className="answer-letter">A</div>
                          <div className="answer-text">{test.answer_a}</div>
                          {(test.correct_answer === 'A' || test.correct_answer === '1') && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                        <div className={`answer-option ${test.correct_answer === 'B' || test.correct_answer === '2' ? 'correct' : ''}`}>
                          <div className="answer-letter">B</div>
                          <div className="answer-text">{test.answer_b}</div>
                          {(test.correct_answer === 'B' || test.correct_answer === '2') && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                        <div className={`answer-option ${test.correct_answer === 'C' || test.correct_answer === '3' ? 'correct' : ''}`}>
                          <div className="answer-letter">C</div>
                          <div className="answer-text">{test.answer_c}</div>
                          {(test.correct_answer === 'C' || test.correct_answer === '3') && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                        <div className={`answer-option ${test.correct_answer === 'D' || test.correct_answer === '4' ? 'correct' : ''}`}>
                          <div className="answer-letter">D</div>
                          <div className="answer-text">{test.answer_d}</div>
                          {(test.correct_answer === 'D' || test.correct_answer === '4') && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Excel Modal */}
      {showUploadModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-container upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="bi bi-file-earmark-excel-fill"></i> Upload Excel for "{selectedCourse.course_name}"</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <form onSubmit={handleFileUpload} className="modal-form">
              <div className="form-group">
                <label><i className="bi bi-file-earmark-excel"></i> Excel File *</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => handleExcelFile(e.target.files[0])}
                    className="file-input"
                    id="excel-upload"
                    required
                  />
                  <label htmlFor="excel-upload" className="file-label">
                    <i className="bi bi-cloud-arrow-up"></i>
                    <span>{excelFile ? excelFile.name : "Choose Excel file (.xlsx, .xls, .csv)"}</span>
                    <i className="bi bi-file-earmark-excel-fill"></i>
                  </label>
                </div>
              </div>

              {previewData.length > 0 && (
                <div className="preview-section">
                  <div className="preview-header">
                    <i className="bi bi-eye"></i>
                    <span>Preview (First 5 rows)</span>
                  </div>
                  <div className="preview-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Answer A</th>
                          <th>Answer B</th>
                          <th>Answer C</th>
                          <th>Answer D</th>
                          <th>Correct (1-4)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.question}</td>
                            <td>{row.answer_a}</td>
                            <td>{row.answer_b}</td>
                            <td>{row.answer_c}</td>
                            <td>{row.answer_d}</td>
                            <td className="correct-highlight">{row.correct_answer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="preview-note">
                    <i className="bi bi-info-circle"></i>
                    Total questions found: {excelData.length}
                  </p>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
                    {uploadProgress}%
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={actionLoading || !excelFile}>
                  {actionLoading ? (
                    <span className="spinner"></span>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload"></i>
                      Upload {excelData.length} Questions
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="excel-example">
              <div className="example-note">
                <i className="bi bi-info-circle-fill"></i>
                <span>Required columns: question, answer_a, answer_b, answer_c, answer_d, correct_answer (1, 2, 3, or 4)</span>
              </div>
            </div>
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
        
        .course-tests-page {
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
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        .search-section {
          margin-bottom: 2rem;
        }
        
        .search-box {
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
        
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .course-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px -12px rgba(0,0,0,0.15);
        }
        
        .course-card-image {
          position: relative;
          height: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }
        
        .course-card-image img {
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
        
        .course-status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
        
        .status-has-tests, .status-no-tests {
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .status-has-tests {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }
        
        .status-no-tests {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }
        
        .course-card-content {
          padding: 1.25rem;
        }
        
        .course-card-content h3 {
          font-size: 1.2rem;
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }
        
        .course-description {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }
        
        .course-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .stat i {
          color: #1976d2;
          font-size: 0.8rem;
        }
        
        .course-actions {
          margin-top: 1rem;
        }
        
        .btn-view-tests, .btn-upload-test {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-view-tests {
          background: linear-gradient(135deg, #1976d2, #2563eb);
          color: white;
        }
        
        .btn-view-tests:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
        }
        
        .btn-upload-test {
          background: #f1f5f9;
          color: #1976d2;
          border: 1px solid #e2e8f0;
        }
        
        .btn-upload-test:hover {
          background: #e8f4f8;
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
          max-width: 1000px;
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .test-modal {
          max-width: 1000px;
        }
        
        .upload-modal {
          max-width: 900px;
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
          z-index: 1;
        }
        
        .modal-header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .modal-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #1976d2, #2563eb);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-icon i {
          font-size: 1.5rem;
          color: white;
        }
        
        .modal-header-info h2 {
          margin: 0 0 0.25rem;
          font-size: 1.2rem;
        }
        
        .modal-header-info p {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .modal-actions-header {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .btn-delete-all {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .btn-delete-all:hover {
          background: #dc2626;
          color: white;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.3s ease;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-close:hover {
          background: #f1f5f9;
          color: #dc2626;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .questions-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .question-item {
          background: #f8fafc;
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }
        
        .question-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .question-number {
          background: linear-gradient(135deg, #1976d2, #2563eb);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .btn-delete-question {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.3s ease;
        }
        
        .btn-delete-question:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .question-text {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #1a202c;
          line-height: 1.5;
        }
        
        .question-text i {
          color: #1976d2;
          font-size: 1.2rem;
        }
        
        .answers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .answer-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .answer-option.correct {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          border-color: #10b981;
        }
        
        .answer-letter {
          width: 28px;
          height: 28px;
          background: #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .answer-option.correct .answer-letter {
          background: #10b981;
          color: white;
        }
        
        .answer-text {
          flex: 1;
          font-size: 0.85rem;
          color: #4a5568;
        }
        
        .answer-option.correct .answer-text {
          color: #155724;
          font-weight: 500;
        }
        
        .answer-option i {
          color: #10b981;
          font-size: 1rem;
        }
        
        .empty-tests {
          text-align: center;
          padding: 3rem;
        }
        
        .empty-tests i {
          font-size: 3rem;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }
        
        .empty-tests p {
          margin-bottom: 1.5rem;
          color: #64748b;
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
        
        .file-upload-area {
          position: relative;
        }
        
        .file-input {
          display: none;
        }
        
        .file-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .file-label:hover {
          border-color: #1976d2;
          background: #e8f4f8;
        }
        
        .file-label i:first-child {
          font-size: 1.5rem;
          color: #1976d2;
        }
        
        .file-label i:last-child {
          font-size: 1.5rem;
          color: #10b981;
        }
        
        .preview-section {
          margin: 1rem 0;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .preview-header {
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
        }
        
        .preview-table {
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .preview-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }
        
        .preview-table th {
          background: #f1f5f9;
          padding: 0.5rem;
          text-align: left;
          font-weight: 600;
          position: sticky;
          top: 0;
        }
        
        .preview-table td {
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .correct-highlight {
          background: #d4edda;
          font-weight: 600;
          color: #155724;
        }
        
        .preview-note {
          padding: 0.75rem 1rem;
          background: #e8f4f8;
          margin: 0;
          font-size: 0.75rem;
          color: #1976d2;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .progress-bar {
          margin: 1rem 0;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          height: 30px;
        }
        
        .progress-fill {
          background: linear-gradient(135deg, #1976d2, #2563eb);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          transition: width 0.3s ease;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
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
        
        .excel-example {
          margin: 1rem 1.5rem 1.5rem;
          background: #1e293b;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .example-header {
          padding: 0.75rem 1rem;
          background: #0f172a;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        
        .example-table {
          padding: 1rem;
          overflow-x: auto;
        }
        
        .example-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.7rem;
        }
        
        .example-table th {
          background: #334155;
          color: white;
          padding: 0.5rem;
          text-align: left;
        }
        
        .example-table td {
          padding: 0.5rem;
          border-bottom: 1px solid #334155;
          color: #cbd5e1;
        }
        
        .example-note {
          padding: 0.75rem 1rem;
          background: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #94a3b8;
          border-top: 1px solid #334155;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .courses-grid {
            grid-template-columns: 1fr;
          }
          
          .answers-grid {
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
          
          .modal-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .modal-actions-header {
            width: 100%;
            justify-content: space-between;
          }
          
          .preview-table {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </>
  );
}