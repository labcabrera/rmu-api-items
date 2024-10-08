const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rmu-core';

const openapiFilePath = path.join(__dirname, '../openapi.yaml');
const openapiFile = fs.readFileSync(openapiFilePath, 'utf8')
const swaggerDocument = YAML.parse(openapiFile);

app.use(express.json());
app.use(cors());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to ' + MONGO_URI))
  .catch((err) => console.log('Error connecting to ' + MONGO_URI, err));

const itemRouter = require('./routes/item-controller');

app.use('/v1/items', itemRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => {
  console.log(`API started on ${PORT}`);
});