const app = require('./app');
const { getEnv } = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  const { port } = getEnv();

  await sequelize.authenticate();
  console.log('Database connected');

  app.listen(port, () => {
    console.log(`Admin API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
