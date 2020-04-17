require('./removeByValue')();  // 모듈을 불러옴과 동시에 실행 - dynamic import

module.exports = (io) => {

    let userList = [];  // 채팅에 접속한 사용자 목록을 저장

    io.on('connection', (socket) => {  
        // passport의 req.user 데이터에 접근
        /*  {"cookie":{
                "originalMaxAge":7200000,
                "expires":"2019-09-17T14:22:03.676Z",
                "httpOnly":true,
                "path":"/"
            },
            "passport":{
                "user":{  // => socket.request.session.passport.user
                    "id":1,
                    "username":"test",
                    "displayname":"테스트유저",
                    "createdAt":"2019-09-05T12:15:53.000Z",
                    "updatedAt":"2019-09-05T12:15:53.000Z",
                    "password":""
                }
            }} */
        const session = socket.request.session.passport;
        const user = (typeof session !== 'undefined') ? ( session.user ) : "";

        // userList에 사용자명(displayname)이 없으면 사용자명을 userList에 담는다.
        // userList는 클라이언트 쪽으로 매번 쏴준다.
        if(!userList.includes(user.displayname)){
            userList.push(user.displayname);
        }
        io.emit('join', userList);

        //console.log('소켓 작동')  // 서버에 찍힘
        
        // 2. 서버에서 메세지를 수신 (client message, socket.on)
        // socket.on의 이벤트명이 socket.emit에서 사용한 이벤트명과 일치되어야 사용해야 메세지를 수신할 수 있음
        socket.on('client message', (data) => {
            //console.log(data);  
            
            // 3. 채팅에 연결된 모든 사람들에게 수신한 메세지를 뿌려주기 (server message, emit)
            // socket.emit으로 전송했던 message 변수는 data.message 로 수신
            io.emit('server message', 
                { message : data.message , displayname : user.displayname });
        });

        socket.on('disconnect', () => {  // 여기서 'disconnect'는 예약어! (ex. 컴퓨터가 종료된 경우)
            userList.removeByValue(user.displayname);
            io.emit('leave', { userList, displayname : user.displayname });
        });
    });
}