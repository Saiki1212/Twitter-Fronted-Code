// Function to display modal with image and content
function displayModal(imageUrl, postContent) {
    const modal = document.getElementById('myModal');
    const modalImage = document.getElementById('modalImage');
    const modalContent = document.getElementById('modalContent');

    modal.style.display = 'block'; // Display the modal
    modalImage.src = imageUrl; // Set modal image source
    modalContent.textContent = postContent; // Set modal content

    // Close the modal when the user clicks on the close button
    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    // Close the modal when the user clicks outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

const content = document.getElementById('content');

// Add event listeners to all sidebar links
document.querySelectorAll('.sidebar ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('viewedUsername');
        const page = link.getAttribute('data-page');
        loadPage(page);
    });
});

// Function to load content based on the selected option
function loadPage(page) {
    let html = '';
    switch (page) {
        case 'home':
            window.location.href = 'Home.html';
            break;
        case 'followers':
            window.location.href = 'followers.html';
            break;
        case 'following':
            window.location.href = 'following.html';
            break;
        case 'allusers':
            window.location.href = 'allusers.html';
            break;
        case 'tweets':
            window.location.href = 'tweet.html';
            break;
        case 'posts':
            window.location.href = 'post.html';
            break;
        case 'notification':
            window.location.href = 'notifi.html';
            break;
        case 'user':
            window.location.href = 'user.html';
            break;
        case 'deleteAccount':
            html = `<h1>Delete Account</h1><p>Account deletion option.</p>`;
            break;
        default:
            html = `<h1>Welcome</h1><p>Select an option from the left sidebar.</p>`;
            break;
    }
    content.innerHTML = html;
}


document.getElementById('logoutButton').addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('loginStatus');
        localStorage.removeItem('username'); 
        localStorage.removeItem('viewedUsername'); 
        window.location.href = 'Log-sign.html';
    }
    else {
        window.location.href = 'Home.html';
    }
});

const postsContainer = document.getElementById('postsContainer');

// Fetch and display posts on page load
async function fetchPosts() {
    const username = localStorage.getItem('username'); // Get username from localStorage
    const response = await fetch(`https://twitter-backend-code-production.up.railway.app/AllpostsExceptCurrentUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    });

    const data = await response.json();
    if (response.ok) {
        displayPosts(data.allPosts);
    } else {
        console.error('Failed to fetch posts:', data.message);
    }
}

function displayPosts(posts) {
    // Sort posts based on their timestamp in descending order (latest first)
    posts.sort((a, b) => new Date(b.createdAtDate) - new Date(a.createdAtDate));

    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        const timeAgoText = timeAgo(post.createdAtDate);

        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.profilepic}" alt="Profile Picture" class="profile-pic">
                <a href="#" class="username-link" onclick="handleUsernameClick('${post.username}')" data-username="${post.username}">${post.username}</a>
            </div>
            <div class="post-content">
                ${post.postImage ? `<img src="${post.postImage}" alt="Post Image" onclick="displayModal('${post.postImage}', '${post.postContent}')" class="post-image" style="width: 200px; height: 200px; border-radius: 10px; object-fit: center; cursor: pointer;">` : ''}
                <p>${post.postContent}</p>
            </div>
            <div class="post-actions">
                <button class="like-button" onclick="handleLike('${post._id}')">Like</button>
                <span class="like-count">${post.totalLikes}</span>
                <button class="tweet-button" onclick="handleTweet('${post._id}')">Tweet</button>
                <span class="tweet-count">${post.totalTweets}</span>
            </div>
            <div class="timestamp">${timeAgoText}</div>
        `;

        postsContainer.appendChild(postElement);
    });
}

// Handle username click
function handleUsernameClick(newUser) {
    localStorage.setItem('viewedUsername', newUser);
    window.location.href = 'user.html';
}

function timeAgo(date) {
    const now = new Date();
    const secondsAgo = Math.floor((now - new Date(date)) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);
    const weeksAgo = Math.floor(daysAgo / 7);

    if (secondsAgo < 60) return "just now";
    if (minutesAgo < 60) return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
    if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    if (daysAgo < 7) return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
}


// Handle like button click
async function handleLike(postId) {
    const username = localStorage.getItem('username');

    const response = await fetch('https://twitter-backend-code-production.up.railway.app/likeForAPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, username }),
    });

    const data = await response.json();
    if (response.ok) {
        location.reload();
    } else {
        console.error('Failed to like post:', data.message);
    }
}

// Handle tweet button click
async function handleTweet(postId) {
    const username = localStorage.getItem('username');
    const tweetContent = prompt('Enter your tweet:');
    if (!tweetContent) return;

    const response = await fetch('https://twitter-backend-code-production.up.railway.app/tweetToAPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, username, tweetContent }),
    });

    const data = await response.json();
    if (response.ok) {
        location.reload();
    } else {
        console.error('Failed to tweet post:', data.message);
    }
}

// Redirect to login if not logged in
window.addEventListener('load', () => {
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'Log-sign.html';
    } else {
        fetchPosts();
    }
});
