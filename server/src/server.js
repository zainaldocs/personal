const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Express Backend Server running on http://localhost:${PORT}`);
  await testConnection();
});
