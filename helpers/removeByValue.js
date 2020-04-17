// 채팅방을 나간 유저를 'User' column에서 삭제하기 위한 함수

module.exports = function(){
    Array.prototype.removeByValue = function (search) {
        var index = this.indexOf(search);  // 인덱스 번호 찾기 (search가 해당 array의 원소가 아니면 -1이 리턴됨)
        if (index !== -1) {  // search가 해당 array 내에 존재할 경우 
            this.splice(index, 1);  // 찾은 인덱스에서 한 개의 요소를 제거 (search 원소를 제거)
        }
    };
};

