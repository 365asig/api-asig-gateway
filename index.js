const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/api');
const log = require('./middlewares/log');

dotenv.config();

const app = express();

app.use(express.json());

app.use(log);

const apiRoutes = routes(process.env.LARAVEL_API_URL, process.env.API_KEY);
app.use('/', apiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Api Gateway 365Asig ://localhost:${PORT}`);
});

