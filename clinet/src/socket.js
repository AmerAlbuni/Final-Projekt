// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5080', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export default socket;
