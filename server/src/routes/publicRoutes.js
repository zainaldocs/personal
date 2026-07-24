const express = require('express');
const router = express.Router();

const { getSettings } = require('../controllers/settingController');
const { getPublicPosts, getPublicPostBySlug } = require('../controllers/postController');
const { getProjects } = require('../controllers/projectController');
const { getExperiences } = require('../controllers/experienceController');
const { createMessage } = require('../controllers/messageController');
const { contactLimiter } = require('../middleware/rateLimiter');

// Public Data Endpoints
router.get('/settings', getSettings);
router.get('/posts', getPublicPosts);
router.get('/posts/:slug', getPublicPostBySlug);
router.get('/projects', getProjects);
router.get('/experiences', getExperiences);
router.post('/contact', contactLimiter, createMessage);

module.exports = router;
