/**
 * Character Management Controller (Selector & Creator)
 * Kota Kecilku Roleplay
 */

const CharApp = {
    state: {
        characters: [],
        maxChars: 3,
        ucpName: '',
        selectedGender: 'Male',
        targetSlot: 0,
        isLoading: false,
        pendingDelete: null
    },

    init() {
        console.log('[CharApp] Inisialisasi Modul Character Selector & Creator.');

        // 1. Minta CEF focus & cursor aktif
        CefBridge.setFocus(true);

        this.bindBridgeEvents();
        this.bindStaticEvents();

        // Mode Dev Preview di luar game
        if (!CefBridge.isAvailable()) {
            this.loadMockData();
        }
    },

    loadMockData() {
        this.renderCharacterList({
            characters: ['Xyper_William'],
            maxChars: 3,
            ucp: 'oogtaunama'
        });
    },

    bindStaticEvents() {
        const form = document.getElementById('formCreateChar');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.submitCreateCharacter();
            });
        }

        const btnSubmit = document.getElementById('btnSubmitChar');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.submitCreateCharacter();
            });
        }

        const btnBack = document.querySelector('.create-actions .btn-outline');
        if (btnBack) {
            btnBack.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.switchView('selector');
            });
        }

        document.addEventListener('click', () => {
            CefBridge.setFocus(true);
        });
    },

    bindBridgeEvents() {
        // 1. Menerima list karakter dari Pawn
        CefBridge.on('setCharListData', (payload) => {
            console.log('[CharApp] Menerima data karakter dari server:', payload);
            let data = payload;
            if (typeof payload === 'string') {
                try {
                    data = JSON.parse(payload);
                } catch (e) {
                    data = {};
                }
            }
            this.renderCharacterList(data);
            CefBridge.setFocus(true);
        });

        // 2. Menerima respon error dari server
        CefBridge.on('charError', (msg) => {
            this.setButtonLoading('btnSubmitChar', false);
            this.showToast(msg || 'Terjadi kesalahan pada karakter!', 'error');
        });

        // 3. Menerima konfirmasi sukses pembuatan karakter
        CefBridge.on('charCreateSuccess', (charName) => {
            this.setButtonLoading('btnSubmitChar', false);
            this.showToast(`Karakter ${charName} berhasil dibuat! Memasuki kota...`, 'success');
        });
    },

    /**
     * Render daftar karakter ke UI Grid
     */
    renderCharacterList(data) {
        const characters = data.characters || [];
        const maxChars = data.maxChars || 3;
        const ucp = data.ucp || '';

        this.state.characters = characters;
        this.state.maxChars = maxChars;
        this.state.ucpName = ucp;

        // Update Counter Label
        const charCountLabel = document.getElementById('charCountLabel');
        if (charCountLabel) {
            charCountLabel.innerText = `${characters.length} / ${maxChars} characters`;
        }

        const grid = document.getElementById('cardsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        for (let i = 0; i < maxChars; i++) {
            const charName = characters[i];
            const card = document.createElement('div');

            if (charName && charName.trim() !== '') {
                // KARTU TERISI KARAKTER
                card.className = 'char-card filled-card';
                card.innerHTML = `
                    <div class="card-top">
                        <div class="card-emblem">
                            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>
                        <div class="card-info">
                            <div class="card-title">${charName.replace('_', ' ')}</div>
                            <div class="card-subtitle">SLOT ${i + 1} • WARGA</div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button type="button" class="btn btn-primary btn-spawn" data-slot="${i}" data-name="${charName}">
                            Spawn
                        </button>
                        <button type="button" class="btn btn-danger-outline btn-delete" data-slot="${i}" data-name="${charName}">
                            Hapus
                        </button>
                    </div>
                `;

                // Pasang event listener langsung pada tombol Spawn & Hapus
                const btnSpawn = card.querySelector('.btn-spawn');
                if (btnSpawn) {
                    btnSpawn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectCharacter(i, charName);
                    });
                }

                const btnDelete = card.querySelector('.btn-delete');
                if (btnDelete) {
                    btnDelete.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.deleteCharacter(i, charName);
                    });
                }

            } else {
                // KARTU SLOT KOSONG / CREATE NEW
                card.className = 'char-card empty-card';
                card.innerHTML = `
                    <div class="card-top">
                        <div class="pattern-plus-wrap">
                            <span class="pattern-plus">+</span>
                            <span class="pattern-plus">+</span>
                            <span class="pattern-plus">+</span>
                            <span class="pattern-plus">+</span>
                            <span class="pattern-plus">+</span>
                            <span class="pattern-plus">+</span>
                        </div>
                        <div class="card-info">
                            <div class="card-title">Create new</div>
                            <div class="card-subtitle">SLOT ${i + 1} KOSONG</div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button type="button" class="btn btn-outline btn-select" data-slot="${i}">
                            Select
                        </button>
                    </div>
                `;

                const btnSelect = card.querySelector('.btn-select');
                if (btnSelect) {
                    btnSelect.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.openCreateChar(i);
                    });
                }
            }

            grid.appendChild(card);
        }
    },

    /**
     * Pilih Karakter untuk Spawn
     */
    selectCharacter(slotIndex, charName) {
        console.log(`[CharApp] Memilih karakter slot ${slotIndex}: ${charName}`);
        this.showToast(`Memuat data karakter ${charName}...`, 'info');
        CefBridge.emit('cef_onPlayerSelectChar', slotIndex, charName);
    },

    /**
     * Hapus Karakter (Tanpa window.confirm yang dapat mem-freeze CEF OSR)
     */
    deleteCharacter(slotIndex, charName) {
        if (this.state.pendingDelete === charName) {
            // Klik kedua kalinya -> konfirmasi hapus!
            this.state.pendingDelete = null;
            console.log(`[CharApp] Mengonfirmasi hapus karakter: ${charName}`);
            this.showToast(`Menghapus karakter ${charName.replace('_', ' ')}...`, 'warning');
            CefBridge.emit('cef_onPlayerDeleteChar', slotIndex, charName);
        } else {
            // Klik pertama -> minta konfirmasi via toast
            this.state.pendingDelete = charName;
            this.showToast(`Klik HAPUS sekali lagi untuk konfirmasi penghapusan ${charName.replace('_', ' ')}!`, 'error', 5000);
            setTimeout(() => {
                if (this.state.pendingDelete === charName) {
                    this.state.pendingDelete = null;
                }
            }, 5000);
        }
    },

    /**
     * Buka Modal Create Character
     */
    openCreateChar(slotIndex) {
        this.state.targetSlot = slotIndex;
        this.switchView('create');
        const firstName = document.getElementById('charFirstName');
        if (firstName) firstName.focus();
    },

    /**
     * Toggle View Antara Selector & Create
     */
    switchView(viewName) {
        const viewSelector = document.getElementById('viewSelector');
        const viewCreate = document.getElementById('viewCreate');

        if (viewName === 'create') {
            if (viewSelector) viewSelector.style.display = 'none';
            if (viewCreate) viewCreate.style.display = 'flex';
        } else {
            if (viewCreate) viewCreate.style.display = 'none';
            if (viewSelector) viewSelector.style.display = 'flex';
        }
        CefBridge.setFocus(true);
    },

    /**
     * Set Pilihan Gender (Male / Female)
     */
    setGender(gender) {
        this.state.selectedGender = gender;
        const btnMale = document.getElementById('btnGenderMale');
        const btnFemale = document.getElementById('btnGenderFemale');

        if (gender === 'Male') {
            if (btnMale) btnMale.classList.add('active');
            if (btnFemale) btnFemale.classList.remove('active');
        } else {
            if (btnFemale) btnFemale.classList.add('active');
            if (btnMale) btnMale.classList.remove('active');
        }
    },

    /**
     * Submit Form Pembuatan Karakter
     */
    submitCreateCharacter() {
        const firstInput = document.getElementById('charFirstName');
        const lastInput = document.getElementById('charLastName');
        const dobInput = document.getElementById('charDob');
        const originInput = document.getElementById('charOrigin');
        const heightInput = document.getElementById('charHeight');
        const weightInput = document.getElementById('charWeight');

        const firstName = firstInput ? firstInput.value.trim() : '';
        const lastName = lastInput ? lastInput.value.trim() : '';
        const dob = dobInput ? dobInput.value.trim() : '';
        const origin = originInput ? originInput.value.trim() : 'Indonesia';
        const height = heightInput ? parseInt(heightInput.value, 10) : 175;
        const weight = weightInput ? parseInt(weightInput.value, 10) : 70;
        const gender = this.state.selectedGender === 'Male' ? 1 : 2;

        // Validasi Nama
        const nameRegex = /^[A-Z][a-z]+$/;
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            this.showToast('Nama harus diawali huruf kapital tanpa spasi/simbol! Cth: Rey Simanjuntak', 'error');
            return;
        }

        const fullName = `${firstName}_${lastName}`;
        if (fullName.length < 3 || fullName.length > 24) {
            this.showToast('Total panjang nama harus antara 3 - 24 karakter!', 'error');
            return;
        }

        // Validasi Format Tanggal Lahir (hh/bb/tttt)
        const dobRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if (!dobRegex.test(dob)) {
            this.showToast('Format tanggal lahir harus hh/bb/tttt! Cth: 25/08/2000', 'error');
            return;
        }

        this.setButtonLoading('btnSubmitChar', true);

        console.log('[CharApp] Mengirim data karakter baru ke Pawn:', {
            fullName, dob, origin, height, weight, gender
        });

        // Kirim event ke Pawn via CEF Bridge
        CefBridge.emit('cef_onPlayerCreateChar', firstName, lastName, dob, origin, height, weight, gender);
    },

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

window.addEventListener('DOMContentLoaded', () => {
    CharApp.init();
});
