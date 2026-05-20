"use client";

import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children, title }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }
        
        .modal-container {
          background: var(--surface-color, #ffffff);
          border-radius: 8px;
          width: 90%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.4s ease;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: #f9f9f9;
          border-radius: 8px 8px 0 0;
        }
        
        .modal-header h3 {
          font-size: 22px;
          font-weight: 700;
          color: var(--heading-color, #37423b);
          font-family: "Raleway", sans-serif;
          margin: 0;
        }
        
        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #444444;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .modal-close:hover {
          background: #0980bf;
          color: white;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .modal-container {
            width: 95%;
            margin: 20px;
          }
          
          .modal-header {
            padding: 16px 20px;
          }
          
          .modal-body {
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}
