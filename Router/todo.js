const express = require("express");
const Todo = require("../model/Todo");

const router = express.Router();

router.post("/todos", async (req, res) => {
  try {
    const { title, description } = req.body;

    const newTodo = new Todo({
      title,description
    });

    const savedTodo = await newTodo.save();

    res.status(200).json(savedTodo);
  } catch (error) {
    console.error("Error creating new Todo:", error);
    res.status(500).json({ message: "Error creating new Todo" });
  }
});

router.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { isCompleted, title } = req.body;
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { isCompleted, title},
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error("Error updating Todo:", error);
    res.status(500).json({ message: "Error updating Todo" });
  }
});

router.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error("Error retrieving Todos:", error);
    res.status(500).json({ error });
  }
});

router.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedTodo = await Todo.findByIdAndDelete(id);
  
      if (!deletedTodo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
  
      res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
      console.error('Error deleting Todo:', error);
      res.status(500).json({ message: 'Error deleting Todo' });
    }
  });


  router.delete('/todos', async (req, res) => {
    try {
      const result = await Todo.deleteMany();
  
      res.json({ message: `${result.deletedCount} Todos deleted successfully` });
    } catch (error) {
      console.error('Error deleting Todos:', error);
      res.status(500).json({ message: 'Error deleting Todos' });
    }
  });



  router.delete('/multitodos', async (req, res) => {
    try {
      const result = await Todo.deleteMany({ _id: { $in: req.body } });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Todos not found' });
      }
  
      res.json({ message: `${result.deletedCount} Todos deleted successfully` });
    } catch (error) {
      console.error('Error deleting Todos:', error);
      res.status(500).json({ message: 'Error deleting Todos' });
    }
  });
module.exports = router;
