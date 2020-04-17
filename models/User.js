const passwordHash = require('../helpers/passwordHash');

module.exports = function(sequelize, DataTypes){
    const User = sequelize.define('User',
        {
            id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
            username : { 
                type: DataTypes.STRING,
                validate : {
                    len : [0, 50]
                },
                allowNull : false
            },
            
            password : { 
                type: DataTypes.STRING,
                validate : {
                    len : [3, 100]
                } ,
                allowNull : false
            },
            
            displayname : { type: DataTypes.STRING }

        },{
            tableName: 'User'
        }
    );

    User.associate = (models) => {
        User.hasMany(
            models.Products,
            {
                as: 'Product',
                foreignKey: 'user_id',
                sourceKey: 'id',
                onDelete: 'CASCADE'
            }
        );
    };

    // Sequelize beforeCreate Hook 선언
    // Hook이란, sequelize의 call이 수행되기 전에(이 경우에는 User를 생성하기 전에) 실행되는 함수를 말한다.
    User.beforeCreate((user, _) => {
        user.password = passwordHash(user.password);
    });

    return User;
}