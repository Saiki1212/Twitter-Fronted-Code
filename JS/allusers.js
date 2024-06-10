// Redirect to login if not logged in
window.addEventListener('load', () => {
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'index.html';
    } 
    localStorage.removeItem('viewedUsername');
});

document.addEventListener('DOMContentLoaded', async () => {
    const usersContainer = document.getElementById('usersContainer');

    const username = localStorage.getItem('username'); // Replace this with the actual logged-in username
    const response = await fetch('https://twitter-backend-code-production.up.railway.app/AllUsers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    });

    const data = await response.json();
    const allUsers = data.allUsers;

    allUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');

        const userImg = document.createElement('img');
        userImg.src = user.profilePic || 'default-profile.png'; // Use a default profile picture if none is provided

        const userDetails = document.createElement('div');
        userDetails.classList.add('user-details');

        const userName = document.createElement('h2');
        userName.textContent = user.username;
        userName.addEventListener('click', () => {
            localStorage.setItem('viewedUsername', user.username);
            window.location.href = 'user.html';
        });

        userDetails.appendChild(userName);

        const followButton = document.createElement('button');
        followButton.textContent = 'Follow';
        followButton.addEventListener('click', async () => {
            const response = await fetch('https://twitter-backend-code-production.up.railway.app/FollowUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, following: user.username }),
            });

            if (response.ok) {
                userCard.remove();
            } else {
                console.error('Failed to follow user');
            }
        });

        userCard.appendChild(userImg);
        userCard.appendChild(userDetails);
        userCard.appendChild(followButton);

        usersContainer.appendChild(userCard);
    });
});
