const models = require('../../models');
const paginate = require('express-paginate');

exports.get_products = async (req, res) => {
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
                /*order : [
                    ["createdAt", "desc"]
                ]*/
            }),
            
            /* totalCount */
            models.Products.count()  // Products의 총 갯수 계산
        ]);

        const pageCount = Math.ceil( totalCount / req.query.limit );  // 총 게시물 수
        const pages = paginate.getArrayPages(req)( 4, pageCount, req.query.page );  // 3까지 표시됨
        res.render('admin/products.html' , { products , pages, pageCount });

    }catch(e){
        // 에러 핸들링
        console.log(e);
    }
}

exports.get_write = (req, res) => {
    res.render('admin/form.html', { csrfToken : req.csrfToken() });
}

exports.post_write = async (req, res) => {
    try {
        req.body.thumbnail = (req.file) ? req.file.filename : "";
        // 유저를 가져온 다음에 저장
        const user = await models.User.findByPk(req.user.id);
        await user.createProduct(req.body)
        res.redirect('/admin/products');
    }catch(e){
        console.log(e);
    }
};