import React, { useState } from 'react';

const TeacherSetup = ({ onSetup }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSetup(name.trim());
    }
  };

  return (
    <div className="container">
      <div className="brand-tag">Intervue.io</div>
      
      <h1 className="title">Let's Get Started</h1>
      
      <p className="subtitle">
        You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Enter your Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <button 
          type="submit"
          className="primary-button"
          disabled={!name.trim()}
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default TeacherSetup;
