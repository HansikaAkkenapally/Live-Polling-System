import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Components
import WelcomeScreen from './components/WelcomeScreen';
import TeacherSetup from './components/TeacherSetup';
import StudentSetup from './components/StudentSetup';
import TeacherInterface from './components/TeacherInterface';
import StudentInterface from './components/StudentInterface';
import WaitingScreen from './components/WaitingScreen';
import KickedOutScreen from './components/KickedOutScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('default-session');
  const [socket, setSocket] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [isKickedOut, setIsKickedOut] = useState(false);

  useEffect(() => {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Handle session state updates
    newSocket.on('session-state', (state) => {
      setSessionState(state);
    });

    // Handle new poll
    newSocket.on('new-poll', (poll) => {
      setSessionState(prev => ({ ...prev, currentPoll: poll }));
    });

    // Handle poll updates
    newSocket.on('poll-update', (data) => {
      setSessionState(prev => ({ ...prev, currentPoll: data.poll, students: data.students }));
    });

    // Handle poll ended
    newSocket.on('poll-ended', (poll) => {
      setSessionState(prev => ({ ...prev, currentPoll: poll }));
    });

    // Handle new chat message
    newSocket.on('new-message', (message) => {
      setSessionState(prev => ({
        ...prev,
        chatMessages: [...(prev.chatMessages || []), message]
      }));
    });

    // Handle user joined
    newSocket.on('user-joined', (data) => {
      setSessionState(prev => ({ ...prev, students: data.students }));
    });

    // Handle user left
    newSocket.on('user-left', (data) => {
      setSessionState(prev => ({ ...prev, students: data.students }));
    });

    // Handle student kicked
    newSocket.on('student-kicked', (data) => {
      setSessionState(prev => ({ ...prev, students: data.students }));
    });

    // Handle kicked out
    newSocket.on('kicked-out', () => {
      setIsKickedOut(true);
      setCurrentScreen('kicked-out');
    });

    return () => newSocket.close();
  }, []);

  const handleRoleSelection = (role) => {
    setUserType(role);
    if (role === 'teacher') {
      setCurrentScreen('teacher-setup');
    } else {
      setCurrentScreen('student-setup');
    }
  };

  const handleTeacherSetup = (name) => {
    setUserName(name);
    setCurrentScreen('teacher-interface');
    if (socket) {
      socket.emit('join-session', {
        sessionId,
        userType: 'teacher',
        userName: name
      });
    }
  };

  const handleStudentSetup = (name) => {
    setUserName(name);
    setCurrentScreen('student-interface');
    if (socket) {
      socket.emit('join-session', {
        sessionId,
        userType: 'student',
        userName: name
      });
    }
  };

  const renderCurrentScreen = () => {
    if (isKickedOut) {
      return <KickedOutScreen />;
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onRoleSelection={handleRoleSelection} />;
      
      case 'teacher-setup':
        return <TeacherSetup onSetup={handleTeacherSetup} />;
      
      case 'student-setup':
        return <StudentSetup onSetup={handleStudentSetup} />;
      
      case 'teacher-interface':
        return (
          <TeacherInterface
            socket={socket}
            userName={userName}
            sessionState={sessionState}
          />
        );
      
      case 'student-interface':
        if (!sessionState?.currentPoll) {
          return <WaitingScreen />;
        }
        return (
          <StudentInterface
            socket={socket}
            userName={userName}
            sessionState={sessionState}
          />
        );
      
      default:
        return <WelcomeScreen onRoleSelection={handleRoleSelection} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
