document.getElementById('logoutButton').addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('loginStatus');
        localStorage.removeItem('username'); // Clear the username
        window.location.href = 'index.html';
    } 
});


document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const postContent = document.getElementById('postContent').value;
    if (!postContent.trim()) {
        alert('Post content cannot be empty.');
        return;
    }

    const username = localStorage.getItem('username'); // Get username from localStorage
    if (!username) {
        alert('User not logged in.');
        window.location.href = 'Log-sign.html';
        return;
    }
    const postImageInput = document.getElementById('postImage');
    let postImageBase64 = '';
    if (postImageInput.files.length > 0) {
        const file = postImageInput.files[0];
        postImageBase64 = await compressAndConvertBase64(file);
    }
    
    const response = await fetch('https://twitter-backend-code-production.up.railway.app/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, postContent, postImage: postImageBase64 }),
    });

    const data = await response.json();

    if (response.ok) {
        addRecentPost(postContent, postImageBase64);
        document.getElementById('postContent').value = '';
        postImageInput.value = ''; // Reset file input
        alert("Post saved successfully");
    } else {
        alert(data.message);
    }
});

function addRecentPost(content, imageBase64) {
    const postsContainer = document.getElementById('postsContainer');
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const timeElement = document.createElement('time');
    const now = new Date();
    timeElement.textContent = now.toLocaleString();

    const contentElement = document.createElement('p');
    contentElement.textContent = content;

    postElement.appendChild(timeElement);
    postElement.appendChild(contentElement);

    postsContainer.prepend(postElement);
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get only the base64 data part
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Function to compress and convert an image to base64
async function compressAndConvertBase64(file) {
    try {
        // Convert file to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // Compress the image
        const compressedFile = await new Promise((resolve) => {
            new ImageCompressor().compress(file, {
                maxWidth: 500, // Adjust as needed
                maxHeight: 500, // Adjust as needed
                quality: 100, // Adjust as needed (lower quality means higher compression)
                success(result) {
                    resolve(result);
                },
            });
        });
        reader.readAsDataURL(compressedFile);
        return new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
        });
        // return compressedBase64;
    } catch (error) {
        console.error('Error compressing image:', error);
        return '';
    }
}

// Redirect to home if not logged in
window.addEventListener('load', () => {
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'Log-sign.html';
    }
});
