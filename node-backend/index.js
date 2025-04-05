const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const prometheus = require('prom-client');
const axios = require("axios");

// Create a new Registry
const register = new prometheus.Registry();

// Collect default metrics (e.g., memory usage, request duration)
prometheus.collectDefaultMetrics({ register });

// Create a custom metric (for example, HTTP request count)
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status_code'],
});

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("[MongoDB] Connected successfully"))
  .catch((err) => console.error("[MongoDB] Connection error:", err));

const app = express();
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON body

app.use((req, res, next) => {
  res.on('finish', () => {
    // Increment HTTP request counter
    httpRequestsTotal.inc({ method: req.method, status_code: res.statusCode });
  });
  next();
});

// Expose the metrics to Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Define Mongoose Schema for Movie Reviews
const movieReviewSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  title: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sentiment: { type: String, required: true }
}, { collection: "movie_reviews", versionKey: false });

const MovieReview = mongoose.model("MovieReview", movieReviewSchema);

// Define the API endpoint to submit a review
app.post('/submit-review', async (req, res) => {
  console.log("\n[API] Received review submission:", req.body);

  const { movieId, title, rating, comment, timestamp } = req.body;

  if (!movieId || !title || !rating || !comment) {
    console.warn("[API] Missing required fields:", { movieId, title, rating, comment });
    return res.status(400).json({ error: 'All fields (movieId, title, rating, comment) are required.' });
  }

  try {
    console.log("[API] Sending comment to Flask for sentiment analysis...");

    // Use an absolute URL by utilizing the environment variable FLASK_SERVICE_URL.
    // If the environment variable is not set, it falls back to 'http://flask-service:5000'
    const flaskServiceUrl = process.env.FLASK_SERVICE_URL ;
    const response = await axios.post(`${flaskServiceUrl}/predict`, { text: comment });

    const sentiment = response.data.sentiment || "Neutral";
    console.log("[Flask] Sentiment analysis result:", sentiment);

    // Save the review with all necessary fields
    const movieReview = new MovieReview({
      movieId,
      title,
      rating,
      comment,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      sentiment
    });

    console.log("[MongoDB] Saving review:", movieReview);
    await movieReview.save();

    console.log("[MongoDB] Review saved successfully.");
    
    res.status(200).json({ success: true, sentiment });
  } catch (error) {
    console.error("[Error] Processing review:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// // Get all reviews for a specific movie
// app.get('/reviews/:movieId', async (req, res) => {
//   const { movieId } = req.params;

//   try {
//     console.log(`Fetching reviews for movieId: ${movieId}`);

//     const reviews = await MovieReview.find({ movieId }).sort({ timestamp: -1 }); // Sort by latest first

//     if (!reviews.length) {
//       return res.status(404).json({ message: "No reviews found for this movie." });
//     }

//     res.status(200).json(reviews);
//   } catch (error) {
//     console.error('Error fetching reviews:', error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Start server
const PORT = 4000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`[Server] Node.js server running on http://localhost:${PORT}`);
});
