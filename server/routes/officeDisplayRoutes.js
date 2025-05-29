const express = require('express');
const router = express.Router();
const OfficeDisplay = require('../models/OfficeDisplay');
const itemService = require('../services/itemService');

// Public route to get all items
router.get('/items', async (req, res) => {
    try {
        const items = await itemService.getAllItems();
        res.json(items);
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ message: 'Error fetching items' });
    }
});

// Protected route for borrowing items
router.post('/borrow', async (req, res) => {
    try {
        const { itemId, borrowerName, borrowDate } = req.body;
        // You may want to validate input here

        // Example: Update item status to 'borrowed' and log the request
        const item = await OfficeDisplay.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (item.status === 'borrowed') {
            return res.status(400).json({ message: 'Item already borrowed' });
        }

        item.status = 'borrowed';
        item.borrowerName = borrowerName;
        item.borrowDate = borrowDate || new Date();
        await item.save();

        res.json({ message: 'Borrow request successful', item });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;