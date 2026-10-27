
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 5000;

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(MONGO_URI);

// Middleware must come AFTER app is created
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('CivicSnap India backend is running!');
});

// Save a civic complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const { title, category, city, description } = req.body;

    if (!title || !category || !city || !description) {
      return res.status(400).json({
        message: 'Please provide title, category, city, and description.'
      });
    }

    const database = client.db('civicsnap');
    const complaints = database.collection('complaints');

    const newComplaint = {
      title,
      category,
      city,
      description,
      status: 'Reported',
      createdAt: new Date()
    };

    const result = await complaints.insertOne(newComplaint);

    res.status(201).json({
      message: 'Complaint saved successfully!',
      complaintId: result.insertedId
    });
  } catch (error) {
    console.error('Error saving complaint:', error.message);
    res.status(500).json({
      message: 'Could not save complaint.'
    });
  }
});

// Connect to MongoDB and start the server
async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
  }
}

startServer();
