const authRoutes = require('./auth');
const pythonRoutes = require('./pythonScriptRunner');
const feedbackRoutes = require('./feedback');

module.exports = [
    ...authRoutes,
    ...pythonRoutes,
    ...feedbackRoutes
];
