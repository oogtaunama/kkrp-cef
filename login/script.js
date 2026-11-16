/**
 * ==========================================================================
 * LOGIKA FRONTEND MODUL LOGIN & CHARACTER SELECTION
 * Kota Kecilku Roleplay / open.mp CEF Frontend
 * ==========================================================================
 */

const AuthApp = {
    // State Aplikasi
    state: {
        currentView: 'viewLogin',
        selectedGender: 'male',
        selectedCharId: null,
        characters: [],
        maxSlots: 3,
        loggedUcp: '',
        isLoading: false
    },

    /**
     * Inisialisasi awal saat DOM siap
     */
    init() {
        console.log('[AuthApp] Inisialisasi modul Auth & Character Selection.');

        this.bindBridgeListeners();

        // Mode Browser Dev: isi mock UCP name jika tidak berjalan di dalam game
        if (!CefBridge.isAvailable()) {
            this.setUcpName('Arya_Pratama');
            this.showToast('Mode Browser Dev: Akun UCP terkunci (Mock Server Aktif).', 'info', 5000);
        }

        // Langsung fokus ke input password karena nama UCP terkunci (readonly)
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

        // 2. Respon Login dari Server
        CefBridge.on('server:onLoginResponse', (data) => {
            this.setButtonLoading('btnLoginSubmit', false);

            if (data.success) {
                this.showToast(data.message || 'Login berhasil! Memuat karakter...', 'success');
                if (data.ucpName) this.setUcpName(data.ucpName);
            } else {
                this.showToast(data.message || 'Gagal login. Periksa kembali sandi Anda.', 'error');
                const passInput = document.getElementById('loginPass');
                if (passInput) {
                    passInput.value = '';
                    passInput.focus();
                }
            }
        });

        // Dukungan fallback untuk event bawaan KKRP (account_cef_login.inc)
        CefBridge.on('loginError', (msg) => {
            this.setButtonLoading('btnLoginSubmit', false);
            this.showToast(msg || 'Kata sandi tidak sesuai!', 'error');
            const passInput = document.getElementById('loginPass');
            if (passInput) {
                passInput.value = '';
                passInput.focus();
            }
        });

        CefBridge.on('loginSuccess', () => {
            this.setButtonLoading('btnLoginSubmit', false);
            this.showToast('Login Berhasil!', 'success');
        });

        // 3. Muat Data Karakter (Character Selection)
        CefBridge.on('server:onLoadCharacters', (payload) => {
            console.log('[AuthApp] Menerima daftar karakter:', payload);
            const chars = payload.characters || [];
            this.state.characters = chars;
            this.state.maxSlots = payload.maxSlots || 3;

            this.renderCharacterCards();
            this.switchView('viewCharacters');
        });

        // 4. Respon Registrasi
        CefBridge.on('server:onRegisterResponse', (data) => {
            this.setButtonLoading('btnRegisterSubmit', false);

            if (data.success) {
                this.showToast(data.message || 'Registrasi akun berhasil!', 'success');
                // Pindah ke form login dan auto-fill username
                setTimeout(() => {
                    this.switchView('viewLogin');
                }, 1000);
            } else {
                this.showToast(data.message || 'Registrasi gagal. Username mungkin sudah digunakan.', 'error');
            }
        });

        // 5. Respon Forgot Password
        CefBridge.on('server:onForgotResponse', (data) => {
            this.setButtonLoading('btnForgotSubmit', false);
            this.closeModal('modalForgot');
            this.showToast(data.message || 'Permintaan pemulihan telah dikirim!', 'info', 5000);
        });

        // 6. Konfirmasi Karakter Berhasil di-Spawn
        CefBridge.on('server:onSpawnSuccess', (data) => {
            this.showToast('Karakter siap masuk dunia GTA!', 'success');
            // Server biasanya akan menutup browser CEF via CEF_DestroyBrowser atau menyembunyikannya
        });
    },

    /**
     * Set Nama UCP di Form dan Nav
     */
    setUcpName(name) {
        if (!name) return;
        this.state.loggedUcp = name;
        const loginUcp = document.getElementById('loginUcp');
        const charUcp = document.getElementById('charViewUcpName');
        if (loginUcp) loginUcp.value = name;
        if (charUcp) charUcp.innerText = name;
    },

    /**
     * Mengganti Layar Tampilan (Login / Register / Characters)
     */
    switchView(targetViewId) {
        const views = ['viewLogin', 'viewRegister', 'viewCharacters'];

        views.forEach((vId) => {
            const el = document.getElementById(vId);
            if (el) {
                if (vId === targetViewId) {
                    el.style.display = (vId === 'viewCharacters') ? 'flex' : 'block';
                    el.style.animation = 'fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                } else {
                    el.style.display = 'none';
                }
            }
        });

        this.state.currentView = targetViewId;
    },

    /**
     * Buka Modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    /**
     * Tutup Modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Toggle Lihat / Sembunyikan Password
     */
    togglePasswordVisibility(inputId, btnElement) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        if (btnElement) {
            btnElement.style.color = isPassword ? 'var(--primary-light)' : 'var(--text-dark)';
        }
    },

    /**
     * Pemilihan Gender pada Layar Register
     */
    selectGender(gender, element) {
        this.state.selectedGender = gender;
        document.querySelectorAll('.gender-card').forEach((card) => {
            card.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
            const radio = element.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        }
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

        // Kirim event ke Pawn via CEF Bridge
        CefBridge.emit('cef_onPlayerLoginSubmit', password);
        CefBridge.emit('client:onLoginSubmit', username || 'Player', password);
    },

    /**
     * Action: Submit Register Form -> Kirim ke Pawn
     */
    handleRegister() {
        const ucp = document.getElementById('regUcp').value.trim();
        const dob = document.getElementById('regDob').value;
        const pass = document.getElementById('regPass').value;
        const confirmPass = document.getElementById('regConfirmPass').value;
        const gender = this.state.selectedGender;

        if (!ucp || ucp.length < 3) {
            this.showToast('Nama UCP minimal 3 karakter!', 'error');
            return;
        }

        if (!dob) {
            this.showToast('Silakan pilih tanggal lahir Anda!', 'error');
            return;
        }

        if (pass.length < 6) {
            this.showToast('Kata sandi minimal 6 karakter!', 'error');
            return;
        }

        if (pass !== confirmPass) {
            this.showToast('Konfirmasi kata sandi tidak cocok!', 'error');
            return;
        }

        this.setButtonLoading('btnRegisterSubmit', true);

        const payload = {
            username: ucp,
            password: pass,
            gender: gender,
            dob: dob
        };

        // Kirim ke server
        CefBridge.emit('client:onRegisterSubmit', payload);
    },

    /**
     * Action: Submit Forgot Password
     */
    handleForgotPassword() {
        const input = document.getElementById('forgotIdentifier');
        const val = input ? input.value.trim() : '';

        if (!val) {
            this.showToast('Silakan masukkan nama UCP atau email Anda.', 'error');
            return;
        }

        this.setButtonLoading('btnForgotSubmit', true);
        CefBridge.emit('client:onForgotPassword', val);
    },

    /**
     * Action: Tombol Keluar dari Game
     */
    handleQuit() {
        CefBridge.emit('client:onQuitGame');
        CefBridge.emit('cef_onPlayerLoginQuit');
    },

    /**
     * Render Kartu Karakter ke Grid
     */
    renderCharacterCards() {
        const grid = document.getElementById('charGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const chars = this.state.characters;

        // Render karakter yang sudah ada
        chars.forEach((c) => {
            const isSelected = c.id === this.state.selectedCharId;
            const card = document.createElement('div');
            card.className = `char-card ${isSelected ? 'active' : ''}`;
            card.onclick = () => this.selectCharacter(c.id);

            // Placeholder avatar atau skin image GTA
            const skinAvatar = c.skinId 
                ? `https://assets.open.mp/images/skins/${c.skinId}.png`
                : null;

            card.innerHTML = `
                <div class="char-card-header">
                    <div class="char-avatar-box">
                        ${skinAvatar 
                            ? `<img src="${skinAvatar}" class="char-avatar-img" alt="Skin ${c.skinId}" onerror="this.src=''; this.innerHTML='👤';">` 
                            : `<div style="font-size: 32px;">👤</div>`}
                    </div>
                    <div class="char-card-body">
                        <h3>${c.name}</h3>
                        <span class="char-badge-job">${c.job || 'Warga Sipil'} • Lvl ${c.level || 1}</span>
                    </div>
                </div>

                <div class="char-stats-table">
                    <div class="stat-row">
                        <span class="stat-label">Uang Tunai:</span>
                        <span class="stat-value money">$${(c.money || 0).toLocaleString()}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Saldo Bank:</span>
                        <span class="stat-value">$${(c.bank || 0).toLocaleString()}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Terakhir Main:</span>
                        <span class="stat-value">${c.lastPlayed || 'Baru'}</span>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        // Slot Kosong (Create New Character Slot)
        const emptySlotsCount = Math.max(0, this.state.maxSlots - chars.length);
        for (let i = 0; i < emptySlotsCount; i++) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'char-card char-card-empty';
            emptyCard.onclick = () => this.handleCreateCharacterSlot();
            emptyCard.innerHTML = `
                <div class="empty-slot-icon">+</div>
                <h4 class="empty-slot-title">Buat Karakter Baru</h4>
                <p class="empty-slot-desc">Slot Karakter Tersedia (${chars.length + i + 1}/${this.state.maxSlots})</p>
            `;
            grid.appendChild(emptyCard);
        }

        // Otomatis pilih karakter pertama jika belum ada yang dipilih
        if (chars.length > 0 && !this.state.selectedCharId) {
            this.selectCharacter(chars[0].id);
        }
    },

    /**
     * Pilih Karakter Tertentu
     */
    selectCharacter(charId) {
        this.state.selectedCharId = charId;
        const selected = this.state.characters.find(c => c.id === charId);

        // Update highlight kartu
        document.querySelectorAll('.char-card').forEach((card, idx) => {
            if (this.state.characters[idx] && this.state.characters[idx].id === charId) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update Action Bar Bawah
        const summaryName = document.getElementById('summaryCharName');
        const btnSpawn = document.getElementById('btnSpawnCharacter');

        if (selected) {
            if (summaryName) summaryName.innerText = `${selected.name} (${selected.job || 'Warga Sipil'})`;
            if (btnSpawn) btnSpawn.disabled = false;
        }
    },

    /**
     * Action: Spawn Karakter ke Open.mp Game World
     */
    handleSpawnCharacter() {
        if (!this.state.selectedCharId) {
            this.showToast('Pilih salah satu karakter terlebih dahulu!', 'error');
            return;
        }

        const selected = this.state.characters.find(c => c.id === this.state.selectedCharId);
        this.showToast(`Memasuki dunia game sebagai ${selected ? selected.name : 'Karakter'}...`, 'info');

        // Kirim event pilih karakter ke server
        CefBridge.emit('client:onSelectCharacter', this.state.selectedCharId);
    },

    /**
     * Action: Buat Karakter Baru
     */
    handleCreateCharacterSlot() {
        this.showToast('Membuka pembuatan karakter baru...', 'info');
        CefBridge.emit('client:onCreateCharacterSlot');
    },

    /**
     * Action: Kembali / Ganti Akun
     */
    handleSwitchAccount() {
        this.switchView('viewLogin');
        this.state.selectedCharId = null;
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
     * Utility: Toast Notification Glassmorphism
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

// Start application
window.addEventListener('DOMContentLoaded', () => {
    AuthApp.init();
});
