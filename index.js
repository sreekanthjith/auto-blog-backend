const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose model
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Blog post generator
const generatePost = async () => {
  try {
    const title = `Auto Blog Post - ${new Date().toDateString()}`;
    const content = `This is a generated blog post for ${new Date().toDateString()}.`;

    const post = new Post({ title, content });
    await post.save();
    console.log('✅ Blog post saved!');
  } catch (err) {
    console.error('❌ Error generating post:', err);
  }
};

// Auto-post daily at 9 AM
cron.schedule('0 9 * * *', generatePost);

// Routes
app.get('/generate', async (req, res) => {
  await generatePost();
  res.send('Post generated!');
});

app.get('/posts', async (req, res) => {
  const posts = await Post.find().sort({ date: -1 });
  res.json(posts);
});

app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
