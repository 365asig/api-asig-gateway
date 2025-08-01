const express = require('express');
const cors = require('cors');

const basicAuth = require('express-basic-auth');
const dotenv = require('dotenv');
const routes = require('./routes/api');
const log = require('./middlewares/log');
const app = express();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

app.use('/api/documentation', (req, res, next) => {
  basicAuth({
    users: { '365asig': 'X9rTq4LpV8' },
    challenge: true
  })(req, res, next);
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

dotenv.config();

if (!process.env.LARAVEL_API_URL || !process.env.API_KEY) {
  console.error('❌ Missing keys');
  process.exit(1);
}

app.use(express.json());
app.use(log);

const allowedOrigins = ['http://localhost:3002', 'https://365asig.md'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocat: Origin denied'));
    }
  }
}));


const apiRoutes = routes(process.env.LARAVEL_API_URL, process.env.API_KEY);
app.use('/', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Api Gateway Node running on port ${PORT}`);
});
