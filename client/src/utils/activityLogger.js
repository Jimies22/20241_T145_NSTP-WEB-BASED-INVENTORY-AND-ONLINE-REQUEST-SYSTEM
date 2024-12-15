import axios from 'axios';

export const logActivity = async (action, details) => {
    try {
        const token = sessionStorage.getItem('sessionToken');
        if (!token) {
            console.error('No token found for activity logging');
            return;
        }

        // Validate inputs
        if (!action || !details) {
            throw new Error('Action and details are required for activity logging');
        }

        // Get user info from session storage if available
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        
        const payload = {
            action,
            details,
            timestamp: new Date().toISOString(),
            userName: userInfo.name || 'Unknown User',
            userRole: userInfo.role || 'Unknown Role',
            userID: userInfo.userID || null
        };

        const response = await axios.post(
            'http://localhost:3000/activity/log', 
            payload,
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        );

        if (response.status === 201 || response.status === 200) {
            // Dispatch event for new activity
            const newActivityEvent = new CustomEvent('newActivity', {
                detail: response.data
            });
            window.dispatchEvent(newActivityEvent);
            return response.data;
        } else {
            throw new Error('Failed to log activity');
        }
    } catch (error) {
        console.error('Error logging activity:', error.message);
        // Don't throw the error, just log it
        return null;
    }
}; 