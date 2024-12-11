const authRoutes = require('./auth');
const pythonRoutes = require('./pythonScriptRunner');
const feedbackRoutes = require('./feedback');
const getData = require('./getData');


module.exports = [
    ...authRoutes,
    ...pythonRoutes,
    ...feedbackRoutes,
    ...getData
];
