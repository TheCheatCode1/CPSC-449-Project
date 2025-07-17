// Check if user is admin
const role = localStorage.getItem('role');
if (role !== 'admin') {
    alert('Unauthorized access. Redirecting to login.');
    window.location.href = '/';
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
}); 