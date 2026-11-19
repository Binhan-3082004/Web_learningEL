// Bảng định tuyến: đường dẫn nào được chuyển tới microservice nào
const express = require('express');
const config = require('../config');
const createServiceProxy = require('../utils/createServiceProxy');

const router = express.Router();

router.use(createServiceProxy(config.identityServiceUrl, ['/api/auth', '/api/users']));
router.use(createServiceProxy(config.learningServiceUrl, '/api/learning'));

module.exports = router;
