import React, { useState } from 'react';

const StudentSetup = ({ onSetup }) => {
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
        If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your respondents compare with your classmates.
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

export default StudentSetup;
