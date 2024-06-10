document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'Log-sign.html';
    }
    localStorage.removeItem('viewedUsername');
    fetchTweets();
});

async function fetchTweets() {
    const username = localStorage.getItem('username');
    const response = await fetch('http://localhost:8000/AllTweetsOfPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    });

    const data = await response.json();
    if (response.ok) {
        displayTweets(data.tweetedPosts);
    } else {
        console.error('Failed to fetch tweets:', data.message);
    }
}

function displayTweets(tweets) {
    const tweetsContainer = document.getElementById('tweetsContainer');
    tweetsContainer.innerHTML = ` <strong>Total Tweets : ${tweets.length} </strong>`;

    tweets.forEach(tweet => {
        const tweetElement = document.createElement('div');
        tweetElement.classList.add('tweet');

        tweetElement.innerHTML = `
            <div class="tweet-header">
                <img src="${tweet.profilepic}" alt="Profile Picture">
                <a href="#" class="username-link" data-username="${tweet.username}">${tweet.username}</a>
            </div>
            <div class="tweet-content">
                ${tweet.postImage ? `<img src="${tweet.postImage}" alt="Post Image" class="post-image" style="max-width: 200px; height: 200px; border-radius: 20px; object-fit: contain;">` : ''}
                <p>${tweet.post}</p>
                <p><strong>Your Tweet:</strong> ${tweet.tweet}</p>
            </div>
            <div class="tweet-actions">
                <button class="edit-button" data-tweet-id="${tweet._id}">Edit Tweet</button>
                <button class="delete-button" data-tweet-id="${tweet._id}" data-tweet="${tweet.tweet}">Delete Tweet</button>
            </div>
        `;


        tweetsContainer.appendChild(tweetElement);
    });

    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', handleDelete);
    });
    // Add event listeners to username links
    document.querySelectorAll('.username-link').forEach(link => {
        link.addEventListener('click', handleUsernameClick);
    });
}

function handleUsernameClick(e) {
    e.preventDefault();
    const username = e.target.getAttribute('data-username');
    localStorage.setItem('viewedUsername', username);
    window.location.href = 'user.html';
}


async function handleDelete(e) {
    const tweetId = e.target.getAttribute('data-tweet-id');
    const tweetContent = e.target.getAttribute('data-tweet');
    const username = localStorage.getItem('username');

    const response = await fetch('http://localhost:8000/tweetToDelete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: tweetId, username, tweetContent }),
    });
    const data = await response.json();
    if (response.ok) {
        alert('Tweet Deleted successfully');
        fetchTweets(); // Refresh the tweets
    } else {
        console.error('Failed to Delete tweet:', data.message);
    }
}

function handleEdit(e) {
    const tweetId = e.target.getAttribute('data-tweet-id');
    const newTweetContent = prompt('Enter your new tweet content:');
    if (!newTweetContent) return;

    const username = localStorage.getItem('username');

    updateTweet({ tweetId, username, tweetContent: newTweetContent });
}

async function updateTweet({ tweetId, username, tweetContent }) {
    const response = await fetch('http://localhost:8000/tweetToEdit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: tweetId, username, tweetContent }),
    });
    const data = await response.json();
    if (response.ok) {
        alert('Tweet updated successfully');
        fetchTweets(); // Refresh the tweets
    } else {
        console.error('Failed to update tweet:', data.message);
    }
}
