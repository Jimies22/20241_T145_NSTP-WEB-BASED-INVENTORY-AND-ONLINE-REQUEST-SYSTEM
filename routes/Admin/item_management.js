const express = require("express");
const app = express();
const port = 3000;

//DISPLAY ITEMS
app.get("/items", (req, res) => {
  res.send("List of items");
});

//SEARCH ITEMS ID
app.get("/items/i/:id", (req, res) => {
  res.send("Item ID");
});

//SEARCH ITEMS NAME
app.get("/items/n/:name", (req, res) => {
  res.send("Display Item Name");
});

//ADD ITEMS
app.post("/items", (req, res) => {
  res.send("Insert Item");
});

//DELETE ITEMS
app.delete("/items", (req, res) => {
  res.send("Delete Item");
});

//UPDATE ITEMS
app.patch("/items", (req, res) => {
  res.send("Update Item");
});

app.listen(port, () => {
  console.log(`App server port listening... ${port}`);
});
