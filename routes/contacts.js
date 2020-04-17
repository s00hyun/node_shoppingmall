var express = require('express');
var router = express.Router();
const models = require('../models');

/*
URL
/contacts  글리스트
/contacts/write 글작성
/contacts/detail/:id  상세글보기
/contacts/edit/:id 글수정하기
/contacts/delete/:id 글삭제하기
*/

// 글 리스트
router.get('/', async (_, res) => {// async 함수는 promise를 리턴
    try{
        // .then 부분

        // await: promise 객체를 받아 결과를 리턴할 때까지 기다렸다가 실행
        // 모든 Contacts를 찾을 때까지 기다린 후 템플릿에 변수를 넘겨준다
        const contacts = await models.Contacts.findAll();
        // DB에서 contacts를 받아와 contacts 변수명으로 내보냄
        res.render( 'contacts/list.html', { contacts });
    }catch(e){

    }
});

router.get('/write', (req,res) => {
    res.render('contacts/form.html');
});

router.post('/write', async (req,res) => {
    try{
        await models.Contacts.create(req.body);
        res.redirect('/contacts');
    }catch(e){

    }
});

router.get('/detail/:id', async (req, res) => {
    try{
        const contact = await models.Contacts.findByPk(req.params.id);
        res.render('contacts/detail.html', { contact });
    }catch(e){

    }
});

router.get('/edit/:id', async (req, res) => {
    try{
        const contact = await models.Contacts.findByPk(req.params.id)
        res.render('contacts/form.html', { contact });
    }catch(e){

    }
});

router.post('/edit/:id', async (req, res) => {
    try{
        await models.Contacts.update(
            req.body ,
            {
                where : { id : req.params.id }
            }
        );
        res.redirect('/contacts/detail/' + req.params.id);
    }catch(e){

    }
});

router.get('/delete/:id', async (req, res) => {
    try{
        await models.Contacts.destroy({
            where : {
                id : req.params.id
            }
        });
        res.redirect('/contacts');
    }catch(e){

    }
});

router.post('/detail/:id', async (req, res) => {
    try{
        const contact = await models.Contacts.findByPk(req.params.id);
        await contact.createMemo(req.body);
        res.redirect('/contacts/detail/' + req.params.id);
    }catch(e){
        console.log(e);
    }

});

module.exports = router;