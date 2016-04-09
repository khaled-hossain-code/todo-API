/**
 * Created by khaled on 4/3/2016.
 */
"use strict";
var express = require('express');
var bodyParser = require('body-parser'); // it is a middleware which helps to parse body of json
var _ = require('underscore');
var db = require('./db');

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
app.get('/todos', function (req, res) {
  var query = req.query;
  var where = {};

  if(query.hasOwnProperty('completed') && query.completed === 'true')
  {
    where.completed = true;
  }else if(query.hasOwnProperty('completed') && query.completed === 'false')
  {
    where.completed = false;
  }

  if(query.hasOwnProperty('q') && query.q.length > 0){
    where.description = {
      $like: '%'+ query.q + '%'
    };
  }

  db.todo.findAll({where: where}). then(function(todos){
    res.json(todos);
  }, function(e){
    res.status(500).send();
  })
});

//GET /todos/:id
app.get('/todos/:id', function (req, res) {
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
app.post('/todos', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {  //db.todo holds the model inside db.js file thats why it can create
    res.json(todo.toJSON());
  }, function (e) {
    res.status(400).json(e);
  });
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  }
  else {
    res.status(404).json({"error": "no todo found with that id"});
  }
});

app.put('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if (!matchedTodo) {
    return res.status(404).send();
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  }
  else if (body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description;
  }
  else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes); // this line will update the valid values stored in validAttribute object
  res.json(matchedTodo);
});

db.sequelize.sync().then(function () {
  app.listen(PORT, function () {
    console.log('Todo App running on PORT: ' + PORT);
  });
});



