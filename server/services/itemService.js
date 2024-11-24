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
      const item = new Item(itemData);
      return await item.save();
    } catch (error) {
      console.error("Error in createItem:", error);
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
};

module.exports = itemService;
