import itemModel from "../models/itemModel.js";

const getItems = async (req, res) => {
  try {
    const items = await itemModel.find();
    res.send({ data: items });
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve items" });
  }
};

const getItem = async (req, res) => {
  const { item_id } = req.params; // Assuming item_id is in the route parameters
  try {
    const item = await itemModel.findOne({ item_id }); // Querying with item_id
    if (item) {
      res.send({ data: item });
    } else {
      res.status(404).send({ error: `Item with item_id ${item_id} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve item" });
  }
};

const postItem = async (req, res) => {
  const items = req.body; // Expecting either a single item object or an array of item objects

  try {
    // Validate that the request body is an array or a single object
    if (!Array.isArray(items)) {
      // If it's a single item object
      const newItem = new itemModel(items); // Create a new item instance
      const savedItem = await newItem.save(); // Save the item to the database
      res
        .status(200)
        .send({ data: `Item ${savedItem.name} created successfully` }); // Send a success response
    } else {
      // If it's an array of item objects
      const newItems = await Promise.all(
        items.map(async (itemData) => {
          const newItem = new itemModel(itemData); // Create a new item instance for each object
          return newItem.save(); // Save each item
        })
      );

      res.status(200).send({
        data: `${newItems.length} items created successfully`,
      }); // Send a success response for multiple items
    }
  } catch (error) {
    console.error("Error saving items:", error); // Log the error
    res.status(500).send({ error: "Failed to create items" }); // Send an error response
  }
};

const putItem = async (req, res) => {
  const { itemId } = req.params;
  const { name, category, price, quantity } = req.body;
  try {
    const updatedItem = await itemModel.findOneAndUpdate(
      { item_id: itemId },
      { name, category, price, quantity },
      { new: true } // Return the updated document
    );
    if (updatedItem) {
      res.send({
        data: `Item with item_id ${itemId} updated successfully`,
        updatedItem,
      });
    } else {
      res.status(404).send({ error: `Item with item_id ${itemId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to update item" });
  }
};

const deleteItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const deletedItem = await itemModel.findOneAndDelete({
      item_id: itemId,
    });
    if (deletedItem) {
      res.send({ data: `Item with item_id ${itemId} deleted successfully` });
    } else {
      res.status(404).send({ error: `Item with item_id ${itemId} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to delete item" });
  }
};

export { getItems, getItem, postItem, putItem, deleteItem };
