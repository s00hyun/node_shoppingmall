const express = require('express');
const router = express.Router();
const models = require('../models');

router.get('/', async ( _ , res) => {
    const products = await models.Products.findAll({
        include : [
            {
                model : models.User ,  
                // Products에도 as가 'Owner'로 걸려있다면 (Products.belongsTo 이용), 
                // products.Owner 로 작성자명을 가져올 수 있다.
                as : 'Owner',  
                attributes : [ 'username' , 'displayname' ]
            },
        ]
    });
    res.render('home.html', { products });
});

module.exports = router;