# Live Polling System - Intervue.io Assignment

A real-time polling system built with React frontend and Express.js backend with Socket.io for live communication.

## Features

### Teacher Features
- ✅ Create new polls with customizable time limits
- ✅ View live polling results with percentage bars
- ✅ Ask new questions only when appropriate (no active poll or all students answered)
- ✅ Chat functionality with students
- ✅ View poll history (bonus feature)
- ✅ Kick students from session (good to have feature)

### Student Features
- ✅ Enter name on first visit (unique per tab)
- ✅ Submit answers once a question is asked
- ✅ View live polling results after submission
- ✅ 60-second maximum time limit to answer questions
- ✅ Chat functionality with teacher and other students
- ✅ Waiting screen when no poll is active

### Technical Features
- ✅ Real-time updates using Socket.io
- ✅ Responsive design following exact Figma specifications
- ✅ Exact color scheme implementation (#7765DA, #5767D0, #4F0DCE, #F2F2F2, #373737, #8E8E8E)
- ✅ Modern UI with smooth animations and transitions

## Technology Stack

- **Frontend**: React 18.2.0
- **Backend**: Express.js with Socket.io
- **Real-time Communication**: Socket.io
- **Styling**: Custom CSS with exact design specifications

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd live-polling-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Manual Setup (Alternative)

If the above doesn't work, you can set up each part manually:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

5. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```

## Usage

1. **Open your browser** and go to `http://localhost:3000`

2. **Select your role**:
   - **Teacher**: Can create polls, view results, manage students
   - **Student**: Can answer polls, view results, chat

3. **For Teachers**:
   - Enter your name
   - Create polls with questions and multiple choice options
   - Set time limits (30-120 seconds)
   - View live results as students answer
   - Chat with students
   - Kick students if needed
   - View poll history

4. **For Students**:
   - Enter your name (unique per browser tab)
   - Wait for teacher to create a poll
   - Answer questions within the time limit
   - View live results after answering
   - Chat with teacher and other students

## Design Implementation

The application follows the exact design specifications from the provided Figma mockups:

- **Color Palette**: Exact hex codes implemented
- **Layout**: Responsive design matching the mockups
- **Components**: All UI elements match the design
- **User Flow**: Complete user journey as specified
- **Interactions**: Smooth animations and transitions

## Deployment

### Frontend (React)
- Build the production version: `cd client && npm run build`
- Deploy the `build` folder to any static hosting service (Netlify, Vercel, etc.)

### Backend (Express.js)
- Deploy to any Node.js hosting service (Heroku, Railway, DigitalOcean, etc.)
- Update the socket connection URL in the frontend to match your backend URL

## Project Structure

```
live-polling-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Main styles
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                # Express.js backend
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## Features Implemented

### Must-Have Requirements ✅
- [x] Functional system with all core features working
- [x] Teacher can create polls and students can answer them
- [x] Both teacher and student can view poll results
- [x] UI follows the shared Figma design without deviations

### Good to Have Features ✅
- [x] Configurable poll time limit by teacher (30-120 seconds)
- [x] Option for teacher to remove a student
- [x] Well-designed user interface

### Bonus Features ✅
- [x] Chat popup for interaction between students and teachers
- [x] Teacher can view past poll results

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

This is an assignment submission for Intervue.io. Please follow the submission guidelines provided in the assignment document.

## License

MIT License - Created for Intervue.io SDE Intern Assignment
