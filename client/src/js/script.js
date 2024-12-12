// Toggle active class for sidebar menu items
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;

    item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        });
        li.classList.add('active');
    });
});

// Toggle sidebar visibility
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
});

// Toggle search form visibility on small screens
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');

        if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

// Adjust sidebar and search form based on window size
if (window.innerWidth < 768) {
    sidebar.classList.add('hide');
} else if (window.innerWidth > 576) {
    searchButtonIcon.classList.replace('bx-x', 'bx-search');
    searchForm.classList.remove('show');
}

window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

// Toggle dark mode
const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark');
        localStorage.removeItem('darkMode');
    }
});

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    switchMode.checked = true;
    document.body.classList.add('dark');
}

document.addEventListener("DOMContentLoaded", function() {
    const submitBtn = document.getElementById('submitBtn');
    const inputs = document.querySelectorAll('.form input');

    if (!submitBtn) {
        console.error("submitBtn element not found");
        return;
    }

    function checkInputs() {
        let allFilled = true;
        inputs.forEach(input => {
            if (input.value === '') {
                allFilled = false;
            }
        });

        if (allFilled) {
            submitBtn.classList.remove('disabled');
            submitBtn.classList.add('enabled');
        } else {
            submitBtn.classList.remove('enabled');
            submitBtn.classList.add('disabled');
        }
    }

    inputs.forEach(input => {
        input.addEventListener('input', checkInputs);
    });

    checkInputs(); // Initial check
});

// Search functionality
function searchItems() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.projector-card');
    let hasVisibleCards = false;

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const status = card.querySelector('.status').textContent.toLowerCase();
        
        if (title.includes(filter) || status.includes(filter)) {
            card.style.display = '';
            hasVisibleCards = true;
        } else {
            card.style.display = 'none';
        }
    });

    // Handle no results message
    let noResults = document.getElementById('no-results');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'no-results';
        noResults.className = 'no-results';
        noResults.textContent = 'No items found';
        document.querySelector('.projector-grid').after(noResults);
    }
    noResults.style.display = hasVisibleCards ? 'none' : 'block';
}

// Clear search when clicking the X button in search input
document.getElementById('searchInput').addEventListener('search', function() {
    if (this.value === '') {
        searchItems();
    }
});

// Handle admin sidebar state
const initAdminSidebar = () => {
    const sidebarState = localStorage.getItem('adminSidebarState');
    const sidebar = document.getElementById('sidebar');
    const adminDashboard = document.querySelector('.admin-dashboard');
    
    if (sidebar && adminDashboard) {
        if (sidebarState === 'hide') {
            sidebar.classList.add('hide');
            adminDashboard.classList.add('hide');
        } else {
            sidebar.classList.remove('hide');
            adminDashboard.classList.remove('hide');
        }
    }
};

// Add event listener for sidebar toggle
const handleSidebarToggle = () => {
    const sidebar = document.getElementById('sidebar');
    const adminDashboard = document.querySelector('.admin-dashboard');
    
    if (sidebar && adminDashboard) {
        const isHidden = sidebar.classList.contains('hide');
        localStorage.setItem('adminSidebarState', isHidden ? '' : 'hide');
        
        sidebar.classList.toggle('hide');
        adminDashboard.classList.toggle('hide');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initAdminSidebar();
    
    // Add click listener for sidebar toggle button if it exists
    const toggleButton = document.querySelector('.toggle-button');
    if (toggleButton) {
        toggleButton.addEventListener('click', handleSidebarToggle);
    }
});

