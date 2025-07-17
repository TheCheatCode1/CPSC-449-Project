const username = localStorage.getItem('username') || 'User';

const greetings = [
    "Hello",
    "Hi",
    "Hey",
    "Greetings",
    "Salutations",
    "Howdy",
    "What's up",
    "Yo",
    "Ahoy",
    "Welcome",
    "Good day",
    "Good to see you",
    "Nice to see you",
    "Hey there",
    "Hiya",
    "Bonjour",
    "Hola",
    "Ciao",
    "Hallo",
    "Namaste",
    "Peace",
    "Salam",
    "Aloha",
    "Shalom",
    "Sup",
    "Wassup",
    "How's it going",
    "What's new",
    "Pleasure to see you",
    "Look who it is",
    "Long time no see",
    "Oi",
    "Konnichiwa",
    "Yassas",
    "Annyeong",
    "Marhaba",
    "Sawubona",
    "Good morning",
    "Good afternoon",
    "Good evening",
    "Hey buddy",
    "Hey friend",
    "Hello there",
    "Yo yo yo",
    "Well hello",
    "Hey pal",
    "Cheers",
    "Blessings",
    "Howdy partner",
    "Ahoy matey"
];

const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
document.getElementById('welcome').textContent = `${randomGreeting}, ${username}`;

// Check if user is authorized
const role = localStorage.getItem('role');
if (role !== 'user') {
    alert('Unauthorized access. Redirecting to login.');
    window.location.href = '/';
}

// Sidebar functionality
const sidebar = document.getElementById('sidebar');
sidebar.addEventListener('mouseenter', () => {
    sidebar.classList.add('expanded');
});
sidebar.addEventListener('mouseleave', () => {
    sidebar.classList.remove('expanded');
});

// Navigation functionality
document.getElementById('flashcardsLink').addEventListener('click', () => {
    window.location.href = '/userFlashcards.html';
});

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
}); 