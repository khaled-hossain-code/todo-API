/**
 * Created by khaled on 4/3/2016.
 */
"use strict";
var express = require('express');
var bodyParser = require('body-parser'); // it is a middleware which helps to parse body of json
var _ = require('underscore');
var db = require('./db');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware')(db);

var app = express();
var PORT = process.env.PORT || 8080;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json()); // using the application level body parser middleware

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

//GET /todos?completed=true
//GET /todos?completed=false
//GET /todos?completed=true&q=work
//GET /todos?completed=false&q=work
app.get('/todos',middleware.requireAuthentication, function (req, res) {
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}). then(function (todos) {
    res.json(todos);
  }, function (e) {
    res.status(500).send();
  })
});

//GET /todos/:id
app.get('/todos/:id',middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId).then(function (todo) {
    if (todo) {
      res.json(todo);
    }
    else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).send();
  });
});

//POST /todos
app.post('/todos',middleware.requireAuthentication, function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {  //db.todo holds the model inside db.js file thats why it can create
    //res.json(todo.toJSON());
    req.user.addTodo(todo).then(function(){
      return todo.reload();
    }).then(function(todo){
      res.json(todo.toJSON());
    });
  }, function (e) {
    res.status(400).json(e);
  });
});

// DELETE /todos/:id
app.delete('/todos/:id',middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var where = {
    id: todoId
  };

  db.todo.destroy({
    where: where
  }).then(function (rowsDeleted) {
    if (rowsDeleted === 0) {
      res.status(404).json({
        error: 'No todo with id ' + todoId
      });
    } else {
      res.status(204).send();
    }
  }, function () {
    res.status(500).send();
  });
});


app.put('/todos/:id',middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(todoId).then(function (todo) {
    if (todo) {
      todo.update(attributes).then(function (todo) {
        res.json(todo.toJSON());
      }, function (e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function () {
    res.status(500).send();
  });
});

//POST /users       //this is user signup API
app.post('/users', function (req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function (user) {
    res.json(user.toPublicJSON());
  }, function (err) {
    res.status(400).json(err); // sent wrong data
  });
});

//POST /users/login
app.post('/users/login', function(req, res){
  var body = _.pick(req.body,'email', 'password');

  db.user.authenticate(body).then(function(user){
    var token = user.generateToken('authentication');

    if(token){
      res.header('Auth',token).json(user.toPublicJSON()); // here token type authentication, Auth is the header key,
    }else{
      res.status(401).send();
    }

  }, function(){
    res.status(401).send();
  });
});

db.sequelize.sync(
    {force:true}
).then(function () {
  app.listen(PORT, function () {
    console.log('Todo App running on PORT: ' + PORT);
  });
});



