"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { IP } from "../../config";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admin: 0 },
    courses: { total: 0, active: 0 },
    tests: { courses_with_tests: 0, total_questions: 0 },
    certificates: { total: 0, unique_users: 0, cpd_points: 0 },
    completion_rate: 0,
    popular_courses: []
  });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!storedUser || !isLoggedIn) {
    window.location.href = "/"
    }
    
    setUser(JSON.parse(storedUser));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`${IP}/api/dashboard/stats`);
      const statsData = await statsRes.json();
      
      const activitiesRes = await fetch(`${IP}/api/dashboard/activities`);
      const activitiesData = await activitiesRes.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
      
      if (activitiesData.success) {
        setActivities(activitiesData.activities);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

if (loading) {
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
      
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="container">
            <div className="header-content">
              <div>
                <h1><i className="bi bi-speedometer2"></i> Admin Dashboard</h1>
                <p>Welcome back, {user?.name || user?.username}! Here's your platform overview</p>
              </div>
              <div className="date-badge">
                <i className="bi bi-calendar3"></i>
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Stats Cards Row */}
          <div className="stats-row">
            <div className="stat-card users">
              <div className="stat-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.users.total}</h3>
                <p>Total Users</p>
                <div className="stat-sub">
                  <span className="active">{stats.users.active} Active</span>
                  <span className="admin">{stats.users.admin} Admin</span>
                </div>
              </div>
              <div className="stat-trend">
                <i className="bi bi-arrow-up-short"></i>
              </div>
            </div>

            <div className="stat-card courses">
              <div className="stat-icon">
                <i className="bi bi-journal-bookmark-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.courses.total}</h3>
                <p>Total Courses</p>
                <div className="stat-sub">
                  <span className="active">{stats.courses.active} Active</span>
                </div>
              </div>
              <div className="stat-trend">
                <i className="bi bi-bookmark-check-fill"></i>
              </div>
            </div>

            <div className="stat-card tests">
              <div className="stat-icon">
                <i className="bi bi-question-circle-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.tests.total_questions}</h3>
                <p>Test Questions</p>
                <div className="stat-sub">
                  <span>{stats.tests.courses_with_tests} Courses with tests</span>
                </div>
              </div>
              <div className="stat-trend">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>

            <div className="stat-card certificates">
              <div className="stat-icon">
                <i className="bi bi-award-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.certificates.total}</h3>
                <p>Certificates Issued</p>
                <div className="stat-sub">
                  <span>{stats.certificates.cpd_points} CPD Points</span>
                </div>
              </div>
              <div className="stat-trend">
                <i className="bi bi-trophy-fill"></i>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3><i className="bi bi-graph-up"></i> Platform Overview</h3>
                <div className="chart-legend">
                  <span><i className="bi bi-circle-fill"></i> Users</span>
                  <span><i className="bi bi-circle-fill" style={{ color: "#2563eb" }}></i> Courses</span>
                </div>
              </div>
              <div className="chart-container">
                <svg viewBox="0 0 600 200" className="growth-chart">
                  <defs>
                    <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#1976d2", stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: "#1976d2", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path d="M0,180 L50,170 L100,175 L150,150 L200,155 L250,130 L300,135 L350,110 L400,115 L450,90 L500,85 L550,60 L600,55" 
                        fill="none" stroke="#1976d2" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M0,180 L50,170 L100,175 L150,150 L200,155 L250,130 L300,135 L350,110 L400,115 L450,90 L500,85 L550,60 L600,55 L600,200 L0,200 Z" 
                        fill="url(#userGradient)"/>
                  <circle cx="600" cy="55" r="4" fill="#1976d2" stroke="white" strokeWidth="2"/>
                  <path d="M0,190 L50,185 L100,188 L150,175 L200,178 L250,165 L300,168 L350,155 L400,158 L450,145 L500,148 L550,135 L600,138" 
                        fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5"/>
                </svg>
              </div>
              <div className="chart-stats">
                <div className="stat">
                  <span className="label">Total Users</span>
                  <span className="value">{stats.users.total}</span>
                </div>
                <div className="stat">
                  <span className="label">Total Courses</span>
                  <span className="value">{stats.courses.total}</span>
                </div>
                <div className="stat">
                  <span className="label">Completion Rate</span>
                  <span className="value">{stats.completion_rate}%</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3><i className="bi bi-pie-chart"></i> Engagement Metrics</h3>
              </div>
              <div className="metrics-grid">
                <div className="metric-circle">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1976d2" strokeWidth="8" 
                            strokeDasharray={`${(stats.completion_rate / 100) * 314} 314`} 
                            transform="rotate(-90 60 60)"/>
                  </svg>
                  <div className="metric-center">
                    <span className="metric-value">{stats.completion_rate}%</span>
                    <span className="metric-label">Completion Rate</span>
                  </div>
                </div>
                <div className="metric-circle">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#2563eb" strokeWidth="8" 
                            strokeDasharray={`${(stats.certificates.unique_users / stats.users.total || 0) * 314} 314`} 
                            transform="rotate(-90 60 60)"/>
                  </svg>
                  <div className="metric-center">
                    <span className="metric-value">{Math.round((stats.certificates.unique_users / stats.users.total || 0) * 100)}%</span>
                    <span className="metric-label">Certified Users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="bottom-row">
            <div className="activities-card">
              <div className="card-header">
                <h3><i className="bi bi-activity"></i> Recent Activity</h3>
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="activities-list">
                {activities.length === 0 ? (
                  <div className="no-activities">
                    <i className="bi bi-inbox"></i>
                    <p>No recent activities</p>
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div className="activity-item" key={index}>
                      <div className="activity-icon" style={{ background: getIconColor(activity.type), color: "white" }}>
                        <i className={`bi bi-${activity.icon}`}></i>
                      </div>
                      <div className="activity-details">
                        <div className="activity-action">{activity.action}</div>
                        <div className="activity-user">{activity.user_name}</div>
                      </div>
                      <div className="activity-time">{formatTime(activity.time)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="popular-card">
              <div className="card-header">
                <h3><i className="bi bi-trophy-fill"></i> Popular Courses</h3>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="popular-list">
                {stats.popular_courses.length === 0 ? (
                  <div className="no-popular">
                    <i className="bi bi-book"></i>
                    <p>No courses yet</p>
                  </div>
                ) : (
                  stats.popular_courses.map((course, index) => (
                    <div className="popular-item" key={index}>
                      <div className="popular-rank">#{index + 1}</div>
                      <div className="popular-info">
                        <div className="popular-name">{course.course_name}</div>
                        <div className="popular-stats">
                          <i className="bi bi-award-fill"></i>
                          <span>{course.certificate_count} certificates</span>
                        </div>
                      </div>
                      <div className="popular-bar">
                        <div className="bar-fill" style={{ width: `${Math.min((course.certificate_count / (stats.popular_courses[0]?.certificate_count || 1)) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button onClick={() => router.push('/users')}>
              <i className="bi bi-people-fill"></i>
              <span>Manage Users</span>
            </button>
            <button onClick={() => router.push('/events')}>
              <i className="bi bi-calendar-event-fill"></i>
              <span>Manage Courses</span>
            </button>
            <button onClick={() => router.push('/tests')}>
              <i className="bi bi-question-circle-fill"></i>
              <span>Manage Tests</span>
            </button>
            {/* <button onClick={() => router.push('/certificates')}>
              <i className="bi bi-award-fill"></i>
              <span>Certificates</span>
            </button> */}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .loading-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%);
        }
        
        .loading-rings {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
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
        
        .ring-1 { border-top-color: #1976d2; }
        .ring-2 { border-right-color: #2563eb; animation-delay: 0.3s; width: 70%; height: 70%; top: 15%; left: 15%; }
        .ring-3 { border-bottom-color: #3b82f6; animation-delay: 0.6s; width: 40%; height: 40%; top: 30%; left: 30%; }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          display: flex;
          justify-content: center;
          gap: 0.1rem;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .loading-text span {
          background: linear-gradient(135deg, #1976d2, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bounce 0.5s ease infinite alternate;
        }
        
        .loading-text span:nth-child(1) { animation-delay: 0s; }
        .loading-text span:nth-child(2) { animation-delay: 0.05s; }
        .loading-text span:nth-child(3) { animation-delay: 0.1s; }
        .loading-text span:nth-child(4) { animation-delay: 0.15s; }
        .loading-text span:nth-child(5) { animation-delay: 0.2s; }
        .loading-text span:nth-child(6) { animation-delay: 0.25s; }
        .loading-text span:nth-child(7) { animation-delay: 0.3s; }
        
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-5px); }
        }
        
        .dots {
          display: inline-flex;
          margin-left: 0.2rem;
        }
        
        .dots span {
          animation: blink 1.4s infinite;
        }
        
        .dots span:nth-child(1) { animation-delay: 0s; }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
        }
        
        .dashboard-header {
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          padding: 1.5rem 0;
          color: white;
          margin-bottom: 1.5rem;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-content h1 {
          font-size: 1.5rem;
          margin: 0 0 0.25rem 0;
        }
        
        .header-content h1 i {
          margin-right: 0.75rem;
        }
        
        .header-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.85rem;
        }
        
        .date-badge {
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -12px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-card.users .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
        .stat-card.courses .stat-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .stat-card.tests .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .stat-card.certificates .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
        
        .stat-icon i {
          font-size: 1.5rem;
          color: white;
        }
        
        .stat-info {
          flex: 1;
        }
        
        .stat-info h3 {
          font-size: 1.5rem;
          margin: 0;
          font-weight: 700;
        }
        
        .stat-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .stat-sub {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
          font-size: 0.7rem;
        }
        
        .stat-sub .active { color: #10b981; }
        .stat-sub .admin { color: #8b5cf6; }
        
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #10b981;
        }
        
        .charts-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .chart-header h3 {
          font-size: 0.9rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .chart-header h3 i {
          color: #1976d2;
        }
        
        .chart-legend {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
        }
        
        .chart-legend i {
          font-size: 0.6rem;
        }
        
        .chart-container {
          height: 140px;
        }
        
        .growth-chart {
          width: 100%;
          height: 100%;
        }
        
        .chart-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .chart-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .chart-stats .label {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .chart-stats .value {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1976d2;
        }
        
        .metrics-grid {
          display: flex;
          justify-content: space-around;
          gap: 1rem;
        }
        
        .metric-circle {
          position: relative;
          width: 100px;
          height: 100px;
          text-align: center;
        }
        
        .metric-circle svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        
        .metric-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        
        .metric-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a202c;
        }
        
        .metric-label {
          font-size: 0.65rem;
          color: #64748b;
          display: block;
        }
        
        .bottom-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .activities-card, .popular-card {
          background: white;
          border-radius: 16px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .card-header h3 {
          font-size: 0.9rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .card-header h3 i {
          color: #1976d2;
        }
        
        .card-header i {
          color: #94a3b8;
        }
        
        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .activity-item:hover {
          background: #f8fafc;
        }
        
        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .activity-icon i {
          font-size: 1rem;
        }
        
        .activity-details {
          flex: 1;
        }
        
        .activity-action {
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .activity-user {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .activity-time {
          font-size: 0.7rem;
          color: #94a3b8;
        }
        
        .no-activities, .no-popular {
          text-align: center;
          padding: 2rem;
          color: #94a3b8;
        }
        
        .no-activities i, .no-popular i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .no-activities p, .no-popular p {
          font-size: 0.8rem;
          margin: 0;
        }
        
        .popular-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .popular-item {
          padding: 0.5rem;
        }
        
        .popular-rank {
          font-size: 0.7rem;
          font-weight: 700;
          color: #1976d2;
          margin-bottom: 0.25rem;
        }
        
        .popular-name {
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .popular-stats {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .popular-stats i {
          font-size: 0.6rem;
          color: #f59e0b;
        }
        
        .popular-bar {
          margin-top: 0.5rem;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #1976d2, #2563eb);
          border-radius: 2px;
        }
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        
        .quick-actions button {
          background: white;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #1976d2;
          border: 1px solid #e2e8f0;
        }
        
        .quick-actions button:hover {
          background: linear-gradient(135deg, #1976d2, #2563eb);
          color: white;
          transform: translateY(-2px);
        }
        
        .quick-actions button i {
          font-size: 1rem;
        }
        
        @media (max-width: 1024px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .quick-actions {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .charts-row, .bottom-row {
            grid-template-columns: 1fr;
          }
          
          .stats-row {
            grid-template-columns: 1fr;
          }
          
          .quick-actions {
            grid-template-columns: 1fr;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .metrics-grid {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}

function getIconColor(type) {
  const colors = {
    user: '#10b981',
    certificate: '#ef4444',
    test: '#8b5cf6',
    course: '#3b82f6'
  };
  return colors[type] || '#1976d2';
}

function formatTime(time) {
  if (!time) return 'Just now';
  const date = new Date(time);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000 / 60);
  
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
  return `${Math.floor(diff / 1440)} days ago`;
}