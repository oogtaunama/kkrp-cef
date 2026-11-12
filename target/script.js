/**
 * ============================================================================
 * OXTARGET CEF CONTROLLER - KOTA KECILKU ROLEPLAY (open.mp)
 * 3D Targeting & Interaction System (FiveM / NoPixel 4.0 Style)
 * Theme: Orange & Light Orange Cyber Aesthetic
 * ============================================================================
 */

(function () {
    'use strict';

    // ========================================================================
    // 1. WEB AUDIO SYNTHESIZER (ZERO-LATENCY SOUND EFFECTS)
    // ========================================================================
    const SoundFx = {
        ctx: null,

        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
        },

        playLockOn() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                
                // Tone 1: High crisp blip
                const osc1 = this.ctx.createOscillator();
                const gain1 = this.ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(620, now);
                osc1.frequency.exponentialRampToValueAtTime(940, now + 0.08);
                gain1.gain.setValueAtTime(0.12, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc1.connect(gain1);
                gain1.connect(this.ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.1);

                // Tone 2: Futuristic confirmation harmonic
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(880, now + 0.03);
                osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
                gain2.gain.setValueAtTime(0.08, now + 0.03);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.start(now + 0.03);
                osc2.stop(now + 0.14);
            } catch (e) {}
        },

        playHover() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1050, now);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.03);
            } catch (e) {}
        },

        playSelect() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(740, now);
                osc.frequency.exponentialRampToValueAtTime(1180, now + 0.09);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } catch (e) {}
        }
    };


    // ========================================================================
    // 2. CORE OXTARGET CONTROLLER
    // ========================================================================
    class OxTargetController {
        constructor() {
            // DOM Elements
            this.root = document.getElementById('targetRoot');
            this.reticleWrapper = document.getElementById('reticleWrapper');
            this.targetCard = document.getElementById('targetCard');
            this.targetCategory = document.getElementById('targetCategory');
            this.categoryIcon = document.getElementById('categoryIcon');
            this.categoryText = document.getElementById('categoryText');
            this.targetDistance = document.getElementById('targetDistance');
            this.distanceText = document.getElementById('distanceText');
            this.targetTitle = document.getElementById('targetTitle');
            this.optionsList = document.getElementById('optionsList');
            this.devToolbar = document.getElementById('devToolbar');

            // Internal State
            this.isTargetModeActive = true;
            this.currentTarget = null;
            this.options = [];

            // Category Icon Mapping
            this.categoryIcons = {
                vehicle: 'fa-car',
                player: 'fa-user',
                atm: 'fa-money-bill-wave',
                object: 'fa-cube',
                garbage: 'fa-trash-can',
                gaspump: 'fa-gas-pump',
                door: 'fa-door-open',
                shop: 'fa-store',
                job: 'fa-briefcase'
            };

            this._init();
        }

        _init() {
            // Register Keyboard Listeners (Hotkeys [1-9], ESC, ALT)
            window.addEventListener('keydown', (e) => this._handleKeyDown(e));

            // Init CEF Bridge Events
            this._setupCefBridge();

            // Check if running inside CEF Game or Standalone Browser
            if (typeof CefBridge !== 'undefined' && !CefBridge.isAvailable()) {
                if (this.devToolbar) {
                    this.devToolbar.classList.remove('hidden');
                }
                console.log('%c[OxTarget] Running in Standalone Preview Mode (Orange Theme Active)', 'color: #ff9800; font-weight: bold;');
                // Default test vehicle target
                setTimeout(() => {
                    MockTarget.vehicle();
                }, 400);
            } else {
                console.log('%c[OxTarget] Initialized inside open.mp Game Client Engine', 'color: #10b981; font-weight: bold;');
            }
        }

        _setupCefBridge() {
            if (typeof CefBridge === 'undefined') return;

            // Notify server that CEF OxTarget UI is fully loaded
            CefBridge.emit('cef_onTargetReady');

            // 1. Show / Open Target Mode
            CefBridge.on('target:show', () => {
                this.showTargetMode();
            });

            // 2. Hide / Close Target Mode
            CefBridge.on('target:hide', () => {
                this.hideTargetMode();
            });

            // 3. Set Target (Active Lock-On on Entity)
            CefBridge.on('target:setTarget', (payload) => {
                let data = payload;
                if (typeof payload === 'string') {
                    try {
                        data = JSON.parse(payload);
                    } catch (e) {
                        console.error('[OxTarget] JSON Parse error on setTarget:', e);
                        return;
                    }
                }
                this.setTarget(data);
            });

            // 4. Clear Target (Entity out of sight / range, back to idle reticle)
            CefBridge.on('target:clearTarget', () => {
                this.clearTarget();
            });
        }

        /**
         * Mengaktifkan tampilan OxTarget (Reticle muncul di tengah layar)
         */
        showTargetMode() {
            this.isTargetModeActive = true;
            if (this.root) this.root.classList.remove('hidden');
            this.clearTarget(); // Mulai dari idle dot
        }

        /**
         * Menutup tampilan OxTarget
         */
        hideTargetMode() {
            this.isTargetModeActive = false;
            this.clearTarget();
            if (this.root) this.root.classList.add('hidden');
        }

        /**
         * Menetapkan target yang sedang disorot kamera
         * @param {Object} data 
         */
        setTarget(data) {
            if (!data) return;

            // Hindari re-render jika data target sama persis
            if (this.currentTarget && this.currentTarget.type === data.type && this.currentTarget.id === data.id) {
                // Update jarak saja jika ada
                if (data.distance && this.distanceText) {
                    this.distanceText.textContent = data.distance;
                }
                return;
            }

            this.currentTarget = data;
            this.options = Array.isArray(data.options) ? data.options : [];

            // 1. Ubah Reticle ke mode Aktif (Mata bercahaya oranye)
            if (this.reticleWrapper) {
                this.reticleWrapper.classList.add('target-active');
            }

            // 2. Putar efek audio lock-on
            SoundFx.playLockOn();

            // 3. Render Header Kartu
            const categoryKey = (data.category || data.type || 'object').toLowerCase();
            const iconClass = data.categoryIcon || this.categoryIcons[categoryKey] || 'fa-crosshairs';
            
            if (this.categoryIcon) {
                this.categoryIcon.className = `fa-solid ${iconClass}`;
            }
            if (this.categoryText) {
                this.categoryText.textContent = (data.category || data.type || 'OBJEK').toUpperCase();
            }
            if (this.distanceText) {
                this.distanceText.textContent = data.distance || '2.0m';
            }
            if (this.targetTitle) {
                this.targetTitle.textContent = data.title || 'Objek Interaktif';
            }

            // 4. Render Opsi Aksi Interaktif
            this._renderOptions(this.options);

            // 5. Tampilkan Kartu Interaksi
            if (this.targetCard) {
                this.targetCard.classList.remove('hidden');
            }

            // Focus kursor mouse ke CEF agar pemain bisa langsung klik opsi
            if (typeof CefBridge !== 'undefined' && typeof CefBridge.setFocus === 'function') {
                CefBridge.setFocus(true);
            }
        }

        /**
         * Menghapus target aktif (kamera tidak lagi menyorot objek interaktif)
         */
        clearTarget() {
            this.currentTarget = null;
            this.options = [];

            // Kembalikan reticle ke mode idle
            if (this.reticleWrapper) {
                this.reticleWrapper.classList.remove('target-active');
            }

            // Sembunyikan kartu interaksi
            if (this.targetCard) {
                this.targetCard.classList.add('hidden');
            }

            if (this.optionsList) {
                this.optionsList.innerHTML = '';
            }
        }

        /**
         * Render tombol opsi interaksi
         * @param {Array} options 
         */
        _renderOptions(options) {
            if (!this.optionsList) return;
            this.optionsList.innerHTML = '';

            if (!options || options.length === 0) {
                const emptyItem = document.createElement('div');
                emptyItem.className = 'target-option-btn';
                emptyItem.innerHTML = `
                    <div class="option-icon-box"><i class="fa-solid fa-circle-info"></i></div>
                    <div class="option-content">
                        <div class="option-label">Tidak ada tindakan</div>
                        <div class="option-desc">Objek tidak memiliki opsi lanjutan</div>
                    </div>
                `;
                this.optionsList.appendChild(emptyItem);
                return;
            }

            options.forEach((opt, index) => {
                const btn = document.createElement('div');
                btn.className = 'target-option-btn';
                btn.setAttribute('data-index', index);
                btn.style.animationDelay = `${index * 0.05}s`;

                const optIcon = opt.icon || 'fa-hand';
                const keyBadge = opt.key || `${index + 1}`;

                btn.innerHTML = `
                    <div class="option-icon-box">
                        <i class="fa-solid ${optIcon}"></i>
                    </div>
                    <div class="option-content">
                        <div class="option-label">${opt.label || 'Interaksi'}</div>
                        ${opt.desc ? `<div class="option-desc">${opt.desc}</div>` : ''}
                    </div>
                    <div class="target-key-badge">${keyBadge}</div>
                `;

                // Hover Sound
                btn.addEventListener('mouseenter', () => {
                    SoundFx.playHover();
                });

                // Click Action
                btn.addEventListener('click', () => {
                    this.selectOption(index);
                });

                this.optionsList.appendChild(btn);
            });
        }

        /**
         * Eksekusi pemilihan opsi
         * @param {number} index 
         */
        selectOption(index) {
            if (!this.options || !this.options[index] || !this.currentTarget) return;

            const selectedOption = this.options[index];

            // Efek suara & visual klik
            SoundFx.playSelect();

            const buttons = this.optionsList.querySelectorAll('.target-option-btn');
            if (buttons[index]) {
                buttons[index].classList.add('selected');
            }

            console.log(`[OxTarget] Selected Option: ${selectedOption.label} (Action: ${selectedOption.action}) on ${this.currentTarget.type}:${this.currentTarget.id}`);

            // Kirim event ke Server open.mp (Pawn)
            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit(
                    'cef_onTargetSelect',
                    this.currentTarget.type || 'object',
                    parseInt(this.currentTarget.id, 10) || 0,
                    parseInt(selectedOption.id, 10) || index,
                    selectedOption.action || selectedOption.label || ''
                );
            }

            // Opsi: Tutup target mode setelah aksi dipilih jika disetting
            if (selectedOption.closeOnSelect !== false) {
                setTimeout(() => {
                    this.closeTargetMode();
                }, 180);
            }
        }

        /**
         * Tutup target mode sepenuhnya
         */
        closeTargetMode() {
            this.clearTarget();
            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onTargetClose');
                if (typeof CefBridge.setFocus === 'function') {
                    CefBridge.setFocus(false);
                }
            }
        }

        /**
         * Handle keyboard shortcut ([1-9], ESC, ALT)
         */
        _handleKeyDown(e) {
            // Tutup jika tekan ESC atau ALT
            if (e.key === 'Escape' || e.key === 'Alt') {
                e.preventDefault();
                this.closeTargetMode();
                return;
            }

            // Jika kartu interaksi sedang tampil, izinkan pemilihan dengan angka 1 - 9
            if (this.currentTarget && this.options && this.options.length > 0) {
                const num = parseInt(e.key, 10);
                if (!isNaN(num) && num >= 1 && num <= this.options.length) {
                    e.preventDefault();
                    this.selectOption(num - 1);
                }
            }
        }
    }


    // ========================================================================
    // 3. MOCK TARGET SAMPLES FOR DEV & PREVIEW TESTING
    // ========================================================================
    window.MockTarget = {
        vehicle() {
            window.oxTargetInstance.setTarget({
                type: 'vehicle',
                id: 15,
                title: 'Karin Sultan [ID: 15]',
                category: 'KENDARAAN',
                categoryIcon: 'fa-car',
                distance: '2.1m',
                options: [
                    { id: 1, action: 'veh_lock', label: 'Buka / Kunci Pintu', desc: 'Beralih status kunci kendaraan', icon: 'fa-lock', key: '1' },
                    { id: 2, action: 'veh_trunk', label: 'Buka Bagasi (Trunk)', desc: 'Akses kompartemen penyimpanan bagasi', icon: 'fa-box-open', key: '2' },
                    { id: 3, action: 'veh_hood', label: 'Periksa Kap Mesin', desc: 'Membuka kap mesin untuk perbaikan', icon: 'fa-screwdriver-wrench', key: '3' },
                    { id: 4, action: 'veh_engine', label: 'Nyalakan / Matikan Mesin', desc: 'Mengontrol starter mesin kendaraan', icon: 'fa-key', key: '4' },
                    { id: 5, action: 'veh_refuel', label: 'Isi Bahan Bakar', desc: 'Mengisi tangki bensin kendaraan', icon: 'fa-gas-pump', key: '5' }
                ]
            });
        },

        player() {
            window.oxTargetInstance.setTarget({
                type: 'player',
                id: 3,
                title: 'Alex Ferguson [ID: 3]',
                category: 'WARGA',
                categoryIcon: 'fa-user',
                distance: '1.5m',
                options: [
                    { id: 1, action: 'player_greet', label: 'Sapa & Bicara', desc: 'Lakukan interaksi salam secara santai', icon: 'fa-comments', key: '1' },
                    { id: 2, action: 'player_money', label: 'Beri Uang Tunai', desc: 'Kirim sejumlah uang ke warga ini', icon: 'fa-hand-holding-dollar', key: '2' },
                    { id: 3, action: 'player_idcard', label: 'Periksa Identitas (KTP)', desc: 'Melihat kartu tanda penduduk', icon: 'fa-id-card', key: '3' },
                    { id: 4, action: 'player_handshake', label: 'Jabat Tangan', desc: 'Berjabat tangan tanda perkenalan', icon: 'fa-handshake', key: '4' },
                    { id: 5, action: 'player_frisk', label: 'Geledah Barang', desc: 'Memeriksa barang bawaan (Polisi / Faction)', icon: 'fa-magnifying-glass', key: '5' }
                ]
            });
        },

        atm() {
            window.oxTargetInstance.setTarget({
                type: 'object',
                id: 2942,
                title: 'Mesin ATM Los Santos',
                category: 'PERBANKAN',
                categoryIcon: 'fa-money-bill-wave',
                distance: '1.2m',
                options: [
                    { id: 1, action: 'atm_withdraw', label: 'Tarik Uang Tunai', desc: 'Tarik saldo dari rekening tabungan', icon: 'fa-money-bill-transfer', key: '1' },
                    { id: 2, action: 'atm_deposit', label: 'Setor Uang Tunai', desc: 'Simpan uang tunai ke dalam bank', icon: 'fa-piggy-bank', key: '2' },
                    { id: 3, action: 'atm_balance', label: 'Cek Saldo Rekening', desc: 'Lihat ringkasan mutasi dan saldo', icon: 'fa-receipt', key: '3' }
                ]
            });
        },

        garbage() {
            window.oxTargetInstance.setTarget({
                type: 'object',
                id: 1337,
                title: 'Tempat Sampah Publik',
                category: 'OBJEK',
                categoryIcon: 'fa-trash-can',
                distance: '1.4m',
                options: [
                    { id: 1, action: 'garbage_search', label: 'Cari Barang Bekas', desc: 'Mencari botol, plastik, atau barang daur ulang', icon: 'fa-magnifying-glass', key: '1' },
                    { id: 2, action: 'garbage_dump', label: 'Buang Sampah', desc: 'Membersihkan kantong dari barang sisa', icon: 'fa-trash', key: '2' }
                ]
            });
        },

        gaspump() {
            window.oxTargetInstance.setTarget({
                type: 'object',
                id: 1676,
                title: 'Pom Bensin SPBU Idlewood',
                category: 'STASIUN BBM',
                categoryIcon: 'fa-gas-pump',
                distance: '2.0m',
                options: [
                    { id: 1, action: 'pump_refuel_veh', label: 'Isi Tangki Kendaraan', desc: 'Isi bensin kendaraan terdekat', icon: 'fa-car', key: '1' },
                    { id: 2, action: 'pump_buy_jerrycan', label: 'Beli Jeriken Bensin', desc: 'Beli jeriken isi 10 liter', icon: 'fa-flask', key: '2' }
                ]
            });
        },

        clear() {
            window.oxTargetInstance.clearTarget();
        }
    };


    // ========================================================================
    // 4. INSTANTIATE ON DOM READY
    // ========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        window.oxTargetInstance = new OxTargetController();
    });

})();
