const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Activity = require('../models/Activity');
const Request = require('../models/borrow');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: require('../credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Initialize sheets API
let sheets;
(async () => {
    sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
})();

const SPREADSHEET_ID = "1robOVUE6k3a3BcyCj8o25W8f6p2422VbfyvcW9NyxCE";

// Function to ensure sheets exist
async function ensureSheets() {
    try {
        // Get the spreadsheet
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });

        const existingSheets = response.data.sheets.map(sheet => sheet.properties.title);
        const requiredSheets = ['ActivityLogs', 'ReturnedItems'];
        const requests = [];

        // Check which sheets need to be added
        for (const sheetName of requiredSheets) {
            if (!existingSheets.includes(sheetName)) {
                requests.push({
                    addSheet: {
                        properties: {
                            title: sheetName
                        }
                    }
                });
            }
        }

        // If any sheets need to be added, create them
        if (requests.length > 0) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: {
                    requests
                }
            });
        }
    } catch (error) {
        console.error('Error ensuring sheets exist:', error);
        throw error;
    }
}

router.post('/update-activity-logs', async (req, res) => {
    try {
        // Ensure required sheets exist
        await ensureSheets();

        // 1. Update Activity Logs
        const activities = await Activity.find({}).sort({ timestamp: -1 });
        const activityData = activities.map(activity => [
            new Date(activity.timestamp).toLocaleString(),
            activity.userName,
            activity.userRole,
            activity.action,
            activity.details
        ]);
        
        const activityHeaders = [['Timestamp', 'User', 'Role', 'Action', 'Details']];
        const activitySheet = [...activityHeaders, ...activityData];

        // 2. Update Returned Items
        const returnedItems = await Request.find({ status: 'returned' })
            .populate('userId')
            .populate('item')
            .sort({ actualReturnDate: -1 });

        const returnedData = returnedItems.map(request => [
            new Date(request.actualReturnDate || new Date()).toLocaleString(),
            request.userId?.name || 'Unknown User',
            request.item?.name || 'Unknown Item',
            request.item?.item_id || 'N/A',
            new Date(request.borrowDate).toLocaleString(),
            new Date(request.returnDate).toLocaleString()
        ]);

        const returnedHeaders = [['Return Date', 'User Name', 'Item Name', 'Item ID', 'Borrow Date', 'Expected Return Date']];
        const returnedSheet = [...returnedHeaders, ...returnedData];

        // Clear and update both sheets
        await Promise.all([
            // Clear and update Activity Logs
            sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: 'ActivityLogs!A:E'
            }),
            sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: 'ReturnedItems!A:F'
            })
        ]);

        await Promise.all([
            // Update Activity Logs
            sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: 'ActivityLogs!A1',
                valueInputOption: 'USER_ENTERED',
                resource: { values: activitySheet }
            }),
            // Update Returned Items
            sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: 'ReturnedItems!A1',
                valueInputOption: 'USER_ENTERED',
                resource: { values: returnedSheet }
            })
        ]);

        res.json({ 
            success: true, 
            message: 'Activity logs and returned items updated successfully'
        });
    } catch (error) {
        console.error('Error updating sheets:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to update sheets',
            details: error.stack
        });
    }
});

module.exports = router;
