const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Generate Jitsi Meet token
const generateJitsiToken = (roomName, userName, moderator = false) => {
  const payload = {
    context: {
      user: {
        avatar: 'https://acadify.example.com/avatar.png',
        name: userName,
        email: 'user@example.com',
        id: 'user_id'
      },
      group: 'acadify'
    },
    aud: 'jitsi',
    iss: process.env.JITSI_APP_ID,
    sub: 'meet.jit.si',
    room: roomName,
    moderator: moderator
  };

  const token = jwt.sign(payload, process.env.JITSI_APP_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256'
  });

  return token;
};

// Generate Jitsi Meet URL with token
const generateJitsiMeetUrl = (roomName, userName, moderator = false) => {
  const token = generateJitsiToken(roomName, userName, moderator);
  return `https://meet.jit.si/${roomName}#jwt=${token}`;
};

// Create meeting room
const createMeetingRoom = (roomName, facultyName) => {
  // In a real implementation, this would integrate with Jitsi API
  // For now, we'll just generate a URL
  return {
    roomName: roomName,
    meetingUrl: generateJitsiMeetUrl(roomName, facultyName, true),
    createdAt: new Date(),
    createdBy: facultyName
  };
};

module.exports = {
  generateJitsiToken,
  generateJitsiMeetUrl,
  createMeetingRoom
};