const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// POST proxy for custom API requests
app.post('/3commas', async (req, res) => {
  const { path, body } = req.body;
  const payload = JSON.stringify(body);
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
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

// NEW GET /deals route for Google Apps Script
app.get('/deals', async (req, res) => {
  const baseUrl = 'https://api.3commas.io/public/api/ver1/deals';
  const query = 'offset=0&limit=50&scope=finished';
  const url = `${baseUrl}?${query}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'APIKEY': API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
