const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Health check endpoint
app.get('/healthz', (req, res) => res.send('OK'));

// ✅ Handle GET requests from Apps Script
app.get('/3commas', async (req, res) => {
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: "Missing path parameter" });

  const fullUrl = `https://api.3commas.io${path}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update('').digest('hex');

  try {
    const response = await axios.get(fullUrl, {
      headers: {
        'APIKEY': API_KEY,
        'Signature': signature
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
