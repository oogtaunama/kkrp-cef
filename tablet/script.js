/**
 * ============================================================================
 * KKRP TABLET SYSTEM - NoPixel 4.0 Dark Mode with Orange Accents
 * Kota Kecilku Roleplay - CEF Interface (open.mp / SA-MP)
 * ============================================================================
 */

'use strict';

/* ==========================================================================
   1. HIGH-FIDELITY SYNTHETIC AUDIO MANAGER (WEB AUDIO API)
   Zero external asset dependencies, zero network latency, 100% CEF compatible
   ========================================================================== */
class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.volume = 0.8;
        this.muted = false;
    }

    _getOrCreateContext() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    setVolume(pct) {
        this.volume = Math.max(0, Math.min(1, pct / 100));
    }

    setMuted(muted) {
        this.muted = !!muted;
    }

    // Suara klik tombol sentuh halus
    playClick() {
        if (this.muted || this.volume <= 0) return;
        try {
            const ctx = this._getOrCreateContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(650, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.035);

            gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.035);
        } catch (e) {}
    }

    // Suara unlock tablet (nada harmonis ganda naik)
    playUnlock() {
        if (this.muted || this.volume <= 0) return;
        try {
            const ctx = this._getOrCreateContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const freqs = [440, 660, 880];
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const startTime = now + (i * 0.04);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.18 * this.volume, startTime + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.12);
            });
        } catch (e) {}
    }

    // Suara lock / sleep tablet (nada turun lembut)
    playLock() {
        if (this.muted || this.volume <= 0) return;
        try {
            const ctx = this._getOrCreateContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const freqs = [700, 480, 260];
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const startTime = now + (i * 0.035);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.15 * this.volume, startTime + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.09);
            });
        } catch (e) {}
    }

    // Suara GPS Waypoint / Lacak Berhasil
    playWaypoint() {
        if (this.muted || this.volume <= 0) return;
        try {
            const ctx = this._getOrCreateContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(1040, now + 0.08);

            gain.gain.setValueAtTime(0.2 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.18);
        } catch (e) {}
    }

    // Suara Checkout Sukses / Pembelian Darkweb
    playSuccess() {
        if (this.muted || this.volume <= 0) return;
        try {
            const ctx = this._getOrCreateContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord
            chords.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const startTime = now + (i * 0.045);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.16 * this.volume, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.35);
            });
        } catch (e) {}
    }

    // Suara Peringatan / Gagal / Saldo Kurang
    playError() {
        if (this.muted || this.volume <= 0) return;
        try {
            const ctx = this._getOrCreateContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(120, now + 0.12);

            gain.gain.setValueAtTime(0.25 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        } catch (e) {}
    }
}

const AudioPlayer = new AudioSynthesizer();

/* ==========================================================================
   2. CORE TABLET APPLICATION CONTROLLER
   ========================================================================== */
class TabletController {
    constructor() {
        this.isOpen = false;
        this.isSleeping = false;
        this.currentApp = 'home';
        this.activeGpsTarget = null;
        this.volume = 80;
        this.dndEnabled = false;

        // Citizen profile data
        this.profile = {
            name: "Rey Simanjuntak",
            cash: 12500,
            bank: 74200,
            crypto: 0.148,
            phone: "0812-7789",
            ucp: "ReyS"
        };

        this.init();
    }

    init() {
        this._bindUIEvents();
        this._startClockTimer();
        this._loadSettingsFromStorage();
        this._setupCefListeners();

        // Standalone Preview Mode jika dibuka langsung di Browser biasa
        if (!this.isCefAvailable()) {
            console.log('[TABLET] Running in Standalone Browser Preview Mode.');
            setTimeout(() => {
                this.open({
                    name: "Rey Simanjuntak",
                    cash: 18500,
                    bank: 84000,
                    crypto: 0.225,
                    phone: "0812-3456",
                    ucp: "ReyS"
                }, [
                    { id: 1, modelName: "Sultan", modelId: 560, plate: "KKRP-778", health: 95, fuel: 82, status: "Di Luar", isSpawned: true },
                    { id: 2, modelName: "Elegy", modelId: 562, plate: "KKRP-104", health: 80, fuel: 55, status: "Di Garasi", isSpawned: false },
                    { id: 3, modelName: "Sanchez", modelId: 468, plate: "KKRP-992", health: 100, fuel: 90, status: "Di Garasi", isSpawned: false }
                ]);
            }, 300);
        }
    }

    isCefAvailable() {
        return (typeof cef !== 'undefined' && cef !== null) || 
               (typeof window.cef !== 'undefined' && window.cef !== null) ||
               (typeof CefBridge !== 'undefined' && CefBridge.isAvailable && CefBridge.isAvailable());
    }

    emit(eventName, ...args) {
        if (typeof CefBridge !== 'undefined' && typeof CefBridge.emit === 'function') {
            CefBridge.emit(eventName, ...args);
            return;
        }
        if (typeof cef !== 'undefined' && typeof cef.emit === 'function') {
            cef.emit(eventName, ...args);
            return;
        }
        if (typeof window.cef !== 'undefined' && typeof window.cef.emit === 'function') {
            window.cef.emit(eventName, ...args);
            return;
        }
        console.log(`[TABLET STANDALONE EMIT] Event: ${eventName}`, args);
    }

    _setupCefListeners() {
        // Beritahu game client bahwa CEF UI tablet sudah siap
        this.emit('tablet:ready');

        // Listener jika menggunakan CefBridge
        if (typeof CefBridge !== 'undefined' && typeof CefBridge.on === 'function') {
            CefBridge.on('tablet:open', (playerData, vehiclesData) => {
                this.open(playerData, vehiclesData);
            });
            CefBridge.on('tablet:updateVehicles', (vehiclesData) => {
                GarageApp.updateVehicles(vehiclesData);
            });
            CefBridge.on('tablet:gpsSetSuccess', (name, x, y, z) => {
                this.onGpsSetSuccess(name, x, y, z);
            });
            CefBridge.on('tablet:gpsCleared', () => {
                this.onGpsCleared();
            });
            CefBridge.on('tablet:buyResult', (success, messageOrName, qty, updatedPlayerJson) => {
                DarkwebApp.onBuyResult(success, messageOrName, qty, updatedPlayerJson);
            });
            CefBridge.on('tablet:trackResult', (success, info, x, y, z) => {
                GarageApp.onTrackResult(success, info, x, y, z);
            });
        }

        // Listener native window event fallback
        window.addEventListener('tablet:open', (e) => {
            const detail = e.detail || {};
            this.open(detail.player || detail[0], detail.vehicles || detail[1]);
        });
        window.addEventListener('tablet:updateVehicles', (e) => {
            const detail = e.detail || {};
            GarageApp.updateVehicles(detail.vehicles || detail[0] || detail);
        });
    }

    _bindUIEvents() {
        // Physical Buttons
        const powerBtn = document.getElementById('powerBtn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => {
                AudioPlayer.playClick();
                this.toggleSleep();
            });
        }

        const volUpBtn = document.getElementById('volUpBtn');
        if (volUpBtn) {
            volUpBtn.addEventListener('click', () => {
                this.adjustVolume(10);
            });
        }

        const volDownBtn = document.getElementById('volDownBtn');
        if (volDownBtn) {
            volDownBtn.addEventListener('click', () => {
                this.adjustVolume(-10);
            });
        }

        // Sleep screen overlay tap to unlock
        const sleepOverlay = document.getElementById('sleepOverlay');
        if (sleepOverlay) {
            sleepOverlay.addEventListener('click', () => {
                this.wakeUp();
            });
        }

        // Close button on status bar
        const btnCloseTablet = document.getElementById('btnCloseTablet');
        if (btnCloseTablet) {
            btnCloseTablet.addEventListener('click', () => {
                this.close();
            });
        }

        // ESC Key listener to close tablet
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (this.isOpen) {
                    this.close();
                }
            }
        });

        // Global click audio feedback on buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .app-icon-item, .dock-item, .chip-btn, .cbtn, .wall-preset-card');
            if (target && !target.classList.contains('no-sound')) {
                AudioPlayer.playClick();
            }
        });
    }

    _startClockTimer() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            const statusClock = document.getElementById('statusClock');
            if (statusClock) statusClock.textContent = timeStr;

            const sleepClock = document.getElementById('sleepClock');
            if (sleepClock) sleepClock.textContent = timeStr;

            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const sleepDate = document.getElementById('sleepDate');
            if (sleepDate) {
                sleepDate.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    _loadSettingsFromStorage() {
        try {
            const savedScale = localStorage.getItem('kkrp_tablet_scale');
            if (savedScale) SettingsApp.applyScale(parseInt(savedScale, 10));

            const savedWall = localStorage.getItem('kkrp_tablet_wall');
            if (savedWall) SettingsApp.applyWallpaper(savedWall);

            const savedDnd = localStorage.getItem('kkrp_tablet_dnd');
            if (savedDnd === 'true') SettingsApp.toggleDND(true);

            const savedVol = localStorage.getItem('kkrp_tablet_vol');
            if (savedVol) {
                this.volume = parseInt(savedVol, 10);
                AudioPlayer.setVolume(this.volume);
                const volSlider = document.getElementById('volumeSlider');
                if (volSlider) volSlider.value = this.volume;
                const volValBadge = document.getElementById('volValBadge');
                if (volValBadge) volValBadge.textContent = `${this.volume}%`;
            }
        } catch (e) {}
    }

    open(playerData, vehiclesData) {
        this.isOpen = true;
        this.isSleeping = false;
        document.body.style.display = 'flex';

        // Parse player data jika dalam format string JSON
        if (typeof playerData === 'string') {
            try { playerData = JSON.parse(playerData); } catch (e) {}
        }
        if (playerData) {
            this.updateProfile(playerData);
        }

        // Parse vehicle data
        if (typeof vehiclesData === 'string') {
            try { vehiclesData = JSON.parse(vehiclesData); } catch (e) {}
        }
        if (vehiclesData) {
            GarageApp.updateVehicles(vehiclesData);
        }

        // Tampilkan Home view secara default
        this.openApp('home', true);

        // Wakeup state
        const sleepOverlay = document.getElementById('sleepOverlay');
        if (sleepOverlay) sleepOverlay.classList.remove('active');

        // Play unlock chime
        AudioPlayer.playUnlock();

        if (typeof CefBridge !== 'undefined' && typeof CefBridge.setFocus === 'function') {
            CefBridge.setFocus(true);
        }
    }

    close() {
        AudioPlayer.playLock();
        this.isOpen = false;
        document.body.style.display = 'none';

        // Beritahu server Pawn bahwa tablet ditutup
        this.emit('tablet:close');

        if (typeof CefBridge !== 'undefined' && typeof CefBridge.setFocus === 'function') {
            CefBridge.setFocus(false);
        }
    }

    sleep() {
        this.isSleeping = true;
        AudioPlayer.playLock();
        const sleepOverlay = document.getElementById('sleepOverlay');
        if (sleepOverlay) sleepOverlay.classList.add('active');
    }

    wakeUp() {
        this.isSleeping = false;
        AudioPlayer.playUnlock();
        const sleepOverlay = document.getElementById('sleepOverlay');
        if (sleepOverlay) sleepOverlay.classList.remove('active');
    }

    toggleSleep() {
        if (this.isSleeping) {
            this.wakeUp();
        } else {
            this.sleep();
        }
    }

    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(100, this.volume + delta));
        AudioPlayer.setVolume(this.volume);
        AudioPlayer.playClick();

        // Update slider di settings
        const volSlider = document.getElementById('volumeSlider');
        if (volSlider) volSlider.value = this.volume;
        const volValBadge = document.getElementById('volValBadge');
        if (volValBadge) volValBadge.textContent = `${this.volume}%`;

        // Tampilkan HUD toast volume
        this.showVolumeHud(this.volume);

        try { localStorage.setItem('kkrp_tablet_vol', String(this.volume)); } catch (e) {}
    }

    showVolumeHud(pct) {
        const hud = document.getElementById('volumeHud');
        const fill = document.getElementById('volumeBarFill');
        const text = document.getElementById('volumeText');
        const icon = document.getElementById('volumeIcon');

        if (!hud || !fill || !text) return;

        fill.style.width = `${pct}%`;
        text.textContent = `${pct}%`;

        if (pct === 0) {
            icon.className = 'fa-solid fa-volume-xmark volume-icon text-muted';
        } else if (pct < 45) {
            icon.className = 'fa-solid fa-volume-low volume-icon text-orange';
        } else {
            icon.className = 'fa-solid fa-volume-high volume-icon text-orange';
        }

        hud.classList.add('visible');
        clearTimeout(this._volHudTimer);
        this._volHudTimer = setTimeout(() => {
            hud.classList.remove('visible');
        }, 1500);
    }

    updateProfile(data) {
        if (!data) return;
        this.profile = { ...this.profile, ...data };

        const elName = document.getElementById('citizenName');
        if (elName) elName.textContent = this.profile.name || "Warga Los Santos";

        const elUcp = document.getElementById('citizenUcp');
        if (elUcp) elUcp.textContent = `UCP: ${this.profile.ucp || "Player"} • No. HP: ${this.profile.phone || "0812-0001"}`;

        const elCash = document.getElementById('homeCash');
        if (elCash) elCash.textContent = `$${this._formatNumber(this.profile.cash || 0)}`;

        const elBank = document.getElementById('homeBank');
        if (elBank) elBank.textContent = `$${this._formatNumber(this.profile.bank || 0)}`;

        const elCrypto = document.getElementById('homeCrypto');
        if (elCrypto) elCrypto.textContent = `${(this.profile.crypto || 0).toFixed(4)} BTC`;

        const elDwCrypto = document.getElementById('darkwebCryptoBalance');
        if (elDwCrypto) elDwCrypto.textContent = `${(this.profile.crypto || 0).toFixed(4)} BTC`;
    }

    openApp(appName, skipSound = false) {
        if (!skipSound) AudioPlayer.playClick();
        this.currentApp = appName;

        // Sembunyikan semua screen view
        document.querySelectorAll('.screen-view').forEach(view => {
            view.classList.remove('active-view');
        });

        // Tampilkan view yang dipilih
        const viewMap = {
            home: 'viewHome',
            maps: 'viewMaps',
            darkweb: 'viewDarkweb',
            garage: 'viewGarage',
            settings: 'viewSettings',
            calc: 'viewCalc',
            news: 'viewNews'
        };

        const targetId = viewMap[appName] || 'viewHome';
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add('active-view');

        // Update Bottom Dock active dot
        document.querySelectorAll('.dock-item').forEach(item => {
            item.classList.remove('active');
        });
        const dockMap = {
            home: 'dockHome',
            maps: 'dockMaps',
            darkweb: 'dockDarkweb',
            garage: 'dockGarage',
            settings: 'dockSettings'
        };
        const activeDockId = dockMap[appName];
        if (activeDockId) {
            const activeDock = document.getElementById(activeDockId);
            if (activeDock) activeDock.classList.add('active');
        }
    }

    setGPS(name, x, y, z) {
        AudioPlayer.playWaypoint();
        this.activeGpsTarget = { name, x, y, z };

        // Kirim event ke Pawn Server open.mp
        this.emit('tablet:setGPS', parseFloat(x), parseFloat(y), parseFloat(z), String(name));

        this.onGpsSetSuccess(name, x, y, z);
    }

    onGpsSetSuccess(name, x, y, z) {
        this.activeGpsTarget = { name, x, y, z };

        // Update status bar icon
        const gpsIndicator = document.getElementById('gpsActiveIndicator');
        if (gpsIndicator) gpsIndicator.style.display = 'flex';

        // Update home screen active banner
        const homeBar = document.getElementById('homeActiveRouteBar');
        const homeName = document.getElementById('homeActiveRouteName');
        if (homeBar && homeName) {
            homeName.textContent = name;
            homeBar.style.display = 'flex';
        }

        // Highlight waypoint card
        MapsApp.highlightActiveCard(name);

        this.showToast("GPS Aktif", `Rute perjalanan menuju ${name} telah disematkan di peta radar!`, "success");
    }

    clearGPS() {
        AudioPlayer.playClick();
        this.activeGpsTarget = null;

        // Kirim event ke Pawn Server
        this.emit('tablet:clearGPS');

        this.onGpsCleared();
    }

    onGpsCleared() {
        this.activeGpsTarget = null;

        const gpsIndicator = document.getElementById('gpsActiveIndicator');
        if (gpsIndicator) gpsIndicator.style.display = 'none';

        const homeBar = document.getElementById('homeActiveRouteBar');
        if (homeBar) homeBar.style.display = 'none';

        MapsApp.highlightActiveCard(null);

        this.showToast("GPS Direset", "Rute waypoint radar telah dibersihkan.", "info");
    }

    showToast(title, message, type = "info") {
        if (this.dndEnabled) return; // Mode Jangan Ganggu aktif

        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-card toast-${type}`;

        const iconClass = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-bell');
        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    _formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}

/* ==========================================================================
   3. APP 1: MAPS & WAYPOINT
   ========================================================================== */
class MapsController {
    constructor() {
        this.activeFilter = 'all';
        this.searchQuery = '';

        // Katalog titik lokasi penting Kota Kecilku (GTA San Andreas open.mp coordinates)
        this.waypoints = [
            { id: 1, name: "Bank Central Fleeca", category: "finance", categoryLabel: "Finansial", icon: "fa-building-columns", x: 1458.2, y: -1014.5, z: 26.8, desc: "Pusat perbankan, setor tunai, & pembuatan rekening" },
            { id: 2, name: "Kantor Polisi Pusat SAPD", category: "security", categoryLabel: "Polisi & Medis", icon: "fa-shield-halved", x: 1554.8, y: -1675.6, z: 16.2, desc: "Markas Kepolisian Los Santos & pelayanan warga" },
            { id: 3, name: "Rumah Sakit Umum ASGH", category: "security", categoryLabel: "Polisi & Medis", icon: "fa-hospital", x: 1172.5, y: -1323.8, z: 15.4, desc: "Pelayanan rawat darurat SAMD & pengobatan medis" },
            { id: 4, name: "Kantor Samsat & DMV", category: "public", categoryLabel: "Layanan Publik", icon: "fa-id-card", x: 1109.3, y: -1796.3, z: 16.5, desc: "Pembuatan SIM Mengemudi & legalitas kendaraan" },
            { id: 5, name: "Dealer Mobil Los Santos", category: "auto", categoryLabel: "Otomotif", icon: "fa-car", x: 2131.7, y: -1150.8, z: 24.1, desc: "Showroom jual-beli kendaraan baru & bekas" },
            { id: 6, name: "Workshop Mekanik Idlewood", category: "auto", categoryLabel: "Otomotif", icon: "fa-wrench", x: 1980.2, y: -1774.5, z: 13.5, desc: "Reparasi mesin, pasang modifikasi & ganti warna" },
            { id: 7, name: "Balai Kota Los Santos (City Hall)", category: "public", categoryLabel: "Layanan Publik", icon: "fa-landmark", x: 1481.0, y: -1771.3, z: 18.8, desc: "Pusat pemerintahan kota, legalitas KTP, & izin usaha" },
            { id: 8, name: "Bandara Internasional LS", category: "public", categoryLabel: "Layanan Publik", icon: "fa-plane-departure", x: 1686.1, y: -2238.2, z: 13.5, desc: "Terminal kedatangan & landasan penerbangan pesawat" },
            { id: 9, name: "Pelabuhan Ocean Docks", category: "commerce", categoryLabel: "Bisnis", icon: "fa-ship", x: 2758.1, y: -2392.4, z: 13.6, desc: "Dermaga kargo kapal kontainer & industri laut" },
            { id: 10, name: "Toko Senjata Ammu-Nation", category: "commerce", categoryLabel: "Bisnis", icon: "fa-crosshairs", x: 1368.5, y: -1279.7, z: 13.5, desc: "Lisensi kepemilikan senjata resmi & amunisi berizin" },
            { id: 11, name: "Kasino Four Dragons LV", category: "commerce", categoryLabel: "Bisnis", icon: "fa-dice", x: 2026.5, y: 1007.8, z: 10.8, desc: "Pusat hiburan malam blackjack, poker & roulette" },
            { id: 12, name: "Pasar Tradisional Los Flores", category: "commerce", categoryLabel: "Bisnis", icon: "fa-shop", x: 2503.2, y: -1684.8, z: 13.5, desc: "Sentra bahan makanan segar & perdagangan warga" }
        ];

        this.render();
    }

    render() {
        const grid = document.getElementById('waypointsGrid');
        if (!grid) return;

        const filtered = this.waypoints.filter(wp => {
            const matchesCat = this.activeFilter === 'all' || wp.category === this.activeFilter;
            const matchesSearch = !this.searchQuery || 
                wp.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                wp.desc.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-dim);">
                    <i class="fa-solid fa-map-pin" style="font-size: 32px; opacity: 0.4; margin-bottom: 8px;"></i>
                    <p>Lokasi tidak ditemukan dalam pencarian.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(wp => {
            const isActive = TabletApp.activeGpsTarget && TabletApp.activeGpsTarget.name === wp.name;
            return `
                <div class="waypoint-card ${isActive ? 'is-active-gps' : ''}" data-name="${wp.name}">
                    <div class="wp-meta">
                        <div class="wp-icon-box">
                            <i class="fa-solid ${wp.icon}"></i>
                        </div>
                        <div>
                            <div class="wp-title">${wp.name}</div>
                            <div class="wp-category">${wp.categoryLabel}</div>
                            <div class="wp-coords">X: ${wp.x.toFixed(1)}, Y: ${wp.y.toFixed(1)}</div>
                        </div>
                    </div>
                    <button class="btn-set-gps ${isActive ? 'active-state' : ''}" onclick="TabletApp.setGPS('${wp.name}', ${wp.x}, ${wp.y}, ${wp.z})">
                        <i class="fa-solid ${isActive ? 'fa-check' : 'fa-location-arrow'}"></i>
                        <span>${isActive ? 'Aktif' : 'Set GPS'}</span>
                    </button>
                </div>
            `;
        }).join('');
    }

    filterCategory(cat, btn) {
        this.activeFilter = cat;
        document.querySelectorAll('#mapsCategoryChips .chip-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.render();
    }

    onSearch(query) {
        this.searchQuery = query.trim();
        this.render();
    }

    highlightActiveCard(name) {
        document.querySelectorAll('.waypoint-card').forEach(card => {
            const cardName = card.getAttribute('data-name');
            const btn = card.querySelector('.btn-set-gps');
            if (name && cardName === name) {
                card.classList.add('is-active-gps');
                if (btn) {
                    btn.classList.add('active-state');
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Aktif</span>`;
                }
            } else {
                card.classList.remove('is-active-gps');
                if (btn) {
                    btn.classList.remove('active-state');
                    btn.innerHTML = `<i class="fa-solid fa-location-arrow"></i> <span>Set GPS</span>`;
                }
            }
        });
    }
}

/* ==========================================================================
   4. APP 2: DARKWEB // ONION NETWORK (BLACKMARKET)
   ========================================================================== */
class DarkwebController {
    constructor() {
        this.cart = new Map(); // key: code, value: { item, qty }
        this.isProcessing = false;

        // Katalog Barang Ilegal Eksklusif
        this.items = [
            { code: "lockpick", name: "Advanced Lockpick", priceBtc: 0.015, priceUsd: 750, icon: "fa-key", desc: "Alat bobol kunci presisi tinggi untuk membuka pintu tanpa memicu alarm" },
            { code: "hacker_device", name: "Cyber Decrypt Pad", priceBtc: 0.045, priceUsd: 2250, icon: "fa-laptop-code", desc: "Perangkat peretas terminal bank, brankas ATM & enkripsi keamanan kota" },
            { code: "signal_jammer", name: "Police Radio Jammer", priceBtc: 0.060, priceUsd: 3000, icon: "fa-tower-broadcast", desc: "Pengacak frekuensi sinyal dispatch polisi dan kamera tilang ALPR" },
            { code: "thermite", name: "Thermite Compound", priceBtc: 0.080, priceUsd: 4000, icon: "fa-fire-flame-curved", desc: "Bahan peledak suhu termal ekstrem untuk melelehkan pintu brankas baja" },
            { code: "armor_vest", name: "Heavy Kevlar Vest", priceBtc: 0.050, priceUsd: 2500, icon: "fa-vest", desc: "Rompi antipeluru tebal standar taktis militer Grade IV" },
            { code: "medkit", name: "Trauma Adrenaline Kit", priceBtc: 0.020, priceUsd: 1000, icon: "fa-kit-medical", desc: "Injeksi medis darurat pemulih kondisi kritis di lapangan" },
            { code: "weapon_parts", name: "Micro SMG Frame Kit", priceBtc: 0.120, priceUsd: 6000, icon: "fa-gun", desc: "Komponen rahasia untuk merakit senjata api otomatis tak terlacak" },
            { code: "fake_id", name: "Fake Identity Card", priceBtc: 0.035, priceUsd: 1750, icon: "fa-id-badge", desc: "Identitas KTP palsu terselubung untuk penyamaran status sipil" }
        ];

        this.render();
    }

    render() {
        const grid = document.getElementById('darkwebItemsGrid');
        if (!grid) return;

        grid.innerHTML = this.items.map(item => `
            <div class="dw-item-card" id="dwItem_${item.code}">
                <div class="dw-item-top">
                    <div class="dw-item-icon">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div class="dw-item-info">
                        <h4>${item.name}</h4>
                        <p class="dw-item-desc">${item.desc}</p>
                    </div>
                </div>
                <div class="dw-item-pricing">
                    <span class="dw-btc">${item.priceBtc.toFixed(3)} BTC</span>
                    <span class="dw-usd">≈ $${TabletApp._formatNumber(item.priceUsd)} USD</span>
                </div>
                <div class="dw-item-actions">
                    <div class="qty-control">
                        <button class="btn-qty" onclick="DarkwebApp.changeCardQty('${item.code}', -1)">-</button>
                        <span class="qty-val" id="qtyVal_${item.code}">1</span>
                        <button class="btn-qty" onclick="DarkwebApp.changeCardQty('${item.code}', 1)">+</button>
                    </div>
                    <button class="btn-add-cart" onclick="DarkwebApp.addToCart('${item.code}')">
                        <i class="fa-solid fa-cart-plus"></i> Pesan
                    </button>
                </div>
            </div>
        `).join('');

        this.updateCartUI();
    }

    changeCardQty(code, delta) {
        const el = document.getElementById(`qtyVal_${code}`);
        if (!el) return;
        let val = parseInt(el.textContent, 10) || 1;
        val = Math.max(1, Math.min(20, val + delta));
        el.textContent = val;
    }

    addToCart(code) {
        const item = this.items.find(i => i.code === code);
        if (!item) return;

        const elQty = document.getElementById(`qtyVal_${code}`);
        const qty = elQty ? (parseInt(elQty.textContent, 10) || 1) : 1;

        if (this.cart.has(code)) {
            const current = this.cart.get(code);
            current.qty += qty;
        } else {
            this.cart.set(code, { item, qty });
        }

        AudioPlayer.playClick();
        this.updateCartUI();
        TabletApp.showToast("Item Ditambahkan", `${qty}x ${item.name} dimasukkan ke keranjang transaksi anonim.`, "info");
    }

    removeFromCart(code) {
        if (this.cart.has(code)) {
            this.cart.delete(code);
            AudioPlayer.playClick();
            this.updateCartUI();
        }
    }

    clearCart() {
        this.cart.clear();
        AudioPlayer.playClick();
        this.updateCartUI();
    }

    toggleCart() {
        const cartCol = document.getElementById('dwCartCol');
        if (cartCol) {
            cartCol.classList.toggle('collapsed');
        }
    }

    updateCartUI() {
        const listEl = document.getElementById('cartItemsList');
        const badgeEl = document.getElementById('cartCountBadge');
        const subtotalEl = document.getElementById('cartSubtotalBtc');
        const totalBtcEl = document.getElementById('cartTotalBtc');
        const totalUsdEl = document.getElementById('cartTotalUsd');
        const checkoutBtn = document.getElementById('btnCheckout');

        let totalQty = 0;
        let subtotalBtc = 0;
        let subtotalUsd = 0;

        this.cart.forEach(({ item, qty }) => {
            totalQty += qty;
            subtotalBtc += item.priceBtc * qty;
            subtotalUsd += item.priceUsd * qty;
        });

        if (badgeEl) badgeEl.textContent = totalQty;

        const gasFeeBtc = totalQty > 0 ? 0.001 : 0;
        const finalBtc = subtotalBtc + gasFeeBtc;
        const finalUsd = subtotalUsd + (totalQty > 0 ? 50 : 0);

        if (subtotalEl) subtotalEl.textContent = `${subtotalBtc.toFixed(3)} BTC`;
        if (totalBtcEl) totalBtcEl.textContent = `${finalBtc.toFixed(3)} BTC`;
        if (totalUsdEl) totalUsdEl.textContent = `≈ $${TabletApp._formatNumber(finalUsd)} USD`;

        if (checkoutBtn) {
            checkoutBtn.disabled = totalQty === 0 || this.isProcessing;
        }

        if (!listEl) return;

        if (totalQty === 0) {
            listEl.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>Keranjang masih kosong.</p>
                    <span>Pilih item rahasia dari katalog untuk memesan.</span>
                </div>
            `;
            return;
        }

        let html = '';
        this.cart.forEach(({ item, qty }) => {
            const itemTotalBtc = (item.priceBtc * qty).toFixed(3);
            html += `
                <div class="cart-row-item">
                    <div class="cri-left">
                        <h5>${item.name}</h5>
                        <span>${qty}x • ${itemTotalBtc} BTC</span>
                    </div>
                    <div class="cri-right">
                        <button class="btn-remove-item" onclick="DarkwebApp.removeFromCart('${item.code}')" title="Hapus">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        listEl.innerHTML = html;
    }

    checkout() {
        if (this.cart.size === 0 || this.isProcessing) return;

        let totalCostUsd = 0;
        let totalCostBtc = 0;
        let totalItems = 0;
        let firstItemCode = "";
        let firstItemQty = 0;

        this.cart.forEach(({ item, qty }) => {
            totalCostUsd += (item.priceUsd * qty);
            totalCostBtc += (item.priceBtc * qty);
            totalItems += qty;
            if (!firstItemCode) {
                firstItemCode = item.code;
                firstItemQty = qty;
            }
        });

        // Tambah gas fee
        totalCostUsd += 50;
        totalCostBtc += 0.001;

        // Validasi ketersediaan saldo
        const availableFunds = Math.max(TabletApp.profile.bank, TabletApp.profile.cash);
        if (availableFunds < totalCostUsd) {
            AudioPlayer.playError();
            TabletApp.showToast("Saldo Kurang", `Saldo Anda ($${TabletApp._formatNumber(availableFunds)}) tidak mencukupi untuk total belanja $${TabletApp._formatNumber(totalCostUsd)}.`, "error");
            return;
        }

        this.isProcessing = true;
        const checkoutBtn = document.getElementById('btnCheckout');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengenkripsi Jalur Tor...`;
        }

        // Kirim event pembelian ke Server Pawn open.mp
        // Argumen: itemCode, totalQuantity, totalCostUsd
        TabletApp.emit('tablet:buyDarkweb', String(firstItemCode), parseInt(totalItems, 10), parseInt(totalCostUsd, 10));

        // Fallback untuk Standalone Browser Preview jika tidak ada server
        if (!TabletApp.isCefAvailable()) {
            setTimeout(() => {
                this.onBuyResult(true, "Paket Gelap", totalItems, {
                    ...TabletApp.profile,
                    bank: Math.max(0, TabletApp.profile.bank - totalCostUsd),
                    crypto: Math.max(0, TabletApp.profile.crypto - totalCostBtc)
                });
            }, 1200);
        }
    }

    onBuyResult(success, messageOrName, qty, updatedPlayerJson) {
        this.isProcessing = false;
        const checkoutBtn = document.getElementById('btnCheckout');
        if (checkoutBtn) {
            checkoutBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Selesaikan Transaksi Enkripsi`;
        }

        if (success) {
            AudioPlayer.playSuccess();
            this.cart.clear();
            this.updateCartUI();

            if (typeof updatedPlayerJson === 'string') {
                try { updatedPlayerJson = JSON.parse(updatedPlayerJson); } catch (e) {}
            }
            if (updatedPlayerJson) {
                TabletApp.updateProfile(updatedPlayerJson);
            }

            TabletApp.showToast("Pesanan Berhasil", `Pembelian ${qty || 1}x barang pasar gelap berhasil dikonfirmasi! Barang telah masuk ke tas.`, "success");
        } else {
            AudioPlayer.playError();
            TabletApp.showToast("Transaksi Gagal", messageOrName || "Gagal memproses transaksi darkweb.", "error");
            this.updateCartUI();
        }
    }
}

/* ==========================================================================
   5. APP 3: GARASI KENDARAAN (FLEET MANAGER)
   ========================================================================== */
class GarageController {
    constructor() {
        this.activeFilter = 'all';
        this.vehicles = [];
    }

    updateVehicles(data) {
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { data = []; }
        }
        this.vehicles = Array.isArray(data) ? data : [];
        this.render();
    }

    requestRefresh() {
        AudioPlayer.playClick();
        TabletApp.emit('tablet:requestVehicles');
        TabletApp.showToast("Memperbarui Data", "Memuat daftar kendaraan terbaru dari server...", "info");
    }

    filter(type, btn) {
        this.activeFilter = type;
        document.querySelectorAll('.vehicle-filter-tabs .vtab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.render();
    }

    render() {
        const grid = document.getElementById('vehiclesGrid');
        const badgeEl = document.getElementById('badgeVehCount');
        const totalEl = document.getElementById('garageTotalVehicles');
        const spawnedEl = document.getElementById('garageSpawnedCount');
        const parkedEl = document.getElementById('garageParkedCount');

        const totalCount = this.vehicles.length;
        const spawnedCount = this.vehicles.filter(v => v.isSpawned || v.status === "Di Luar").length;
        const parkedCount = totalCount - spawnedCount;

        if (badgeEl) badgeEl.textContent = totalCount;
        if (totalEl) totalEl.textContent = totalCount;
        if (spawnedEl) spawnedEl.textContent = spawnedCount;
        if (parkedEl) parkedEl.textContent = parkedCount;

        if (!grid) return;

        const filtered = this.vehicles.filter(v => {
            if (this.activeFilter === 'spawned') return v.isSpawned || v.status === "Di Luar";
            if (this.activeFilter === 'parked') return !v.isSpawned && v.status !== "Di Luar";
            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="garage-empty-state">
                    <i class="fa-solid fa-warehouse"></i>
                    <p>Tidak ada kendaraan dalam kategori ini.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(v => {
            const isSpawned = v.isSpawned || v.status === "Di Luar";
            const health = Math.max(0, Math.min(100, v.health !== undefined ? v.health : 100));
            const fuel = Math.max(0, Math.min(100, v.fuel !== undefined ? v.fuel : 85));

            let healthClass = "fill-health";
            if (health < 40) healthClass = "fill-health danger";
            else if (health < 75) healthClass = "fill-health warn";

            const statusClass = isSpawned ? "status-spawned" : (v.status === "Impounded" ? "status-impound" : "status-parked");
            const statusLabel = isSpawned ? "Di Luar (Aktif)" : (v.status || "Di Garasi");

            return `
                <div class="vehicle-card" id="vehCard_${v.id}">
                    <div class="veh-card-header">
                        <div class="veh-title-box">
                            <h3>${v.modelName || 'Kendaraan'}</h3>
                            <span class="veh-plate-badge">${v.plate || 'KKRP-000'}</span>
                        </div>
                        <div class="veh-status-chip ${statusClass}">
                            <i class="fa-solid ${isSpawned ? 'fa-circle-dot' : 'fa-warehouse'}"></i>
                            <span>${statusLabel}</span>
                        </div>
                    </div>

                    <div class="veh-meters">
                        <div class="meter-row">
                            <span><i class="fa-solid fa-gauge-high"></i> Mesin:</span>
                            <div class="meter-bar-bg">
                                <div class="${healthClass}" style="width: ${health}%;"></div>
                            </div>
                            <span>${health}%</span>
                        </div>
                        <div class="meter-row">
                            <span><i class="fa-solid fa-gas-pump"></i> Bensin:</span>
                            <div class="meter-bar-bg">
                                <div class="meter-bar-fill fill-fuel" style="width: ${fuel}%;"></div>
                            </div>
                            <span>${fuel}%</span>
                        </div>
                    </div>

                    <div class="veh-actions">
                        <button class="btn-track-veh" onclick="GarageApp.trackVehicle(${v.id}, '${v.modelName}')">
                            <i class="fa-solid fa-crosshairs"></i> Lacak Posisi (GPS)
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    trackVehicle(id, name) {
        AudioPlayer.playWaypoint();
        TabletApp.emit('tablet:trackVehicle', parseInt(id, 10));

        // Fallback untuk Standalone Preview
        if (!TabletApp.isCefAvailable()) {
            this.onTrackResult(true, `Kendaraan ${name} ditemukan di peta.`);
        }
    }

    onTrackResult(success, info, x, y, z) {
        if (success) {
            AudioPlayer.playWaypoint();
            TabletApp.showToast("Lacak Berhasil", info || "Lokasi kendaraan telah ditandai di radar GPS Anda!", "success");
            const gpsIndicator = document.getElementById('gpsActiveIndicator');
            if (gpsIndicator) gpsIndicator.style.display = 'flex';
        } else {
            AudioPlayer.playError();
            TabletApp.showToast("Gagal Melacak", info || "Posisi kendaraan tidak dapat dilacak.", "error");
        }
    }
}

/* ==========================================================================
   6. APP 4: PENGATURAN (SETTINGS)
   ========================================================================== */
class SettingsController {
    setWallpaper(preset, cardEl) {
        this.applyWallpaper(preset);
        document.querySelectorAll('.wall-preset-card').forEach(c => c.classList.remove('active'));
        if (cardEl) cardEl.classList.add('active');

        try { localStorage.setItem('kkrp_tablet_wall', preset); } catch (e) {}
        TabletApp.showToast("Wallpaper Diubah", `Tema latar belakang diatur ke ${preset}.`, "info");
    }

    applyWallpaper(preset) {
        const screen = document.getElementById('tabletScreen');
        if (!screen) return;

        screen.className = 'tablet-screen';
        screen.classList.add(`wallpaper-${preset}`);

        document.querySelectorAll('.wall-preset-card').forEach(c => {
            if (c.getAttribute('data-wall') === preset) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });
    }

    onScaleChange(val) {
        const num = parseInt(val, 10) || 100;
        this.applyScale(num);
        try { localStorage.setItem('kkrp_tablet_scale', String(num)); } catch (e) {}
    }

    applyScale(pct) {
        const clamped = Math.max(85, Math.min(115, pct));
        document.documentElement.style.setProperty('--tablet-scale', clamped / 100);

        const slider = document.getElementById('uiScaleSlider');
        if (slider) slider.value = clamped;

        const badge = document.getElementById('scaleValBadge');
        if (badge) badge.textContent = `${clamped}%`;
    }

    resetScale() {
        this.applyScale(100);
        try { localStorage.removeItem('kkrp_tablet_scale'); } catch (e) {}
        TabletApp.showToast("Skala Direset", "Ukuran tampilan tablet kembali normal 100%.", "info");
    }

    toggleDND(enabled) {
        TabletApp.dndEnabled = !!enabled;
        const badge = document.getElementById('dndBadge');
        if (badge) badge.style.display = enabled ? 'inline-block' : 'none';

        const dndToggle = document.getElementById('dndToggle');
        if (dndToggle) dndToggle.checked = enabled;

        try { localStorage.setItem('kkrp_tablet_dnd', String(enabled)); } catch (e) {}
        TabletApp.showToast("Mode Senyap", enabled ? "Mode Jangan Ganggu diaktifkan." : "Mode normal diaktifkan.", "info");
    }

    onVolumeChange(val) {
        const num = parseInt(val, 10) || 80;
        TabletApp.adjustVolume(num - TabletApp.volume);
    }
}

/* ==========================================================================
   7. APP 5: KALKULATOR TOOLS
   ========================================================================== */
class CalculatorController {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.resetNext = false;
    }

    num(digit) {
        if (this.currentValue === '0' || this.resetNext) {
            this.currentValue = digit;
            this.resetNext = false;
        } else {
            if (this.currentValue.length < 12) {
                this.currentValue += digit;
            }
        }
        this._updateUI();
    }

    dot() {
        if (this.resetNext) {
            this.currentValue = '0.';
            this.resetNext = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this._updateUI();
    }

    op(operator) {
        if (this.operation && !this.resetNext) {
            this.equals();
        }
        this.previousValue = this.currentValue;
        this.operation = operator;
        this.resetNext = true;
        this._updateUI();
    }

    equals() {
        if (!this.operation || !this.previousValue) return;

        const a = parseFloat(this.previousValue);
        const b = parseFloat(this.currentValue);
        let result = 0;

        switch (this.operation) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = b !== 0 ? (a / b) : 'Error'; break;
            case '%': result = (a * b) / 100; break;
        }

        if (typeof result === 'number') {
            result = Math.round(result * 10000) / 10000;
        }

        this.currentValue = String(result);
        this.previousValue = '';
        this.operation = null;
        this.resetNext = true;
        this._updateUI();
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.resetNext = false;
        this._updateUI();
    }

    del() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this._updateUI();
    }

    _updateUI() {
        const display = document.getElementById('calcDisplay');
        const history = document.getElementById('calcHistory');
        if (display) display.textContent = this.currentValue;
        if (history) {
            history.textContent = this.operation ? `${this.previousValue} ${this.operation}` : '';
        }
    }
}

// Global Singletons
const TabletApp = new TabletController();
const MapsApp = new MapsController();
const DarkwebApp = new DarkwebController();
const GarageApp = new GarageController();
const SettingsApp = new SettingsController();
const CalcApp = new CalculatorController();

window.TabletApp = TabletApp;
window.MapsApp = MapsApp;
window.DarkwebApp = DarkwebApp;
window.GarageApp = GarageApp;
window.SettingsApp = SettingsApp;
window.CalcApp = CalcApp;
