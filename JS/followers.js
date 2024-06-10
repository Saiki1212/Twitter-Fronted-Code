document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'Log-sign.html';
    } 
    const username = localStorage.getItem('username');
    fetch('http://localhost:8000/AllFollowersList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    })
    .then(response => response.json())
    .then(data => {
        const followers = data.followersList;
        const followersContainer = document.getElementById('followersContainer');
        followersContainer.innerHTML = '';

        followers.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user';
            userElement.innerHTML = `
                <p>${user.username}</p>
                <button class="${user.isFollowing ? 'unfollow' : 'follow'}" onclick="toggleFollow('${user.username}', ${user.isFollowing})">
                    ${user.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            `;
            followersContainer.appendChild(userElement);
        });
    })
    .catch(error => console.error('Error:', error));
});

function toggleFollow(followerUsername, isFollowing) {
    console.log(1)
    const username = localStorage.getItem('username');
    console.log("username : ", username, "followerUsername : ", followerUsername);
    fetch(`http://localhost:8000/${isFollowing ? 'UnFollowUser' : 'FollowUser'}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, following: followerUsername }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(error => console.error('Error:', error));
}
