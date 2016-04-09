/**
 * Created by khaled on 4/9/2016.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': 'basic-sqlite-database.sqlite'
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

//sequelize.sync({force:true}).then(function(){
//this one will be used when wants to delete all the existing database and create from scratch

//this is adding to existing database or creating if not any
sequelize.sync().then(function () {
  console.log('Everything is synced');
   Todo.findById(2).then(function(todo){
    if(todo){
      console.log(todo.toJSON());
    }else{
      console.log("item not found");
    }
   });
});

 /* Todo.create({
    description: 'Learn sqlite3',
    completed: true
  }).then(function (todo) {
    return Todo.create({
      description: 'learn orm'
    });
  }).then (function () {
    //return Todo.findById(1);   //to find a single object with its id
    return Todo.findAll({
      where: {
        //completed: false   //if need to find using boolean fields
        description: {
          $like: '%orm%'
        }
      }
    });
  }).then(function (todos) {
    if (todos) {
      todos.forEach(function (todo) {
        console.log(todo.toJSON());
      });
    } else {
      console.log('no todo found!');
    }
  }).catch(function (e) {
    console.log(e);
  });
});*/