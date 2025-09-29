import React, { useState } from 'react';

const WelcomeScreen = ({ onRoleSelection }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelection(selectedRole);
    }
  };

  return (
    <div className="container">
      <div className="brand-tag">Intervue.io</div>
      
      <h1 className="title">Welcome to the Live Polling System</h1>
      
      <p className="subtitle">
        Please select the role that best describes you to begin using the live polling system
      </p>

      <div className="role-cards">
        <div 
          className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
          onClick={() => handleRoleClick('student')}
        >
          <h3>I'm a Student</h3>
          <p>Submit answers and view live poll results in real-time.</p>
        </div>

        <div 
          className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
          onClick={() => handleRoleClick('teacher')}
        >
          <h3>I'm a Teacher</h3>
          <p>Create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
        </div>
      </div>

      <button 
        className="primary-button"
        onClick={handleContinue}
        disabled={!selectedRole}
      >
        Continue
      </button>
    </div>
  );
};

export default WelcomeScreen;
