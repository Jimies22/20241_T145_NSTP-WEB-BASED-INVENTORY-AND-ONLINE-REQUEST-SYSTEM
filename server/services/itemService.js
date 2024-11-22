const Item = require('../models/Item');

const itemService = {
    getAllItems: async () => {
        try {
            const items = await Item.find();
          
            return items;
        } catch (error) {
            console.error('Error in getAllItems:', error);
            throw error;
        }
    },

    getItemById: async (item_id) => {
        return await Item.findOne({ item_id });
    },

    createItem: async (itemData) => {
        const item = new Item(itemData);
        return await item.save();
    },

    updateItem: async (item_id, itemData) => {
        try {
            const updatedItem = await Item.findOneAndUpdate(
                { item_id },
                itemData,
                { 
                    new: true,  // This ensures the updated document is returned
                    runValidators: true  // This ensures update validation
                }
            );
            
            if (!updatedItem) {
                throw new Error('Item not found');
            }
            
            return updatedItem;
        } catch (error) {
            console.error('Error in updateItem:', error);
            throw error;
        }
    },

    deleteItem: async (item_id) => {
        return await Item.findOneAndDelete({ item_id });
    }
};

module.exports = itemService;