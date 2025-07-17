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
document.getElementById('homeLink').addEventListener('click', () => {
    window.location.href = '/user.html';
});

document.getElementById('flashcardsLink').addEventListener('click', () => {
    window.location.href = '/userFlashcards.html';
});

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
});

// Word lookup functionality
async function lookupWord() {
    const word = document.getElementById('vocabWord').value;
    const res = await fetch(`/api/flashcards/lookup/${word}`);
    const data = await res.json();

    if (res.ok) {
        document.getElementById('partOfSpeech').innerText = `Part of Speech: ${data.partOfSpeech}`;
        document.getElementById('definition').innerText = `Definition: ${data.definition}`;
    } else {
        alert(data.message);
    }
}

// Save flashcard functionality
async function saveFlashcard() {
    const word = document.getElementById('vocabWord').value;
    const partOfSpeech = document.getElementById('partOfSpeech').innerText.split(': ')[1];
    const definition = document.getElementById('definition').innerText.split(': ')[1];

    const userId = 'LOGGED_IN_USER_ID'; // Replace dynamically if needed

    const res = await fetch('/api/flashcards/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, word, partOfSpeech, definition })
    });

    const data = await res.json();
    alert(data.message);
}

// Button event listeners
document.getElementById('lookupBtn').addEventListener('click', lookupWord);
document.getElementById('saveBtn').addEventListener('click', saveFlashcard); 