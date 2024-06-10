document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'Log-sign.html';
        return;
    }

    const loggedInUsername = localStorage.getItem('username');
    const username = localStorage.getItem('viewedUsername') || loggedInUsername;

    fetchUserPosts(username, loggedInUsername);

    // Edit Profile Button
    const editProfileBtn = document.getElementById('editProfileBtn');
    editProfileBtn.style.display = (username === loggedInUsername) ? 'block' : 'none';
    editProfileBtn.addEventListener('click', () => {
        document.getElementById('editProfileModal').style.display = 'block';
    });

    // Delete Profile Button
    const deleteUserBtn = document.getElementById('deleteUserBtn');
    deleteUserBtn.style.display = (username === loggedInUsername) ? 'block' : 'none';
    deleteUserBtn.addEventListener('click', () => {
        document.getElementById('deleteUserModal').style.display = 'block';
    });

    // Close Modal Buttons
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.parentElement.parentElement.style.display = 'none';
        });
    });

    // Edit Profile Form Submission
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);

    // Confirm Delete Profile Button
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteUser);

    // Cancel Delete Profile Button
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteUserModal').style.display = 'none';
    });
});

async function fetchUserPosts(username, loggedInUsername) {
    try {
        const response = await fetch('http://localhost:8000/userPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();

        updateProfileInformation(data.user, loggedInUsername);
        renderUserPosts(data.AllMyPosts, username, loggedInUsername);
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateProfileInformation(user, loggedInUsername) {
    document.getElementById('profilePic').src = user.profilePic;
    document.getElementById('name').textContent = user.name;
    document.getElementById('username').textContent = user.username;

    if (user.username === loggedInUsername) {
        document.getElementById('email').textContent = user.email;
        document.getElementById('editProfileBtn').style.display = 'block';
    } else {
        document.getElementById('email').style.display = 'none';
    }

    document.getElementById('followers').textContent = user.followers;
    document.getElementById('following').textContent = user.following;
    document.getElementById('posts').textContent = user.posts;
}

function renderUserPosts(posts, username, loggedInUsername) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    posts.sort((a, b) => new Date(b.createdAtDate) - new Date(a.createdAtDate));

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        let postContent = `
            <h4>${post.username}</h4>
            <p>${post.postContent}</p>
        `;

        if (post.postImage) {
            // console.log('Post Image URL:', post.postImage); // Log the image URL
            postContent += `<img src="${post.postImage}" alt="Post Image" class="post-image" style="max-width: 200px; height: 200px; border-radius: 20px; object-fit: contain;">`;

        }

        postContent += `
            <div class="info">
                <div class="icons">
                    <div class="icon">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPkns6lML4oMFvmxMM_H0055UCIPsEk152dw&s" alt="Likes"> ${post.totalLikes}
                    </div>
                    <div class="icon">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Tweets"> ${post.totalTweets}
                    </div>
                </div>
            </div>`;

        if (username === loggedInUsername) {
            postContent += `
                <div class="actions">
                    <button onclick="editPost('${post._id}', '${post.postContent.replace(/'/g, "&apos;")}')">Edit</button>
                    <button onclick="deletePost('${post._id}')">Delete</button>
                </div>`;
        }

        postContent += `
            <small>${getTimeAgo(post.createdAtDate)}</small>
            <div class="tweets">
                <h5>Tweets: ${post.totalTweets}</h5>
                ${post.tweets.map(tweet => `<p>${tweet.username} -> ${tweet.tweet}</p>`).join('')}
            </div>
        `;

        postElement.innerHTML = postContent;
        postsContainer.appendChild(postElement);
    });
}

async function handleEditProfile(event) {
    event.preventDefault();

    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;

    const profilePicInput = document.getElementById('editProfilePic');
    let profilePicBase64 = '';

    if (profilePicInput.files.length > 0) {
        const file = profilePicInput.files[0];
        profilePicBase64 = await readFileAsBase64(file);
    }

    updateUserProfile(name, email, password, profilePicBase64);
}

async function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function updateUserProfile(name, email, password, profilePicBase64) {
    if (!name && !email && !password && !profilePicBase64) location.reload();

    const loggedInUsername = localStorage.getItem('username');
    const profilePicUrl = profilePicBase64 ? await compressAndConvertBase64(profilePicBase64) : "";
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch('http://localhost:8000/editUserDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: loggedInUsername,
                name,
                email,
                password,
                profilePic: profilePicUrl,
            }),
        });

        const data = await response.json();
        if (data.message === 'Editing user Successful') {
            alert('Profile updated successfully');
            location.reload();
        } else {
            alert('Failed to update profile');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function compressAndConvertBase64(profilePicBase64) {
    try {
        if (!profilePicBase64) return '';

        const byteString = atob(profilePicBase64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

        const compressedFile = await new Promise((resolve) => {
            new ImageCompressor().compress(blob, {
                maxWidth: 500,
                maxHeight: 500,
                quality: 100,
                success(result) {
                    resolve(result);
                },
            });
        });

        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        return new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
        });
    } catch (error) {
        console.error('Error compressing image:', error);
        return '';
    }
}

function editPost(postId, currentContent) {
    const newContent = prompt('Edit your post:', currentContent);
    if (newContent && newContent !== currentContent) {
        fetch('http://localhost:8000/editPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId, postContent: newContent }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Post updated successfully') {
                alert('Post updated successfully');
                location.reload();
            } else {
                alert('Failed to update post');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        fetch('http://localhost:8000/deletePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId, username: localStorage.getItem('username') }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Post deleted successfully') {
                alert('Post deleted successfully');
                location.reload();
            } else {
                alert('Failed to delete post');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

async function handleDeleteUser() {
    const username = localStorage.getItem('username');
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch('http://localhost:8000/deleteUserFromDB', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();
        if (data.message === 'User deleted successfully') {
            console.log("s1");
            alert('User deleted successfully');
            localStorage.clear();
            window.location.href = 'Log-sign.html';
        } else {
            console.log("s1");
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function getTimeAgo(createdAtDate) {
    const currentDate = new Date();
    const postDate = new Date(createdAtDate);
    const timeDifference = currentDate.getTime() - postDate.getTime();

    const secondsDifference = Math.floor(timeDifference / 1000);
    const minutesDifference = Math.floor(secondsDifference / 60);
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);

    if (secondsDifference < 60) {
        return 'just now';
    } else if (minutesDifference < 60) {
        return `${minutesDifference} minutes ago`;
    } else if (hoursDifference < 24) {
        return `${hoursDifference} hours ago`;
    } else {
        return `${daysDifference} days ago`;
    }
}
