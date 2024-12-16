const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Request = require('../models/borrow');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: require('../credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

router.post('/update-sheets', async (req, res) => {
  try {
    // Get all returned items
    const returnedItems = await Request.find({ status: 'returned' })
      .populate('userId')
      .populate('item')
      .sort({ requestDate: -1 });

    // Format data for sheets
    const sheetData = returnedItems.map(item => [
      new Date(item.requestDate).toLocaleString(),  // Timestamp
      item.item?.name || 'Unknown Item',            // Item Name
      item.userId?.name || 'Unknown User',          // Borrower Name
      item.status,                                  // Status
      new Date(item.borrowDate).toLocaleDateString(),    // Start Date
      new Date(item.returnDate).toLocaleDateString(),    // End Date
    ]);

    // Add headers
    const headers = [['Timestamp', 'Item', 'Borrower', 'Status', 'Start Date', 'End Date']];
    const dataToUpdate = [...headers, ...sheetData];

    // Get Google Sheets instance
    const sheets = google.sheets({ version: 'v4', auth });

    // Update the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: '1robOVUE6k3a3BcyCj8o25W8f6p2422VbfyvcW9NyxCE',
      range: 'Borrow History!A1',  // Update the sheet name if different
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: dataToUpdate
      },
    });

    res.json({ success: true, message: 'Sheet updated successfully' });
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
