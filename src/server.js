import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server AGIT Slot Balancing berjalan pada port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
