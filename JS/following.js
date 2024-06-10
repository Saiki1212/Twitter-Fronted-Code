document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'Log-sign.html';
    } 
    const username = localStorage.getItem('username');
    fetch('https://twitter-backend-code-production.up.railway.app/AllFollowingList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    })
    .then(response => response.json())
    .then(data => {
        const following = data.followingUsers;
        const followingContainer = document.getElementById('followingContainer');
        followingContainer.innerHTML = '';

        following.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user';
            userElement.innerHTML = `
                <p>${user.following}</p>
                <button class="unfollow" onclick="toggleFollow('${user.following}')">
                    Unfollow
                </button>
            `;
            followingContainer.appendChild(userElement);
        });
    })
    .catch(error => console.error('Error:', error));
});

function toggleFollow(followingUsername) {
    const username = localStorage.getItem('username');
    fetch(`https://twitter-backend-code-production.up.railway.app/UnFollowUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, following: followingUsername }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(error => console.error('Error:', error));
}
