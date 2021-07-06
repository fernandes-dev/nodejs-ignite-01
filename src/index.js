const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existsUser = users.find((u) => u.username === username);

  if (!existsUser)
    return response.status(404).json({
      error: "User not found!",
    });

  request.user = existsUser;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (!name || !username)
    return response.status(400).json({ error: "Bad request" });

  const existsUserName = users.find((u) => u.username === username);

  if (existsUserName)
    return response.status(400).json({
      error: "Username already exists!",
    });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const [todos] = users
    .filter((u) => u.username === request.user.username)
    .map((userData) => userData.todos);

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  if (!title || !deadline)
    return response.status(400).json({ error: "Bad request" });

  const userIndex = users.findIndex(
    (u) => u.username === request.user.username
  );

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users[userIndex].todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;

  const { title, deadline } = request.body;

  const userIndex = users.findIndex(
    (u) => u.username === request.user.username
  );

  const todoIndex = users[userIndex].todos.findIndex((t) => t.id === todoId);

  if (todoIndex === -1)
    return response.status(404).json({
      error: "Todo not found!",
    });

  const existentTodo = users[userIndex].todos[todoIndex];

  const newTodo = {
    id: existentTodo.id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: existentTodo.created_at,
  };

  users[userIndex].todos[todoIndex] = newTodo;

  return response.json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;

  const userIndex = users.findIndex(
    (u) => u.username === request.user.username
  );

  const todoIndex = users[userIndex].todos.findIndex((t) => t.id === todoId);

  if (todoIndex === -1)
    return response.status(404).json({
      error: "Todo not found!",
    });

  const findedTodo = users[userIndex].todos[todoIndex];

  findedTodo.done = true;
  users[userIndex].todos[todoIndex] = findedTodo;

  return response.json(findedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;

  const userIndex = users.findIndex(
    (u) => u.username === request.user.username
  );

  const todoIndex = users[userIndex].todos.findIndex((t) => t.id === todoId);

  if (todoIndex === -1)
    return response.status(404).json({
      error: "Todo not found!",
    });

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
