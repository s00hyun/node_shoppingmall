const express = require('express');
const router = express.Router();
const models = require('../models');
const loginRequired = require('../helpers/loginRequired');
const paginate = require('express-paginate');

// csrf 셋팅
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// 이미지 저장 위치 설정
const path = require('path');
// /Users/shchoi/Desktop/camp14/routes + ../uploads = /Users/shchoi/Desktop/camp14/uploads
const uploadDir = path.join( __dirname , '../uploads');
const fs = require('fs');

// multer 셋팅
var multer = require('multer');
var storage = multer.diskStorage({
    destination : (req, file, callback) => {  // 이미지가 저장되는 도착지 지정
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {  // products-날짜.jpg(png)
        callback(null, 'products-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});
const upload = multer({ storage: storage });

router.get('/', function(req, res){
    res.send('admin url 입니다.');
});


// 한 페이지당 보여질 게시물의 수 : 3
// 한 페이지당 보여질 최대 게시물 수 : 50
router.get('/products', paginate.middleware(3, 50), async(req, res) => {
    try{
        const [ products, totalCount ] = await Promise.all([  // products, totalCount 값을 동시에 받음
            
            /* products */
            models.Products.findAll({
                include : [
                    {
                        model : models.User,
                        as : 'Owner',
                        attributes : ['username', 'displayname']
                    },
                ],
                limit : req.query.limit,  // 한 페이지당 보여질 게시물의 수 (3)
                offset : req.offset,  // 페이지 시작지점
                order : [
                    ["createdAt", "desc"]
                ]
            }),
            
            /* totalCount */
            models.Products.count()  // Products의 총 갯수 계산
        ]);

        const pageCount = Math.ceil( totalCount / req.query.limit );  // 총 게시물 수
        const pages = paginate.getArrayPages(req)( 4, pageCount, req.query.page );  // 3까지 표시됨
        res.render('admin/products.html' , { products , pages, pageCount });

    }catch(e){
        // 에러 핸들링
    }
});

router.get('/products/write', loginRequired, csrfProtection, (req, res) => {
    res.render('admin/form.html', { csrfToken : req.csrfToken() });
});

//upload.single(input name)
router.post('/products/write', loginRequired, upload.single('thumbnail'), csrfProtection, async (req, res) => {
    console.log(req.file);
    try{
        req.body.thumbnail = (req.file) ? req.file.filename : "";
        //'models/index.js'에서 Products를 가져올 수 있도록 하였음
        //await models.Products.create(req.body);
        const user = await models.User.findByPk(req.user.id);
        await user.createProduct(req.body);

        res.redirect('/admin/products');
    }catch(e){

    }
    
    // 동일한 코드
    /*models.Products.create({
        // key값 : field값
        name : req.body.name,
        price : req.body.price,
        description : req.body.description
    }).then( () => {
        res.redirect('/admin/products');
    });*/
});

router.get('/products/detail/:id', async(req, res) => {
    //const product = await models.Products.findByPk(req.params.id);
    const product = await models.Products.findOne({
        where : {
            id : req.params.id
        },
        include : [
            'Memo'
        ]
    });
    res.render('admin/detail.html', { product });
    // key값과 value값이 똑같다면 product: product 대신 product만 써도 알아서 처리해 준다 (JS문법)
});

router.get('/products/edit/:id', loginRequired, async(req, res) => {
    const product = await models.Products.findByPk(req.params.id)        
    res.render('admin/form.html', { product });
});

router.post('/products/edit/:id', loginRequired, upload.single('thumbnail'), async(req, res) => {
    try{
        // 이전에 저장되어있는 파일명을 받아온다.
        const product = await models.Products.findByPk(req.params.id);

        if(req.file && product.thumbnail) {
            fs.unlinkSync( uploadDir + '/' + product.thumbnail );
        }

        // 파일 요청이면 파일명을 담고, 아니면 이전 DB에서 가져온다.
        req.body.thumbnail = (req.file) ? req.file.filename : product.thumbnail;

        await models.Products.update( req.body ,
            {
                where : { id : req.params.id }
            }
        );
        res.redirect('/admin/products/detail/' + req.params.id );
    }catch(e){

    }
});

router.get('/products/delete/:id', async(req, res) => {
    await models.Products.destroy({
        where: {
            id: req.params.id
        }
    });
    res.redirect('/admin/products');
});

router.post('/products/detail/:id', async(req, res) => {
    try {
        const product = await models.Products.findByPk(req.params.id);
        // create + as에 적은 내용 ( Products.js association 에서 적은 내용 )
        await product.createMemo(req.body)
        
        res.redirect('/admin/products/detail/' + req.params.id);
    }catch(e) {
        console.log(e)
    }
});

router.get('/products/delete/:product_id/:memo_id', async(req, res) => {
    try {
        await models.ProductsMemo.destroy({
            where: {
                id: req.params.memo_id
            }
        });
        res.redirect('/admin/products/detail/' + req.params.product_id);
    }catch(e) {

    }
});

router.post('/products/ajax_summernote', loginRequired, upload.single('thumbnail'), (req, res) => {
    res.send( '/uploads/' + req.file.filename);
});

module.exports = router;