import express from "express";
import methodOverride from "method-override";
import pg from "pg";
import env from "dotenv";

env.config();

const port = 3000;
const app = express();
const db = new pg.Client({
    user: process.env.PG_USER, 
    host: process.env.PG_HOST, 
    database: process.env.PG_DATABASE, 
    password: process.env.PG_PASSWORD, 
    port: process.env.PG_PORT
});

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

db.connect();

app.get("/", async (req, res) => {
    const todos = await getTodos();
    const data = {
        "todos": todos
    };
    res.render("index.ejs", data);
});

app.post("/todo", (req, res) => {
    const todo_desc = req.body.todo_description;
    const isAdded = addTodo(todo_desc);
    if (isAdded) {
        res.redirect("/");
    } else {
        console.log("Error adding todo. Check helper function.");
    }
});

app.put("/todo/:todo_id", (req, res) => {
    const todoId = req.params.todo_id;
    const todo_desc = req.body.update_todo;
    const todo = [todoId, todo_desc];
    const isUpdated = updateTodo(todo);
    if (isUpdated) {
        res.redirect("/");
    } else {
        console.log("Error updating todo. Check helper function.");
    }
});

app.delete("/todo/:todo_id", (req, res) => {
    const isDeleted = deleteTodo(req.params.todo_id);
    if (isDeleted) {
        res.redirect("/");
    } else {
        console.log("Error deleting todo. Check helper function.");
    }
});

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Server running on port ${port}`);
});

async function getTodos() {
    try {
        let todos = await db.query("SELECT * FROM todo ORDER BY 1");
        console.log(todos.rowCount, "todos fetched.");
        return todos.rows;
    } catch (exc) {
        console.log("Error fetching todos from database.");
    }
}

async function deleteTodo(todoId) {
    try {
        await db.query("DELETE FROM todo WHERE todo_id = $1", [todoId]);
        console.log("Todo with id", todoId, "deleted.");
        return true;
    } catch (exc) {
        console.log("Error deleting todo with id", todoId, ".");
    }
}

async function updateTodo(todo) {
    try {
        await db.query("UPDATE todo set todo_description = $2 where todo_id = $1", todo);
        console.log("Todo with id", todo[0], "updated.");
        return true;
    } catch (exc) {
        console.log("Error updating todo with id", todo[0], ".");
    }
}

async function addTodo(todo_desc) {
    try {
        await db.query("INSERT INTO todo (todo_description) VALUES ($1)", [todo_desc]);
        console.log("Todo with description:", todo_desc, "added.");
        return true;
    } catch (exc) {
        console.log("Error adding todo to database.");
    }
} 