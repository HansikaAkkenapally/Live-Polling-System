import React from 'react';

const WaitingScreen = () => {
  return (
    <div className="container">
      <div className="brand-tag">Intervue.io</div>
      
      <div className="waiting-container">
        <button 
          className="primary-button"
          style={{ marginBottom: '32px' }}
          disabled
        >
          + Ask a new Poll
        </button>
        
        <div className="waiting-icon"></div>
        
        <p className="waiting-message">
          Wait for the teacher to ask questions..
        </p>
      </div>

      {/* Chat Icon */}
      <div className="chat-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>
    </div>
  );
};

export default WaitingScreen;
