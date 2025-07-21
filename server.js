const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Load API key and secret from environment variables
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Health check route for Render to verify the app is alive
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Proxy endpoint for 3Commas API requests
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
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
