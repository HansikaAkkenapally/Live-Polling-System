const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
let sessions = new Map();
let pollHistory = [];

// Helper function to get or create session
function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      teacher: null,
      students: new Map(),
      currentPoll: null,
      pollHistory: [],
      chatMessages: []
    });
  }
  return sessions.get(sessionId);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join session
  socket.on('join-session', (data) => {
    const { sessionId, userType, userName } = data;
    const session = getOrCreateSession(sessionId);
    
    socket.join(sessionId);
    socket.sessionId = sessionId;
    socket.userType = userType;
    socket.userName = userName;

    if (userType === 'teacher') {
      session.teacher = {
        id: socket.id,
        name: userName,
        socketId: socket.id
      };
    } else if (userType === 'student') {
      session.students.set(socket.id, {
        id: socket.id,
        name: userName,
        socketId: socket.id,
        hasAnswered: false
      });
    }

    // Send current session state to the user
    socket.emit('session-state', {
      currentPoll: session.currentPoll,
      students: Array.from(session.students.values()),
      chatMessages: session.chatMessages
    });

    // Notify others about the new user
    socket.to(sessionId).emit('user-joined', {
      userType,
      userName,
      students: Array.from(session.students.values())
    });
  });

  // Create new poll
  socket.on('create-poll', (data) => {
    const session = sessions.get(socket.sessionId);
    if (!session || socket.userType !== 'teacher') return;

    // Enforce: Teacher can ask a new question only if
    // 1) No question has been asked yet, OR
    // 2) No active poll is in progress (i.e., previous poll ended)
    if (session.currentPoll && session.currentPoll.isActive) {
      // Reject creating a new poll while one is active
      socket.emit('poll-in-progress');
      return;
    }

    // Reset any lingering currentPoll reference if it exists but is not active
    // (allows asking a new question after previous ended)
    if (session.currentPoll && !session.currentPoll.isActive) {
      // Keep history as-is, just allow new poll to replace the reference
    }

    const { question, options, timeLimit } = data;
    const pollId = uuidv4();
    
    const newPoll = {
      id: pollId,
      question,
      options: options.map(option => ({
        id: uuidv4(),
        text: option.text,
        isCorrect: option.isCorrect,
        votes: 0
      })),
      timeLimit: timeLimit || 60,
      startTime: Date.now(),
      isActive: true,
      answers: new Map()
    };

    session.currentPoll = newPoll;
    
    // Reset student answer status
    session.students.forEach(student => {
      student.hasAnswered = false;
    });

    // Broadcast new poll to all users in session
    io.to(socket.sessionId).emit('new-poll', newPoll);

    // Set timer to end poll
    setTimeout(() => {
      if (session.currentPoll && session.currentPoll.id === pollId) {
        endPoll(socket.sessionId, pollId);
      }
    }, newPoll.timeLimit * 1000);
  });

  // Submit answer
  socket.on('submit-answer', (data) => {
    const session = sessions.get(socket.sessionId);
    if (!session || !session.currentPoll || socket.userType !== 'student') return;

    const { optionId } = data;
    const student = session.students.get(socket.id);
    if (!student || student.hasAnswered) return;

    // Record the answer
    session.currentPoll.answers.set(socket.id, optionId);
    student.hasAnswered = true;

    // Update vote count
    const option = session.currentPoll.options.find(opt => opt.id === optionId);
    if (option) {
      option.votes++;
    }

    // Broadcast updated results
    io.to(socket.sessionId).emit('poll-update', {
      poll: session.currentPoll,
      students: Array.from(session.students.values())
    });

    // If all students have answered, end the poll early
    const allAnswered = Array.from(session.students.values()).length > 0 &&
      Array.from(session.students.values()).every(s => s.hasAnswered);
    if (allAnswered) {
      endPoll(socket.sessionId, session.currentPoll.id);
    }
  });

  // Send chat message
  socket.on('send-message', (data) => {
    const session = sessions.get(socket.sessionId);
    if (!session) return;

    const message = {
      id: uuidv4(),
      userName: socket.userName,
      userType: socket.userType,
      message: data.message,
      timestamp: Date.now()
    };

    session.chatMessages.push(message);

    // Broadcast message to all users in session
    io.to(socket.sessionId).emit('new-message', message);
  });

  // Kick student
  socket.on('kick-student', (data) => {
    const session = sessions.get(socket.sessionId);
    if (!session || socket.userType !== 'teacher') return;

    const { studentId } = data;
    const student = session.students.get(studentId);
    if (student) {
      session.students.delete(studentId);
      
      // Notify the kicked student
      io.to(studentId).emit('kicked-out');
      
      // Notify others
      socket.to(socket.sessionId).emit('student-kicked', {
        studentName: student.name,
        students: Array.from(session.students.values())
      });
    }
  });

  // Get poll history
  socket.on('get-poll-history', () => {
    const session = sessions.get(socket.sessionId);
    if (!session || socket.userType !== 'teacher') return;

    socket.emit('poll-history', session.pollHistory);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const session = sessions.get(socket.sessionId);
    if (!session) return;

    if (socket.userType === 'teacher') {
      session.teacher = null;
    } else if (socket.userType === 'student') {
      session.students.delete(socket.id);
    }

    // Notify others about disconnection
    socket.to(socket.sessionId).emit('user-left', {
      userType: socket.userType,
      userName: socket.userName,
      students: Array.from(session.students.values())
    });

    console.log('User disconnected:', socket.id);
  });
});

// Helper function to end poll
function endPoll(sessionId, pollId) {
  const session = sessions.get(sessionId);
  if (!session || !session.currentPoll || session.currentPoll.id !== pollId) return;

  session.currentPoll.isActive = false;
  
  // Add to poll history
  session.pollHistory.push({
    ...session.currentPoll,
    endTime: Date.now()
  });

  // Broadcast poll ended
  io.to(sessionId).emit('poll-ended', session.currentPoll);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
