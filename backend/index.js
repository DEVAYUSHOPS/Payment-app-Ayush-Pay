const express = require("express");
const cors = require('cors');
const mainRouter = require("./routes/index");

const app = express();

// Enable CORS for all origins and allow methods (GET, POST, OPTIONS, etc.)
app.use(cors({
  origin: '*',  // Allow all origins (or specify a specific origin like 'http://localhost:3001')
  methods: ['GET', 'POST', 'OPTIONS'],  // Add any other methods you need
  allowedHeaders: ['Content-Type', 'Authorization'],  // Specify headers as required
}));

app.use(express.json());
app.use("/api/v1", mainRouter);

app.listen(3000, () => {
    console.log("running... on PORT 3000");
});
