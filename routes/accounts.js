const express = require('express');
const router = express.Router();
const models = require('../models');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passwordHash = require('../helpers/passwordHash');

// 첫 로그인 때 실행됨
passport.serializeUser( (user, done) => {
    console.log('serializeUser');
    done(null, user);  // 콜백함수를 실행하라
});

// 매 페이지마다 실행됨
passport.deserializeUser( (user, done) => {
    const result = user;
    result.password = "";
    console.log('deserializeUser');
    done(null, user);
})

passport.use(new LocalStrategy({
        usernameField : 'username',  // login.html에서 사용한 필드의 name
        passwordField : 'password',
        passReqToCallback : true
    },
    async ( req, username, password, done ) => {
        const user = await models.User.findOne({
            where: {
                username,
                password : passwordHash(password),
            },
            attributes: { exclude: ['password'] }
        });

        // 유저에서 조회되지 않을 시
        if(!user){
            return done(null, false, { message: '일치하는 아이디 패스워드가 존재하지 않습니다.' });
        // 유저에서 조회되면 세션 등록 쪽으로 데이터를 넘긴다.
        }else{
            return done(null, user.dataValues);
        }
    }
));

async function checkUsername(req, res, next) {
    console.log('미들웨어 작동');

    const userExists = await models.User.findOne({
        where: {
            username: req.body.username
        }
    });
    //console.log("user found is: ", userExists);

    if (userExists){
        req.flash('userExistsMessage', '이미 존재하는 아이디입니다.');
        console.log('아이디 중복됨');
        res.redirect('/accounts/join');
    }
    else{
        next();  // 로그인
    }
};

router.get('/', ( _ , res) => {
    res.send('account app');
});

router.get('/join', (req , res) => {
    res.render('accounts/join.html', { userExistsMessage : req.flash('userExistsMessage') });
});

router.post('/join', checkUsername, async(req, res) => {
    try{
        await models.User.create(req.body);
        res.send('<script>alert("회원가입 성공"); \
        location.href="/accounts/login";</script>');
    }catch(e){

    }
});

router.get('/login', ( req , res) => {
    res.render('accounts/login.html', { flashMessage : req.flash().error });
});

router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/accounts/login',
        failureFlash: true
    }),
    ( _ , res ) => {
        res.send('<script>alert("로그인 성공");\
        location.href="/";</script>');
    }
);

router.get('/success', (req, res) => {
    res.send(req.user);
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/accounts/login');
});

module.exports = router;