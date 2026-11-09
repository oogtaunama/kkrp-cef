// Helper CEF Safe wrapper
const hasCef = typeof cef !== 'undefined';

// Elements
const ucpInput = document.getElementById('ucpName');
const passwordInput = document.getElementById('password');
const alertBox = document.getElementById('alertBox');
const alertMsg = document.getElementById('alertMsg');
const btnLogin = document.getElementById('btnLogin');
const btnLoginText = document.getElementById('btnLoginText');
const btnSpinner = document.getElementById('btnSpinner');

// Init
window.addEventListener('DOMContentLoaded', () => {
    // If not running in CEF (e.g. testing in browser)
    if (!hasCef) {
        console.warn("[CEF] Running in preview browser mode without CEF.");
        setUCPName("Player_Testing");
    }

    passwordInput.focus();
});

// Function to set UCP Name from Pawn
function setUCPName(name) {
    if (ucpInput) {
        ucpInput.value = name || "Unknown";
    }
}

// Function to show error alert
function showError(message) {
    setLoading(false);
    if (alertBox && alertMsg) {
        alertMsg.innerText = message || "Terjadi kesalahan.";
        alertBox.style.display = 'block';
    }
    passwordInput.value = '';
    passwordInput.focus();
}

// Function to hide error alert
function hideError() {
    if (alertBox) {
        alertBox.style.display = 'none';
    }
}

// Button loading state
function setLoading(isLoading) {
    if (btnLogin && btnLoginText && btnSpinner) {
        btnLogin.disabled = isLoading;
        if (isLoading) {
            btnLoginText.style.display = 'none';
            btnSpinner.style.display = 'block';
        } else {
            btnLoginText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Submit Login to Pawn
function submitLogin() {
    const password = passwordInput.value.trim();

    if (!password) {
        showError("Kata sandi tidak boleh kosong!");
        return;
    }

    hideError();
    setLoading(true);

    if (hasCef) {
        // Send event to Pawn server
        cef.emit("cef_onPlayerLoginSubmit", password);
    } else {
        // Browser test simulation
        console.log("[CEF Preview] Emit 'cef_onPlayerLoginSubmit':", password);
        setTimeout(() => {
            setLoading(false);
            showError("Mode Preview Browser: Password terkirim.");
        }, 1000);
    }
}

// Quit Game
function quitGame() {
    if (hasCef) {
        cef.emit("cef_onPlayerLoginQuit");
    } else {
        alert("Tombol Keluar ditekan (Preview Mode)");
    }
}

// Register CEF Listeners from Pawn
if (hasCef) {
    // Dipanggil dari Pawn saat browser selesai load untuk mengisi nama UCP
    cef.on("setLoginData", (name) => {
        setUCPName(name);
    });

    // Dipanggil saat password salah
    cef.on("loginError", (msg) => {
        showError(msg);
    });

    // Dipanggil saat login berhasil
    cef.on("loginSuccess", () => {
        setLoading(false);
        hideError();
    });
}
