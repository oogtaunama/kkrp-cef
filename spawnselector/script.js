/**
 * ============================================================================
 * KKRP SPAWN SELECTOR CONTROLLER - NoPixel 4.0 Dark Orange Style
 * Kota Kecilku Roleplay - CEF Interface (open.mp / SA-MP)
 * ============================================================================
 */

'use strict';

/* ==========================================================================
   1. HIGH FIDELITY SYNTHETIC AUDIO MANAGER (WEB AUDIO API)
   Zero external asset dependencies, 100% CEF compatible
   ========================================================================== */
class SpawnAudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.volume = 0.75;
    }

    _getContext() {
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

    // Suara hover kartu (crisp futuristic tick)
    playHover() {
        try {
            const ctx = this._getContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(820, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.035);

            gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.035);
        } catch (e) {}
    }

    // Suara pilih kartu lokasi (harmonic dual tone)
    playSelect() {
        try {
            const ctx = this._getContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            [540, 810].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + (idx * 0.03));
                osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + (idx * 0.03) + 0.06);

                gain.gain.setValueAtTime(0.18 * this.volume, now + (idx * 0.03));
                gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.03) + 0.07);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + (idx * 0.03));
                osc.stop(now + (idx * 0.03) + 0.07);
            });
        } catch (e) {}
    }

    // Suara whoosh konfirmasi spawn (cinematic low-frequency sweep + resonance)
    playWhoosh() {
        try {
            const ctx = this._getContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Low cinematic whoosh dive
            osc.type = 'sine';
            osc.frequency.setValueAtTime(380, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.42);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.35 * this.volume, now + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            // Sub bass layer
            const subOsc = ctx.createOscillator();
            const subGain = ctx.createGain();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(140, now);
            subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

            subGain.gain.setValueAtTime(0.25 * this.volume, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            subOsc.connect(subGain);
            subGain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.46);
            subOsc.start(now);
            subOsc.stop(now + 0.46);
        } catch (e) {}
    }
}

const audioSynth = new SpawnAudioSynthesizer();

/* ==========================================================================
   2. CEF EVENT BRIDGE HELPER
   ========================================================================== */
function emitToGame(eventName, ...args) {
    console.log(`[CEF Spawn] Emitting: ${eventName}`, args);

    if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.emit === 'function') {
        CefBridge.emit(eventName, ...args);
        return true;
    }
    if (typeof cef !== 'undefined' && cef && typeof cef.emit === 'function') {
        cef.emit(eventName, ...args);
        return true;
    }
    if (typeof window.cef !== 'undefined' && window.cef && typeof window.cef.emit === 'function') {
        window.cef.emit(eventName, ...args);
        return true;
    }
    console.warn('[CEF Spawn] CEF Bridge not detected (Standalone Browser Mode)');
    return false;
}

function registerGameEvent(eventName, callback) {
    if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.on === 'function') {
        CefBridge.on(eventName, callback);
    }
    if (typeof cef !== 'undefined' && cef && typeof cef.on === 'function') {
        cef.on(eventName, callback);
    }
    if (typeof window.cef !== 'undefined' && window.cef && typeof window.cef.on === 'function') {
        window.cef.on(eventName, callback);
    }
}

/* ==========================================================================
   3. SPAWN DATA MODEL & DEFAULT FALLBACKS
   ========================================================================== */
const DEFAULT_LOCATIONS = [
    {
        id: 0,
        title: "Bandara International",
        subtitle: "Anda akan spawn di Bandara International LS",
        icon: "icon-plane",
        badge: "[PUBLIK]",
        badgeType: "subtle",
        enabled: true,
        isLastLoc: false,
        extraInfo: "Bandara LS"
    },
    {
        id: 1,
        title: "Faction",
        subtitle: "Anda akan spawn di markas Faction",
        icon: "icon-faction",
        badge: "[FRAKSI]",
        badgeType: "neon-orange",
        enabled: false,
        isLastLoc: false,
        extraInfo: "Markas Faction"
    },
    {
        id: 2,
        title: "Property",
        subtitle: "Anda akan spawn di Property pribadi",
        icon: "icon-house",
        badge: "[PROPERTI]",
        badgeType: "neon-orange",
        enabled: false,
        isLastLoc: false,
        extraInfo: "Property Pribadi"
    },
    {
        id: 3,
        title: "Last Location",
        subtitle: "Anda akan spawn di Last Location (< 60 Menit)",
        icon: "icon-pin",
        badge: "[TERAKHIR AKTIF]",
        badgeType: "neon-orange",
        enabled: false,
        isLastLoc: true,
        extraInfo: "Last Position"
    }
];

class SpawnSelectorManager {
    constructor() {
        this.locations = [...DEFAULT_LOCATIONS];
        this.selectedLocationId = null;
        this.playerData = {
            name: "Warga KKRP",
            hasLastLoc: false,
            isPolice: false,
            hasHouse: false,
            houseName: "Belum Memiliki Properti"
        };

        this.cardsContainer = document.getElementById('spawnCardsContainer');
        this.btnConfirm = document.getElementById('btnSpawnConfirm');
        this.previewTitle = document.getElementById('previewLocationTitle');
        this.previewDesc = document.getElementById('previewLocationDesc');
        this.playerNameDisplay = document.getElementById('playerNameDisplay');
        this.playerAvatarInitial = document.getElementById('playerAvatarInitial');
        this.playerStatusDisplay = document.getElementById('playerStatusDisplay');

        this.initEventListeners();
    }

    initEventListeners() {
        // Confirm Button Click
        this.btnConfirm.addEventListener('click', () => {
            this.handleConfirmSpawn();
        });

        // Keyboard Shortcut: Enter to Confirm
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.btnConfirm.disabled) {
                this.handleConfirmSpawn();
            }
        });
    }

    // Set Data Player dari Server Pawn
    setPlayerData(data) {
        if (!data) return;
        this.playerData = Object.assign(this.playerData, data);

        if (this.playerNameDisplay) {
            this.playerNameDisplay.textContent = this.playerData.name || "Karakter KKRP";
        }
        if (this.playerAvatarInitial && this.playerData.name) {
            this.playerAvatarInitial.textContent = this.playerData.name.charAt(0).toUpperCase();
        }
        if (this.playerStatusDisplay) {
            this.playerStatusDisplay.textContent = this.playerData.statusText || "Pilih Lokasi Kedatangan";
        }
    }

    // Update Daftar Lokasi dari Server Pawn
    updateLocations(locationsList) {
        if (Array.isArray(locationsList) && locationsList.length > 0) {
            this.locations = locationsList;
        }
        this.renderCards();
    }

    // Render Semua Kartu Lokasi ke DOM
    renderCards() {
        if (!this.cardsContainer) return;
        this.cardsContainer.innerHTML = '';

        this.locations.forEach((loc) => {
            const card = document.createElement('div');
            card.className = `spawn-card ${loc.enabled ? '' : 'card-disabled'}`;
            card.dataset.id = loc.id;

            // Badge class
            let badgeClass = 'badge-subtle';
            if (loc.badgeType === 'neon-orange') {
                badgeClass = 'badge-neon-orange';
            } else if (!loc.enabled) {
                badgeClass = 'badge-locked';
            }

            card.innerHTML = `
                <div class="card-icon-box">
                    <svg viewBox="0 0 24 24"><use href="#${loc.icon || 'icon-pin'}"></use></svg>
                </div>
                <div class="card-details">
                    <div class="card-top-row">
                        <span class="card-title">${loc.title}</span>
                        <span class="card-badge ${badgeClass}">${loc.badge || ''}</span>
                    </div>
                    <span class="card-desc">${loc.subtitle || ''}</span>
                </div>
                <div class="card-indicator">
                    <svg viewBox="0 0 24 24"><use href="#icon-check"></use></svg>
                </div>
            `;

            // Hover SFX
            card.addEventListener('mouseenter', () => {
                if (loc.enabled && this.selectedLocationId !== loc.id) {
                    audioSynth.playHover();
                }
            });

            // Click Handler
            card.addEventListener('click', () => {
                if (!loc.enabled) return;
                this.selectLocation(loc.id);
            });

            this.cardsContainer.appendChild(card);
        });

        // Otomatis pilih lokasi pertama yang enabled (misal Last Loc jika aktif, atau Bandara)
        const preferredLoc = this.locations.find(l => l.enabled && l.isLastLoc) ||
                             this.locations.find(l => l.enabled);
        if (preferredLoc) {
            this.selectLocation(preferredLoc.id, false);
        }
    }

    // Pilih Salah Satu Lokasi
    selectLocation(locationId, playSound = true) {
        const targetLoc = this.locations.find(l => l.id === locationId);
        if (!targetLoc || !targetLoc.enabled) return;

        this.selectedLocationId = locationId;

        if (playSound) {
            audioSynth.playSelect();
        }

        // Update visual active card
        const allCards = this.cardsContainer.querySelectorAll('.spawn-card');
        allCards.forEach(card => {
            if (parseInt(card.dataset.id, 10) === locationId) {
                card.classList.add('card-active');
            } else {
                card.classList.remove('card-active');
            }
        });

        // Update preview label & button state
        if (this.previewTitle) {
            this.previewTitle.textContent = targetLoc.title;
        }
        if (this.previewDesc) {
            this.previewDesc.textContent = targetLoc.subtitle || "Lokasi kedatangan telah terpilih.";
        }
        if (this.btnConfirm) {
            this.btnConfirm.disabled = false;
        }

        // Kirim event preview kamera ke Pawn server ingame!
        emitToGame('spawn:previewCamera', locationId);
    }

    // Konfirmasi Spawn
    handleConfirmSpawn() {
        if (this.selectedLocationId === null || this.btnConfirm.disabled) return;

        const selectedLoc = this.locations.find(l => l.id === this.selectedLocationId);
        if (!selectedLoc || !selectedLoc.enabled) return;

        // Kunci tombol agar tidak dobel klik
        this.btnConfirm.disabled = true;

        // Putar suara whoosh sinematik
        audioSynth.playWhoosh();

        // Tambahkan efek animasi keluar halus
        document.body.classList.add('spawn-exiting');

        // Lepas fokus & kursor CEF segera sebelum berpindah ke dunia game
        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.setFocus === 'function') {
            CefBridge.setFocus(false);
        } else if (typeof cef !== 'undefined' && cef && typeof cef.set_focus === 'function') {
            cef.set_focus(false);
        } else if (typeof window.cef !== 'undefined' && window.cef && typeof window.cef.set_focus === 'function') {
            window.cef.set_focus(false);
        }

        // Kirim event konfirmasi ke server Pawn
        emitToGame('spawn:confirm', this.selectedLocationId);
    }
}

// Inisialisasi Instance Manager
const spawnManager = new SpawnSelectorManager();

// Initial Render default fallback
spawnManager.renderCards();

// ============================================================================
// LISTENER EVENT DARI SERVER PAWN (open.mp)
// ============================================================================

// 1. Event: spawn:show
// Payload format JSON:
// {
//    "name": "Rey_Simanjuntak",
//    "hasLastLoc": true,
//    "isPolice": false,
//    "hasHouse": true,
//    "houseName": "Rumah Mulholland #12",
//    "locations": [ ... ]
// }
registerGameEvent('spawn:show', (jsonPayload) => {
    console.log('[CEF Spawn] Received spawn:show payload:', jsonPayload);
    try {
        let data = jsonPayload;
        if (typeof jsonPayload === 'string') {
            data = JSON.parse(jsonPayload);
        }

        if (data.name) {
            spawnManager.setPlayerData({
                name: data.name,
                hasLastLoc: !!data.hasLastLoc,
                isPolice: !!data.isPolice,
                hasHouse: !!data.hasHouse,
                houseName: data.houseName || "Properti Pribadi",
                statusText: data.statusText || "Status: Menunggu Konfirmasi"
            });
        }

        if (Array.isArray(data.locations)) {
            spawnManager.updateLocations(data.locations);
        }
    } catch (e) {
        console.error('[CEF Spawn] Error parsing spawn:show payload:', e);
    }
});

// 2. Beritahu Pawn bahwa frontend CEF sudah selesai dimuat & siap
window.addEventListener('DOMContentLoaded', () => {
    emitToGame('spawn:ready');
});
