// 📦 Core Imports
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';

// 🧩 Config & Middleware
import connectDB from './config/mongodb.js';
import errorHandler from './middleware/errorHandler.js';

// 📂 Route Handlers
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// ✅ Init & Setup
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// 🔌 Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 🔗 Inject io into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🧱 Middleware Stack
app.use(cors({
  origin: true ,
  credentials: true,
}));
app.use(express.json());
app.use(helmet());

// 🔀 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// 🌐 Base Route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// ❗ Global Error Handler
app.use(errorHandler);

// 🎧 Socket.io Event Listeners
io.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // 🧩 Task Comment Room
  socket.on('joinTask', (taskId) => {
    socket.join(taskId);
    console.log(`👥 Joined task room: ${taskId}`);
  });

  socket.on('sendComment', (data) => {
    io.to(data.taskId).emit('receiveComment', data.comment);
  });

  // 💬 Team Chat Room
  socket.on('joinRoom', (teamId) => {
    socket.join(teamId);
    console.log(`👥 Joined team chat room: ${teamId}`);
  });

  socket.on('sendMessage', ({ teamId, sender, content }) => {
    const message = {
      sender,
      content,
      timestamp: new Date().toISOString(),
    };
    io.to(teamId).emit('receiveMessage', message);
    console.log(`💬 ${sender} ➜ ${teamId}: ${content}`);
  });

  // 🔔 Notifications Room
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`🔔 Joined personal notification room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.io running on port ${PORT}`);
});
