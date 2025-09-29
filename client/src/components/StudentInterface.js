import React, { useState, useEffect } from 'react';

const StudentInterface = ({ socket, userName, sessionState }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [seenPollId, setSeenPollId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [participantCount, setParticipantCount] = useState(0);

  // When a poll is first seen (or poll changes), start a fresh local countdown
  useEffect(() => {
    const poll = sessionState?.currentPoll;
    if (!poll) return;

    // If we haven't seen this poll yet, initialize a fresh countdown from its timeLimit
    if (seenPollId !== poll.id) {
      setSeenPollId(poll.id);
      setTimeLeft(poll.timeLimit || 60);
    }

    // Check if student has already answered
    const student = sessionState?.students?.find(s => s.name === userName);
    setHasAnswered(student?.hasAnswered || false);
  }, [sessionState?.currentPoll, sessionState?.students, userName, seenPollId]);

  // Local per-student countdown that starts when the poll is first seen
  useEffect(() => {
    if (timeLeft <= 0) return;
    const poll = sessionState?.currentPoll;
    if (!poll || !poll.isActive) return; // stop local timer if poll already ended globally
    const timer = setTimeout(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, sessionState?.currentPoll]);

  useEffect(() => {
    if (sessionState?.students) {
      setParticipantCount(sessionState.students.length);
    }
  }, [sessionState?.students]);

  const handleSubmitAnswer = () => {
    if (selectedOption && !hasAnswered) {
      socket.emit('submit-answer', { optionId: selectedOption });
      setHasAnswered(true);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('send-message', { message: newMessage.trim() });
      setNewMessage('');
    }
  };

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getTotalVotes = () => {
    if (!sessionState?.currentPoll) return 0;
    return sessionState.currentPoll.options.reduce((sum, option) => sum + option.votes, 0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionState?.currentPoll) {
    return <div className="container"><div className="brand-tag">Intervue.io</div><div className="waiting-container"><div className="waiting-icon"></div><p className="waiting-message">Wait for the teacher to ask questions..</p></div></div>;
  }

  const poll = sessionState.currentPoll;
  const totalVotes = getTotalVotes();

  return (
    <div className="container">
      <div className="brand-tag">Intervue.io</div>
      
      <div className="flex-between mb-24">
        <h1 className="title">Question 1</h1>
        <div className="poll-timer">
          <span>⏰</span>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="poll-container">
        <h2 className="poll-question">{poll.question}</h2>
        
        <div className="poll-options-display">
          {poll.options.map((option) => {
            const percentage = calculatePercentage(option.votes, totalVotes);
            const isSelected = selectedOption === option.id;
            
            return (
              <div 
                key={option.id} 
                className={`poll-option-display ${isSelected ? 'selected' : ''}`}
                onClick={() => !hasAnswered && setSelectedOption(option.id)}
              >
                <input 
                  type="radio" 
                  checked={isSelected}
                  onChange={() => !hasAnswered && setSelectedOption(option.id)}
                  disabled={hasAnswered}
                />
                <div className="poll-option-text">{option.text}</div>
                {hasAnswered && (
                  <>
                    <div className="poll-percentage">{percentage}%</div>
                    <div 
                      className="poll-result-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!hasAnswered && timeLeft > 0 && poll.isActive && (
          <button 
            className="primary-button"
            onClick={handleSubmitAnswer}
            disabled={!selectedOption}
            style={{ marginTop: '24px' }}
          >
            Submit
          </button>
        )}

        {hasAnswered && (
          <div className="text-center mt-24">
            <p style={{ color: '#8E8E8E', fontSize: '16px' }}>
              Wait for the teacher to ask a new question.
            </p>
          </div>
        )}

        {(timeLeft === 0 || !poll.isActive) && !hasAnswered && (
          <div className="text-center mt-24">
            <p style={{ color: '#E74C3C', fontSize: '16px' }}>
              Time's up! Results are now visible.
            </p>
          </div>
        )}
      </div>

      {/* Participant Count */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'rgba(119, 101, 218, 0.9)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px' }}>
        👥 {participantCount} participants
      </div>

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
                <span style={{ fontSize: '12px', color: '#8E8E8E' }}>
                  {student.hasAnswered ? 'Answered' : 'Waiting'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;
