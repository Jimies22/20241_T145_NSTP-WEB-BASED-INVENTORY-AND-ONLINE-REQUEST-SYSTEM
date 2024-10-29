const express = require("express");
const router = express.Router();

const itemList = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
  { id: 3, name: "Item 3" },
];

router.get("/", (req, res) => {
  res.send({ data: itemList });
});

router.post("/", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new Error("Name is required");
    }
    const newItem = { id: itemList.length + 1, name };
    itemList.push(newItem);
    res.send({ data: "Item Created" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      throw new Error("Name is required");
    }
    const index = itemList.findIndex((item) => item.id === parseInt(id));
    if (index === -1) {
      throw new Error("Item not found");
    }
    itemList[index].name = name;
    res.send({ data: "Item Updated" });
  } catch (error) {
    if (error.message === "Item not found") {
      res.status(404).send({ error: error.message });
    } else {
      res.status(400).send({ error: error.message });
    }
  }
});

router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = itemList.findIndex((item) => item.id === parseInt(id));
    if (index === -1) {
      throw new Error("Item not found");
    }
    itemList.splice(index, 1);
    res.send({ data: "Item Deleted" });
  } catch (error) {
    if (error.message === "Item not found") {
      res.status(404).send({ error: error.message });
    } else {
      res.status(500).send({ error: error.message });
    }
  }
});

module.exports = router;
