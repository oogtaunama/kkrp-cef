/**
 * ==========================================================================
 * LOGIKA FRONTEND MODUL LOGIN CEF
 * Kota Kecilku Roleplay / open.mp CEF Frontend
 * ==========================================================================
 */

const AuthApp = {
    // State Aplikasi
    state: {
        loggedUcp: '',
        isLoading: false
    },

    /**
     * Inisialisasi awal saat DOM siap
     */
    init() {
        console.log('[AuthApp] Inisialisasi modul Login CEF.');

        this.bindBridgeListeners();

        // Mode Browser Dev: isi mock UCP name jika di luar game
        if (!CefBridge.isAvailable()) {
            this.setUcpName('oogtaunama');
        }

        // Langsung fokus ke input password
        const loginPass = document.getElementById('loginPass');
        if (loginPass) {
            loginPass.focus();
        }
    },

    /**
     * Daftarkan listener event dari server (Pawn -> JS)
     */
    bindBridgeListeners() {
        // 1. Data UCP dari Server saat browser pertama kali dibuka
        CefBridge.on('setLoginData', (ucpName) => {
            console.log('[AuthApp] Menerima data UCP dari Pawn:', ucpName);
            this.setUcpName(ucpName);
        });

        // 2. Respon Gagal Login dari Server
        CefBridge.on('loginError', (msg) => {
            this.setButtonLoading('btnLoginSubmit', false);
            this.showToast(msg || 'Kata sandi tidak sesuai!', 'error');
            const passInput = document.getElementById('loginPass');
            if (passInput) {
                passInput.value = '';
                passInput.focus();
            }
        });

        // 3. Respon Sukses Login dari Server
        CefBridge.on('loginSuccess', () => {
            this.setButtonLoading('btnLoginSubmit', false);
            this.showToast('Login Berhasil! Memasuki server...', 'success');
        });

        CefBridge.on('server:onLoginResponse', (data) => {
            this.setButtonLoading('btnLoginSubmit', false);
            if (data && data.success) {
                this.showToast(data.message || 'Login berhasil!', 'success');
            } else {
                this.showToast(data ? data.message : 'Kata sandi tidak sesuai!', 'error');
                const passInput = document.getElementById('loginPass');
                if (passInput) {
                    passInput.value = '';
                    passInput.focus();
                }
            }
        });
    },

    /**
     * Set Nama UCP di Form
     */
    setUcpName(name) {
        if (!name) return;
        this.state.loggedUcp = name;
        const loginUcp = document.getElementById('loginUcp');
        if (loginUcp) loginUcp.value = name;
    },

    /**
     * Action: Submit Login Form -> Kirim ke Pawn
     */
    handleLogin() {
        const ucpInput = document.getElementById('loginUcp');
        const passInput = document.getElementById('loginPass');

        const username = this.state.loggedUcp || (ucpInput && ucpInput.value !== 'Loading UCP...' ? ucpInput.value.trim() : '');
        const password = passInput ? passInput.value.trim() : '';

        if (!password) {
            this.showToast('Kata sandi wajib diisi!', 'error');
            if (passInput) passInput.focus();
            return;
        }

        this.setButtonLoading('btnLoginSubmit', true);

        // Auto-reset tombol jika server lambat
        setTimeout(() => {
            this.setButtonLoading('btnLoginSubmit', false);
        }, 4000);

        // Kirim event ke Pawn via CEF Bridge
        console.log('[AuthApp] Mengirim password login ke Pawn...');
        CefBridge.emit('cef_onPlayerLoginSubmit', password);
        CefBridge.emit('client:onLoginSubmit', username || 'Player', password);
    },

    /**
     * Action: Tombol Keluar dari Game
     */
    handleQuit() {
        console.log('[AuthApp] Tombol keluar ditekan, meminta kick dari game...');
        CefBridge.emit('cef_onPlayerLoginQuit');
        CefBridge.emit('client:onQuitGame');
    },

    /**
     * Utility: Loading State pada Tombol
     */
    setButtonLoading(btnId, isLoading) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        btn.disabled = isLoading;
        if (isLoading) {
            btn.classList.add('loading');
        } else {
            btn.classList.remove('loading');
        }
    },

    /**
     * Utility: Toast Notification
     */
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'ℹ️';
        if (type === 'error') icon = '⚠️';
        if (type === 'success') icon = '✅';

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOutScale 0.25s forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 250);
        }, duration);
    }
};

// Inisialisasi saat dokumen siap
window.addEventListener('DOMContentLoaded', () => {
    AuthApp.init();
});
