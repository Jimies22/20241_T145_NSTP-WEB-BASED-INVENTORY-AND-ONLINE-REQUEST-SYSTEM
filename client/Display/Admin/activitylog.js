document.addEventListener('DOMContentLoaded', function() {
    const userFilter = document.getElementById('userFilter');
    const actionFilter = document.getElementById('actionFilter');

    function filterLogs() {
        const userValue = userFilter.value;
        const actionValue = actionFilter.value;
        
        // Get all table rows
        const rows = document.querySelectorAll('.order table tbody tr');
        
        rows.forEach(row => {
            const role = row.querySelector('.status').textContent.toLowerCase();
            const action = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            
            let showRow = true;
            
            // Filter by user role
            if (userValue !== 'all') {
                if (userValue === 'admin' && role !== 'admin') showRow = false;
                if (userValue === 'user' && role !== 'user') showRow = false;
            }
            
            // Filter by action type
            if (actionValue !== 'all') {
                if (!action.includes(actionValue.toLowerCase())) showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }

    userFilter.addEventListener('change', filterLogs);
    actionFilter.addEventListener('change', filterLogs);
}); 