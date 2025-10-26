const express = require("express");
const cors = require("cors");
const { scrapePropertyData } = require("./scraper.js");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Scraper API is running. Use /scrape?url=<page_url>");
});

app.get("/scrape", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing required query param: url" });
  }

  try {
    console.log(`Scraping: ${url}`);
    const data = await scrapePropertyData(url);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
