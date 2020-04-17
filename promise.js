// 0.5초 기다렸다가 특정 작업을 실행
var p1 = new Promise(
    (resolve, reject) => {
        console.log("프라미스 함수제작");
        setTimeout(
            () => {
                // 여기까지 기다려달라! (0.5초)
                // 그 다음 then을 실행
                resolve({ p1 : "^_^" });
                //resolve(console.log("프라미스 실행"))
            }, 500);
    }
);

var p2 = new Promise(
    (resolve, reject) => {
        console.log("프라미스 함수제작");
        setTimeout(
            () => {
                // 여기까지 기다려달라! (0.3초)
                // 그 다음 then을 실행
                resolve({ p2 : "-_-" });
                //resolve(console.log("프라미스 실행"))
            }, 300);
    }
);

/*
p1.then( result => {
    console.log("p1 = " + result.p1);
    //console.log("프라미스 이행")
    return p2;
}).then( result => {
    console.log("p2 = " + result.p2);
})
*/

// 실행 순서를 보장하지는 않음
// 한꺼번에 result로 받고 싶을 때 사용
Promise.all([p1, p2]).then( (result) => {
    console.log(result);
    console.log("p1 = " + result[0].p1);
    console.log("p2 = " + result[1].p2);
});