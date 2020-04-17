const moment = require('moment');

module.exports = function(sequelize, DataTypes){
    var Products = sequelize.define('Products',
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            name : { type: DataTypes.STRING },
            thumbnail : { type: DataTypes.STRING },
            price : { type: DataTypes.INTEGER },
            description : { type: DataTypes.TEXT }
        }
    );

    // 제품 모델 관계도
    Products.associate = (models) => {
        // 메모 모델에 외래키 걸기
        // MySQL workbench에서 확인해 보면, ProductMemo에 product_id column이 추가됨
        Products.hasMany(models.ProductsMemo, {as: 'Memo', foreignKey: 'product_id', sourceKey: 'id', onDelete: 'CASCADE'});
        // Products에서도 User에 접근하기 위해 설정 (외부키는  User->Products 로 걸었었다)
        Products.belongsTo(models.User, { as : 'Owner', foreignKey: 'user_id', targetKey: 'id' });
    };

    /* 
    function (date) {
    return moment(date).format(‘YYYY-MM-DD’)
    };
    와 동일 */
    // prototype 확장을 이용해 dateFormat이라는 메소드를 생성
    Products.prototype.dateFormat = (date) => (
        moment(date).format('YYYY년 MM월 DD일')
        //moment(date).format('YYYY-MM-DD')
    );

    return Products;
}