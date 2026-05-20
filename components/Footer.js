'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer id="footer" className="footer position-relative light-background">
      
      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">InsureConnect</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Designed by <a href="#">mandela mandela</a>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
       
        /* Copyright Section */
        .copyright {
          border-top: 1px solid #e2e8f0;
        }
        
        .copyright p {
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .credits {
          color: #94a3b8;
          font-size: 0.75rem;
        }
        
        .credits a {
          color: #1976d2;
          text-decoration: none;
        }
        
        .credits a:hover {
          text-decoration: underline;
        }
        
        /* ===== MOBILE RESPONSIVE ===== */
        
        /* Tablet (768px - 992px) */
        @media (max-width: 992px) {
          .footer {
            padding: 50px 0 20px;
          }
          
          .footer-links h4::after {
            width: 30px;
          }
        }
        
        /* Mobile (576px - 768px) */
        @media (max-width: 768px) {
          .footer {
            padding: 40px 0 15px;
            margin-top: 40px;
          }
          
          .footer-top {
            padding: 0 15px;
          }
          
          /* Center align for mobile */
          .footer-about {
            text-align: center;
          }
          
          .logo {
            justify-content: center;
            display: flex;
          }
          
          .sitename {
            font-size: 1.4rem;
          }
          
          .footer-contact p {
            font-size: 0.85rem;
          }
          
          .social-links {
            justify-content: center;
          }
          
          .footer-links {
            text-align: center;
          }
          
          .footer-links h4::after {
            left: 50%;
            transform: translateX(-50%);
          }
          
          .footer-links a:hover {
            padding-left: 0;
          }
        }
        
        /* Small Mobile (below 576px) */
        @media (max-width: 576px) {
          .footer {
            padding: 30px 0 15px;
          }
          
          .sitename {
            font-size: 1.3rem;
          }
          
          .footer-contact p {
            font-size: 0.8rem;
          }
          
          .footer-links h4 {
            font-size: 0.95rem;
            margin-bottom: 15px;
          }
          
          .footer-links li {
            margin-bottom: 8px;
          }
          
          .footer-links a {
            font-size: 0.8rem;
          }
          
          .copyright p {
            font-size: 0.75rem;
          }
          
          .credits {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </footer>
  )
}