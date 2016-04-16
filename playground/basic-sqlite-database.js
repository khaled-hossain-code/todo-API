/**
 * Created by khaled on 4/9/2016.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/basic-sqlite-database.sqlite'
});

//defining the model
var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

var User = sequelize.define('user',{
  email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

//this is adding to existing database or creating if not any
sequelize.sync(
//    {force:true}
).then(function () {
  console.log('Everything is synced');

  User.findById(1).then(function(user){
    user.getTodos({
      where: {completed: false}
    }).then(function(todos){
      todos.forEach(function(todos){
        console.log(todos.toJSON())
      });
    });
  });
  /*User.create({
    email:'khaled@idd.com'
  }).then(function(){
    return Todo.create({
      description: 'API design'
    });
  }).then(function(todo){
    User.findById(1).then(function(user){
      user.addTodo(todo);
    });
  });*/

});
