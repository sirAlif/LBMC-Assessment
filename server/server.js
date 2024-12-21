const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Connect Database
// connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api', require('./routes/api/index'));
app.use('/api/history', require('./routes/api/history'));
app.use('/api/config', require('./routes/api/config'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/tokens', require('./routes/api/tokens'));
app.use('/api/token-pairs', require('./routes/api/tokenPairs'));

// New API route - Ali Farhadi
app.get('/api/AliFarhadiapitest/:address', async (req, res) => {
  const { address } = req.params;
  const apiKey = process.env.ETHERSCAN_API_KEY || "A1TWHBXMKWJ836QBTCFAU1HR94PE7NHGWN";

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  try {
    // Fetch details about the given smart contract from Etherscan API
    const response = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: address,
        apikey: apiKey,
      },
    });

    // Handle errors specific to the Etherscan API
    if (response.data.status === '0') {
      const result = response.data.result;

      if (typeof result === 'string' && result.includes('Invalid API Key')) {
        console.error('Etherscan API Key is invalid');
        return res.status(500).json({ error: 'Internal Server Error: Invalid API Key' });
      }

      return res.status(404).json({ error: 'Smart contract not found' });
    }

    // Send the fetched data as response
    return res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 2001;

// check_cookie();
// const func = async () => {
  //   const response = await axios("https://api.coinmarketcap.com/v1/ticker/?limit=0");
  //   console.log(response.data);
  // }

  // func();

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));