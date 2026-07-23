const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/auth');

const { updateSettings } = require('../controllers/settingController');
const { createPost, updatePost, deletePost, getPosts } = require('../controllers/postController');
const { createProject, updateProject, deleteProject, getProjects } = require('../controllers/projectController');
const { createExperience, updateExperience, deleteExperience, getExperiences } = require('../controllers/experienceController');
const { getMessages, markMessageAsRead, deleteMessage } = require('../controllers/messageController');

// Protect all admin routes
router.use(verifyAdminToken);

// Settings
router.put('/settings', updateSettings);

// Posts CRUD
router.get('/posts', getPosts);
router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

// Projects CRUD
router.get('/projects', getProjects);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Experiences CRUD
router.get('/experiences', getExperiences);
router.post('/experiences', createExperience);
router.put('/experiences/:id', updateExperience);
router.delete('/experiences/:id', deleteExperience);

// Inbox Messages Management
router.get('/messages', getMessages);
router.patch('/messages/:id/read', markMessageAsRead);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
