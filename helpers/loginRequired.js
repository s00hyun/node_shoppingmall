module.exports = function(req, res, next) {
    if (!req.isAuthenticated()){
        res.redirect('/accounts/login'); // 로그인이 되어있으면, 해당 주소로 이동
    }else{
        return next();  // 로그인이 되어있지 않으면, 다음으로 제어권을 넘김
    }
};