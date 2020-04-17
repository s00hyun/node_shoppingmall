const express = require('express');
const nunjucks = require('nunjucks');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const flash = require('connect-flash');

const passport = require('passport');
const session = require('express-session');

// db 관련
const db = require('./models');


class App {
    constructor() {
        this.app = express();

        // db 접속
        this.dbConnection();

        // 뷰엔진 셋팅
        this.setViewEngine();

        // 세션 셋팅
        this.setSession();

        // 미들웨어 셋팅
        this.setMiddleWare();

        // 정적 디렉토리 추가
        this.setStatic();

        // 로컬 변수
        this.setLocals();

        // 라우팅
        this.getRouting();
    }

    dbConnection(){
        // DB authentication
        db.sequelize.authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
            //return db.sequelize.sync();
            //return db.sequelize.drop();
        })
        .then(() => {
            console.log('DB Sync complete.');
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
    }

    setMiddleWare(){
        /* 미들웨어 셋팅 */
        // 라우팅 전에 셋팅되어야 함
        // request의 body 변수를 받아와서 사용
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());

        //passport 적용
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        //플래시 메시지 관련
        this.app.use(flash());
    }

    setViewEngine(){
        // 템플릿이 'template'에 있다고 경로를 알려주기 (path defaults to the current working directory)
        // escape란, 특정 문자를 HTML로 변환하는 것을 말한다. (&lt -> <)
        nunjucks.configure('template', {
            autoescape: true,  // controls if output with dangerous characters are escaped automatically
            express: app
        });
    }

    setSession(){
        const SequelizeStore = require('connect-session-sequelize')(session.Store);

        //session 관련 셋팅
        this.app.sessionMiddleWare = session({
            secret: 'campus',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 2000 * 60 * 60 // 지속시간 2시간
            },
            // 세션을 sequelize에 저장
            store: new SequelizeStore({
                db: db.sequelize
            }),
        });
        this.app.use(this.app.sessionMiddleWare);
    }

    setStatic(){
        // 업로드 path 추가 (ex. localhost:3000/uploads/1.jpg)
        app.use('/uploads', express.static('uploads'));
    }

    setLocals(){
        //로그인 정보 뷰에서만 변수로 셋팅, 전체 미들웨어는 router위에 두어야 에러가 안난다
        this.app.use( (req, _, next) => {
            // 템플릿에서 isLogin이라는 변수를 사용할 수 있다. 
            // 이제 이 변수를 이용하여 모든 페이지에서 현재 로그인된 상태인지 / 로그아웃된 상태인지를 체크할 수 있다.
            this.app.locals.isLogin = req.isAuthenticated();  // passport에서 제공되는 함수로, 로그인이 되어있는지 체크한다.
            this.app.locals.req_path = req.path;
            //app.locals.urlparameter = req.url; //현재 url 정보를 보내고 싶으면 이와같이 셋팅
            //app.locals.userData = req.user; //사용 정보를 보내고 싶으면 이와같이 셋팅
            next();
        });
    }

    getRouting(){
        this.app.use(require('./controllers'))
    }
}

module.exports = new App().app;