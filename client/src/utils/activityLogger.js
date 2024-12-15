import axios from 'axios';

export const logActivity = async (action, details) => {
    try {
        const token = sessionStorage.getItem('sessionToken');
        if (!token) {
            console.error('No token found for activity logging');
            return;
        }

        const response = await axios.post('http://localhost:3000/activity/log', 
            { action, details },
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        );

        // Dispatch event for new activity
        window.dispatchEvent(new Event('newActivity'));
        
        return response.data;
    } catch (error) {
        console.error('Error logging activity:', error);
        throw error;
    }
}; 