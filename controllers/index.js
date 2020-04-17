// 폴더별 라우팅 지정

const { Router } = require('express');
const router = Router()

router.use('/', require('./home'));
////router.use('/contacts', require('./contacts'));
//router.use('/accounts', require('./accounts));
router.use('/admin', require('./admin'));
//router.use('/auth', require('./auth));
//router.use('/chat', require('./chat));
//router.use('/products', require('./products'));

module.exports = router;