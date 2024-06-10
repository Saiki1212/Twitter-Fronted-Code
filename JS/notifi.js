document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username'); // Get username from localStorage

    if (!username) {
        window.location.href = 'index.html'; // Redirect to login page if not logged in
        return;
    }
    if (localStorage.getItem('loginStatus') !== 'true') {
        window.location.href = 'index.html';
    } 

    fetchNotifications(username);
});

async function fetchNotifications(username) {
    try {
        const response = await fetch(`https://twitter-backend-code-production.up.railway.app/userNotifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();
        if (response.ok) {
            displayNotifications(data.AllMyNotifications);
        } else {
            console.error('Failed to fetch notifications:', data.message);
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function displayNotifications(notifications) {
    const notificationsContainer = document.getElementById('notificationsContainer');
    notificationsContainer.innerHTML = '';

    // Sort notifications by creation time (latest first)
    notifications.sort((a, b) => new Date(b.createdAtDate) - new Date(a.createdAtDate));

    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.classList.add('notification');
        if (notification.isRequest) {
            notificationElement.classList.add('request');
        }

        const timeAgoText = timeAgo(notification.createdAtDate);

        notificationElement.innerHTML = `
            <div class="message">${notification.message}</div>
            <div class="timestamp">${timeAgoText}</div>
        `;

        notificationsContainer.appendChild(notificationElement);
    });
}

function timeAgo(date) {
    const now = new Date();
    const secondsAgo = Math.floor((now - new Date(date)) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);

    if (secondsAgo < 60) return "just now";
    if (minutesAgo < 60) return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
    const remainingMinutes = minutesAgo % 60;
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}` : ''} ago`;
}