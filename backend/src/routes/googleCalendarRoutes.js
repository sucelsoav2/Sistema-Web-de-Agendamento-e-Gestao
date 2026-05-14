const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require('express-jwt');
const googleCalendarController = require('../controllers/googleCalendarController');

const verificarToken = jwt({
    secret: process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
    algorithms: ['HS256'],
    requestProperty: 'auth'
});

router.get('/auth-url', verificarToken, googleCalendarController.authUrl);
router.get('/callback', googleCalendarController.callback);
router.get('/status', verificarToken, googleCalendarController.status);
router.delete('/disconnect', verificarToken, googleCalendarController.disconnect);

module.exports = router;
