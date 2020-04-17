const moment = require('moment');

module.exports = function(sequelize, DataTypes){
    var Contacts = sequelize.define('Contacts', 
        {
            id : { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            name : { type: DataTypes.STRING },
            email : { type: DataTypes.STRING },
            phone : { type: DataTypes.STRING },
            description : { type: DataTypes.TEXT },
        }
    );

    Contacts.associate = (models) => {
        Contacts.hasMany(models.ContactsMemo, {as: 'Memo', foreignKey: 'contact_id', sourceKey: 'id', onDelete: 'CASCADE'});
    };

    // 뷰에서 사용할 dateFormat 메소드를 추가
    Contacts.prototype.dateFormat = (date) => (
        moment(date).format('YYYY-MM-DD')
    );

    return Contacts;
}