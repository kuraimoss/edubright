const authRoutes = require('./auth');
const pythonRoutes = require('./pythonScriptRunner');

module.exports = [
    ...authRoutes,
    ...pythonRoutes
];
