// scripts.js
document.getElementById('signUp').addEventListener('click', () => {
    document.getElementById('container').classList.add("right-panel-active");
});

document.getElementById('signIn').addEventListener('click', () => {
    document.getElementById('container').classList.remove("right-panel-active");
});

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('https://twitter-backend-code-production.up.railway.app/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('loginStatus', 'true');
        localStorage.setItem('username', data.username);
        window.location.href = 'Home.html';
    } else {
        alert(data.message);
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    const response = await fetch('https://twitter-backend-code-production.up.railway.app/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, username, password }),
    });

    const data = await response.json();

    if (response.ok) {
        alert('SignUP successful try login to access the Twitter-Clone');
        document.getElementById('container').classList.remove("right-panel-active");
    } else {
        alert(data.message);
    }
});

// Redirect to home if already logged in
window.addEventListener('load', () => {
    if (localStorage.getItem('loginStatus') === 'true') {
        window.location.href = 'Home.html';
    }
});
