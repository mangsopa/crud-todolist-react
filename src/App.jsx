import React, { useEffect, useState } from 'react';
import supabase from './services/supabase-client';
import './App.css';

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("Catatan").select("*");
    if (error) {
      console.error("Error fetching:", error);
    } else {
      setTodoList(data);
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) {
      setError("Todo cannot be empty.");
      return;
    }

    setError("");
    setLoading(true);
    const newTodoData = {
      name: newTodo,
      isCompleted: false,
    };

    const { data, error } = await supabase.from("Catatan").insert([newTodoData]).single();
    setLoading(false);

    if (error) {
      setError('Error adding todo.');
      console.error(error);
    } else {
      setTodoList((prev) => [...prev, data]);
      setNewTodo("");
    }
  };

  const completeTask = async (id, isCompleted) => {
    const { data, error } = await supabase.from("Catatan").update({ isCompleted: !isCompleted }).eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      const updatedTodoList = todoList.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo);
      setTodoList(updatedTodoList);
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("Catatan").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      const updatedTodoList = todoList.filter((todo) => todo.id !== id);
      setTodoList(updatedTodoList);
    }
  }

  return (
    <div>
      <h1>Todo List</h1>
      <div>
        <input
          type="text"
          value={newTodo}
          placeholder="New Todo..."
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo} disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {todoList.map((todo) => (
          <li key={todo.id}>
            <p>{todo.name}</p>
            <button onClick={() => completeTask(todo.id, todo.isCompleted)}> {todo.isCompleted ? "Undo" : "Completed"} </button>
            <button onClick={() => deleteTask(todo.id)}> Delete Task </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
