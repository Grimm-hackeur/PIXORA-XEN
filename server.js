require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SocketServer = require('./socketServer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(cookieParser());

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  SocketServer(socket);
});

app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/userRouter'));
app.use('/api', require('./routes/postRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/adminRouter'));
app.use('/api', require('./routes/notifyRouter'));
app.use('/api', require('./routes/messageRouter'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const URI = process.env.MONGODB_URL;

mongoose
  .connect(URI)
  .then(() => console.log('✅ Database Connected!'))
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 8080;
http.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
