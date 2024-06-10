const forgotPasswordForm = document.getElementById('forgotPasswordForm');

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('forgotUsername').value;
    const email = document.getElementById('forgotEmail').value;
    const newPassword = document.getElementById('forgotNewPassword').value;
    const confirmPassword = document.getElementById('forgotConfirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const response = await fetch('http://localhost:8000/forgotPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password: newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
        alert('Password changed successfully. Please sign in with your new password.');
        window.close();
    } else {
        alert(data.message);
    }
});
