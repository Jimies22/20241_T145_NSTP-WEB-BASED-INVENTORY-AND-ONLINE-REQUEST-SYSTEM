const Item = require("../models/Item");

const itemService = {
  getAllItems: async () => {
    try {
      return await Item.find();
    } catch (error) {
      console.error("Error in getAllItems:", error);
      throw error;
    }
  },

  getItemById: async (item_id) => {
    try {
      return await Item.findOne({ item_id });
    } catch (error) {
      console.error("Error in getItemById:", error);
      throw error;
    }
  },

  createItem: async (itemData) => {
    try {
      const nextItemId = await itemService.getLastItemId();

      const item = new Item({
        ...itemData,
        item_id: nextItemId
      });

      const savedItem = await item.save();
      return savedItem;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Item ID already exists. Please try again.');
      }
      throw error;
    }
  },

  updateItem: async (item_id, itemData) => {
    try {
      const updatedItem = await Item.findOneAndUpdate({ item_id }, itemData, {
        new: true,
        runValidators: true,
      });

      if (!updatedItem) {
        throw new Error("Item not found");
      }

      return updatedItem;
    } catch (error) {
      console.error("Error in updateItem:", error);
      throw error;
    }
  },

  deleteItem: async (item_id) => {
    try {
      return await Item.findOneAndDelete({ item_id });
    } catch (error) {
      console.error("Error in deleteItem:", error);
      throw error;
    }
  },

  getLastItemId: async () => {
    try {
      const lastItem = await Item.findOne({}, { item_id: 1 })
        .sort({ item_id: -1 });

      if (!lastItem) {
        return "1";
      }

      const currentId = parseInt(lastItem.item_id);
      if (isNaN(currentId)) {
        throw new Error('Invalid item ID format');
      }
      
      return (currentId + 1).toString();
    } catch (error) {
      console.error("Error in getLastItemId:", error);
      throw error;
    }
  },
};

module.exports = itemService;
