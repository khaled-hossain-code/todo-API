/**
 * Created by khaled on 4/10/2016.
 */
var _ = require('underscore');
var bcrypt = require('bcryptjs');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');


module.exports = function(sequelize, DataTypes){
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:{
        isEmail: true
      }
    },
    salt:{
      type: DataTypes.STRING
    },
    password_hash:{
      type:DataTypes.STRING
    },
    password:{
      type:DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function(value){
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  },{
    hooks:{
      beforeValidate: function(user,options){
        if( typeof user.email === 'string')
        {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods:{
      authenticate: function(body){
        return new Promise(function(resolve, reject){
          if (typeof body.email !== 'string' || typeof body.password !== 'string') {
            return reject(); //bad request
          }

          user.findOne({
            where: {
              email: body.email
            }
          }).then(function (user) {
            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
              return reject(); //authentication is possible but failed due to wrong email
            }
            resolve(user);
          }, function (err) {
            reject();
          });
        })
      }
    },
    instanceMethods: {
      toPublicJSON: function(){
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt','updatedAt');
      },
      generateToken: function(type){
        if(!_.isString(type)){
          return undefined;
        }

        try{
          var stringData = JSON.stringify({id: this.get('id'), type:type});
          var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString(); // here 'abc123!@#' is crypto password

          var token = jwt.sign({
            token: encryptedData
          }, 'qwert987');  // here 'qwert987' is token password

          return token;
        }catch(err){
          console.error(err);
          return undefined;
        }
      }
    }
  });
  return user;
};