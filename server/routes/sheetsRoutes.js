const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Activity = require('../models/Activity');

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

router.post('/update-activity-logs', async (req, res) => {
    try {
        // Fetch all activities
        const activities = await Activity.find({}).sort({ timestamp: -1 });
        
        // Format the data for Google Sheets
        const sheetData = activities.map(activity => [
            new Date(activity.timestamp).toLocaleString(),
            activity.userName,
            activity.userRole,
            activity.action,
            activity.details
        ]);

        // Add headers
        const headers = [['Timestamp', 'User', 'Role', 'Action', 'Details']];
        const dataToUpdate = [...headers, ...sheetData];

        // Update the sheet
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Activity Logs!A1', // Make sure this sheet exists in your Google Spreadsheet
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: dataToUpdate
            }
        });

        res.json({ success: true, message: 'Activity logs updated successfully' });
    } catch (error) {
        console.error('Error updating activity logs:', error);
        res.status(500).json({ error: error.message || 'Failed to update activity logs' });
    }
});

module.exports = router;
