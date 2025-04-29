// server.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3002;

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json());
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

app.post('/search', async (req, res) => {
  const { movieTitle } = req.body;
  console.log(`Searching for movie: ${movieTitle}`);

  try {
    const omdbRes = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${OMDB_API_KEY}`);
    const omdbData = await omdbRes.json();

    if (omdbData.Response !== 'True') {
      return res.json({ message: 'Movie not found in OMDB' });
    }

    const blogPost = await generateBlogPost(movieTitle);

    res.json({
      poster: omdbData.Poster,
      year: omdbData.Year,
      director: omdbData.Director,
      genres: omdbData.Genre,
      actors: omdbData.Actors,
      plot: omdbData.Plot,
      blogPost: blogPost
    });
  } catch (err) {
    console.error('Error in /search endpoint:', err);
    res.status(500).json({ message: 'An error occurred while searching', error: err.toString() });
  }
});

async function generateBlogPost(movieTitle) {
  const prompt = `Write a blog post of at least 3 detailed and engaging paragraphs about the movie "${movieTitle}". Highlight its themes, characters, direction, and cultural impact. Write in the tone of a passionate film blogger.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
      temperature: 0.8
    })
  });

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('OpenAI response was malformed');
  }

  return content;
}

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
