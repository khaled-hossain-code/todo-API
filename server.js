/**
 * Created by khaled on 4/3/2016.
 */
"use strict";
var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;
var todos = [
  {
  id: 1,
  description: 'Meet for meeting',
  completed: false
  },
  {
    id: 2,
    description: 'Re-shedule',
    completed: false
  },
  {
    id: 3,
    description: 'Re-budgeting',
    completed: true
  }
];

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function(req,res){
   res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo;

  todos.forEach(function(todo){

    if(todoId === todo.id) {
      matchedTodo = todo;
    }
  });

  if(matchedTodo){
    res.json(matchedTodo);
  }
  else{
    res.status(404).send();
  }

  //res.status(404).send();

});


app.listen(PORT, function () {
  console.log('Todo App running on PORT: ' + PORT);
});

