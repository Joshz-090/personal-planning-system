const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');
const verifyAdmin = require('../middleware/auth');

// GET all published blogs (Public)
router.get('/', async (req, res) => {
  try {
    const blogsSnapshot = await db.collection('blogs')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
      
    const blogs = [];
    blogsSnapshot.forEach(doc => {
      blogs.push({ id: doc.id, ...doc.data() });
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE Blog (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  const { title, content, imageUrl, videoUrl, videoType } = req.body;
  try {
    const blogData = {
      title,
      content,
      imageUrl,
      videoUrl,
      videoType,
      status: 'published',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('blogs').add(blogData);
    res.status(201).json({ id: docRef.id, ...blogData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Blog (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('blogs').doc(req.params.id).delete();
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
