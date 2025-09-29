import React, { useState, useEffect } from 'react';

const TeacherInterface = ({ socket, userName, sessionState }) => {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [showPollHistory, setShowPollHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);

  // Poll creation form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    if (socket) {
      socket.on('poll-history', (history) => {
        setPollHistory(history);
      });
    }
  }, [socket]);

  const handleCreatePoll = () => {
    if (!question.trim() || options.some(opt => !opt.text.trim())) {
      alert('Please fill in the question and all options');
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    socket.emit('create-poll', {
      question: question.trim(),
      options: validOptions,
      timeLimit
    });

    // Reset form
    setQuestion('');
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
    setShowCreatePoll(false);
  };

  useEffect(() => {
    if (!socket) return;
    const onInProgress = () => {
      alert('You can ask a new question only when no poll is active or after all students have answered.');
    };
    socket.on('poll-in-progress', onInProgress);
    return () => {
      socket.off('poll-in-progress', onInProgress);
    };
  }, [socket]);

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('send-message', { message: newMessage.trim() });
      setNewMessage('');
    }
  };

  const kickStudent = (studentId) => {
    if (window.confirm('Are you sure you want to kick this student?')) {
      socket.emit('kick-student', { studentId });
    }
  };

  const getPollHistory = () => {
    socket.emit('get-poll-history');
    setShowPollHistory(true);
  };

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getTotalVotes = () => {
    if (!sessionState?.currentPoll) return 0;
    return sessionState.currentPoll.options.reduce((sum, option) => sum + option.votes, 0);
  };

  if (showPollHistory) {
    return (
      <div className="container">
        <div className="brand-tag">Intervue.io</div>
        
        <h1 className="title">View Poll History</h1>
        
        <div className="poll-history">
          {pollHistory.map((poll, index) => (
            <div key={poll.id} className="poll-container">
              <h3>Question {index + 1}: {poll.question}</h3>
              <div className="poll-options-display">
                {poll.options.map((option) => (
                  <div key={option.id} className="poll-option-display">
                    <div className="poll-option-text">{option.text}</div>
                    <div className="poll-percentage">
                      {calculatePercentage(option.votes, poll.options.reduce((sum, opt) => sum + opt.votes, 0))}%
                    </div>
                    <div 
                      className="poll-result-bar"
                      style={{ 
                        width: `${calculatePercentage(option.votes, poll.options.reduce((sum, opt) => sum + opt.votes, 0))}%` 
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          className="secondary-button"
          onClick={() => setShowPollHistory(false)}
        >
          Back to Poll
        </button>
      </div>
    );
  }

  if (showCreatePoll) {
    return (
      <div className="container">
        <div className="brand-tag">Intervue.io</div>
        
        <h1 className="title">Create New Poll</h1>
        
        <div className="form-group">
          <label className="form-label">Enter your question</label>
          <textarea
            className="form-textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            maxLength={100}
          />
          <div className="character-counter">{question.length}/100</div>
        </div>

        <div className="form-group">
          <div className="flex-between mb-16">
            <label className="form-label">Poll Options</label>
            <select 
              value={timeLimit} 
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="form-input"
              style={{ width: 'auto', marginLeft: 'auto' }}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </select>
          </div>

          <div className="poll-options">
            {options.map((option, index) => (
              <div key={index} className="poll-option">
                <input type="radio" disabled />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <div className="correctness-selector">
                  <label>Is it Correct?</label>
                  <label>
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect === true}
                      onChange={() => updateOption(index, 'isCorrect', true)}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect === false}
                      onChange={() => updateOption(index, 'isCorrect', false)}
                    />
                    No
                  </label>
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    style={{ background: '#E74C3C', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button className="add-option-button" onClick={addOption}>
            <span>+</span> Add More Option
          </button>
        </div>

        <div className="flex-between">
          <button 
            className="secondary-button"
            onClick={() => setShowCreatePoll(false)}
          >
            Cancel
          </button>
          <button 
            className="primary-button"
            onClick={handleCreatePoll}
          >
            Ask Question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="brand-tag">Intervue.io</div>
      
      {sessionState?.currentPoll ? (
        <>
          <div className="flex-between mb-24">
            <h1 className="title">Question</h1>
            <button 
              className="secondary-button"
              onClick={getPollHistory}
            >
              👁️ View Poll History
            </button>
          </div>

          <div className="poll-container">
            <h2 className="poll-question">{sessionState.currentPoll.question}</h2>
            
            <div className="poll-options-display">
              {sessionState.currentPoll.options.map((option) => {
                const totalVotes = getTotalVotes();
                const percentage = calculatePercentage(option.votes, totalVotes);
                
                return (
                  <div key={option.id} className="poll-option-display">
                    <input type="radio" disabled />
                    <div className="poll-option-text">{option.text}</div>
                    <div className="poll-percentage">{percentage}%</div>
                    <div 
                      className="poll-result-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>

            <button 
              className="primary-button"
              onClick={() => setShowCreatePoll(true)}
              style={{ marginTop: '24px' }}
            >
              + Ask a new question
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="title">Welcome, {userName}!</h1>
          <p className="subtitle">Create your first poll to get started</p>
          
          <button 
            className="primary-button"
            onClick={() => setShowCreatePoll(true)}
          >
            + Ask a new Poll
          </button>
        </>
      )}

      {/* Chat Icon */}
      <div className="chat-icon" onClick={() => setShowPopup(!showPopup)}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>

      {/* Floating Popup Panel */}
      <div className={`popup-panel ${showPopup ? 'open' : ''}`}>
        <div className="sidebar-tabs">
          <button 
            className={`sidebar-tab ${sidebarTab === 'chat' ? 'active' : ''}`}
            onClick={() => setSidebarTab('chat')}
          >
            Chat
          </button>
          <button 
            className={`sidebar-tab ${sidebarTab === 'participants' ? 'active' : ''}`}
            onClick={() => setSidebarTab('participants')}
          >
            Participants
          </button>
        </div>

        {sidebarTab === 'chat' ? (
          <>
            <div className="chat-messages">
              {sessionState?.chatMessages?.map((message) => (
                <div key={message.id} className="chat-message">
                  <div className="user-name">{message.userName}</div>
                  <div>{message.message}</div>
                </div>
              ))}
            </div>
            <div className="flex" style={{ padding: 12, borderTop: '1px solid #F0F0F0' }}>
              <input
                type="text"
                className="chat-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                className="primary-button"
                onClick={sendMessage}
                style={{ marginLeft: '8px', padding: '12px 16px' }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="participants-list">
            {sessionState?.students?.map((student) => (
              <div key={student.id} className="participant-item">
                <span>{student.name}</span>
                <button 
                  className="kick-button"
                  onClick={() => kickStudent(student.id)}
                >
                  Kick out
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherInterface;
