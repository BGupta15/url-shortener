const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    tls: true,
    rejectUnauthorized: false,
    reconnectStrategy: (retries) => {
      if (retries > 5) return false;
      return retries * 500;
    }
  },
  pingInterval: 30000
});

client.on('error', (err) => {
  console.error('Redis error:', err.message);
});

client.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

client.on('ready', () => {
  console.log('Redis connected');
});

client.connect().catch((err) => {
  console.error('Redis initial connection failed:', err.message);
});

module.exports = client;