const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Health check endpoint — required by Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Environment variables (API keys)
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

app.post('/3commas', async (req, res) => {
  const { path, body } = req.body;

  const payload = JSON.stringify(body || {});
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(payload)
    .digest('hex');

  try {
    const response = await axios.post(`https://api.3commas.io${path}`, payload, {
      headers: {
        'APIKEY': API_KEY,
        'Signature': signature,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Use the correct port required by Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy server is running on port ${PORT}`);
});
