/**
 * ============================================================================
 * MODERN LOCKER CONTROLLER - KOTA KECILKU ROLEPLAY
 * Faction & Job Locker UI System (open.mp & FiveM CEF Compatible)
 * Theme: Orange Glassmorphism (Uniforms & Duty Only)
 * ============================================================================
 */

(function () {
    'use strict';

    // ========================================================================
    // 1. INLINE SVG ICONS (Zero Font/CDN Dependency)
    // ========================================================================
    const ICONS = {
        shirt: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M21.6 4.4l-4.8-2.4c-.4-.2-.9-.1-1.2.2L13 4.8c-.6-.5-1.3-.8-2.1-.8-.8 0-1.5.3-2.1.8L6.2 2.2c-.3-.3-.8-.4-1.2-.2L.2 4.4C0 4.5-.1 4.8.1 5.1l2.5 5c.2.4.6.6 1 .5l2.4-.7V21c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V9.9l2.4.7c.4.1.8-.1 1-.5l2.5-5c.2-.3.1-.6-.1-.7z"/></svg>',
        star: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        shield: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 9.04-7 10.17-3.87-1.13-7-5.5-7-10.17V6.3l7-3.12z"/></svg>',
        award: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><circle cx="12" cy="8" r="5"/><path d="M15.4 13.5l3.6 7.5-7-3-7 3 3.6-7.5"/></svg>',
        medical: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/></svg>',
        wrench: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
        tie: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 2h12l-3 4 5 16-8-4-8 4 5-16z"/></svg>',
        motorcycle: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="M5 16l4-7h4l3 7M12 9l2-4h3"/></svg>',
        default: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M21.6 4.4l-4.8-2.4c-.4-.2-.9-.1-1.2.2L13 4.8c-.6-.5-1.3-.8-2.1-.8-.8 0-1.5.3-2.1.8L6.2 2.2c-.3-.3-.8-.4-1.2-.2L.2 4.4C0 4.5-.1 4.8.1 5.1l2.5 5c.2.4.6.6 1 .5l2.4-.7V21c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V9.9l2.4.7c.4.1.8-.1 1-.5l2.5-5c.2-.3.1-.6-.1-.7z"/></svg>'
    };

    function resolveSvgIcon(iconName) {
        if (!iconName) return ICONS.default;
        const name = iconName.toLowerCase();
        if (name.includes('shield')) return ICONS.shield;
        if (name.includes('star') || name.includes('crown')) return ICONS.star;
        if (name.includes('award')) return ICONS.award;
        if (name.includes('doctor') || name.includes('medic') || name.includes('heart') || name.includes('hospital')) return ICONS.medical;
        if (name.includes('wrench') || name.includes('gear') || name.includes('screwdriver') || name.includes('tool')) return ICONS.wrench;
        if (name.includes('tie') || name.includes('suit') || name.includes('briefcase')) return ICONS.tie;
        if (name.includes('motorcycle') || name.includes('car')) return ICONS.motorcycle;
        if (name.includes('shirt') || name.includes('vest')) return ICONS.shirt;
        return ICONS.shirt;
    }

    // ========================================================================
    // 2. WEB AUDIO SYNTHESIZER (ZERO-LATENCY SOUND FX)
    // ========================================================================
    const SoundFx = {
        ctx: null,

        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
        },

        playHover() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.03);
            } catch (e) {}
        },

        playClick() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(560, now);
                osc.frequency.exponentialRampToValueAtTime(920, now + 0.08);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.09);
            } catch (e) {}
        },

        playDutyToggle(isOnDuty) {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                if (isOnDuty) {
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                } else {
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
                }
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
            } catch (e) {}
        }
    };

    // ========================================================================
    // 3. LOCKER UI CONTROLLER
    // ========================================================================
    class LockerController {
        constructor() {
            // DOM Elements
            this.overlay = document.getElementById('lockerOverlay');
            this.btnClose = document.getElementById('btnClose');
            this.btnToggleDuty = document.getElementById('btnToggleDuty');
            this.btnDutyText = document.getElementById('btnDutyText');
            this.dutyBanner = document.getElementById('dutyBanner');
            this.dutyStatusLabel = document.getElementById('dutyStatusLabel');
            this.dutyStatusSub = document.getElementById('dutyStatusSub');

            this.orgIconWrapper = document.getElementById('orgIconWrapper');
            this.orgTag = document.getElementById('orgTag');
            this.orgName = document.getElementById('orgName');
            this.playerName = document.getElementById('playerName');
            this.playerRank = document.getElementById('playerRank');

            this.uniformsGrid = document.getElementById('uniformsGrid');
            this.uniformCount = document.getElementById('uniformCount');
            this.btnCivilianClothes = document.getElementById('btnCivilianClothes');

            // Internal State
            this.isOnDuty = false;
            this.currentSkin = 0;
            this.data = {
                factionId: 1,
                factionName: 'Kepolisian Los Santos',
                tag: 'FACTION LOCKER',
                icon: 'shield',
                playerName: 'Brenden Randall',
                playerRank: 'Officer II',
                onDuty: false,
                currentSkin: 311,
                uniforms: []
            };

            this._init();
        }

        _init() {
            // Close Button
            if (this.btnClose) {
                this.btnClose.addEventListener('click', () => this.close());
            }

            // Keyboard shortcut (ESC)
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            });

            // Toggle Duty Button
            if (this.btnToggleDuty) {
                this.btnToggleDuty.addEventListener('click', () => this.toggleDuty());
            }

            // Civilian Clothes Button
            if (this.btnCivilianClothes) {
                this.btnCivilianClothes.addEventListener('click', () => this.wearCivilianClothes());
            }

            // CEF Bridge listeners
            this._setupBridge();

            // Standalone Browser Preview Check (ONLY when preview=true is passed)
            if (window.location.search.includes('preview=true')) {
                document.body.classList.add('preview-mode');
                console.log('%c[LockerUI] Running in Standalone Preview Mode', 'color: #ff9800; font-weight: bold;');
                this._loadMockData();
                this.show();
            }
        }

        _setupBridge() {
            if (typeof CefBridge === 'undefined') return;

            // Notify server that Locker UI is ready
            CefBridge.emit('cef_onLockerReady');

            // 1. Set Locker Data from server
            CefBridge.on('locker:setData', (payload) => {
                let data = payload;
                if (typeof payload === 'string') {
                    try {
                        data = JSON.parse(payload);
                    } catch (e) {
                        console.error('[LockerUI] JSON Parse error:', e);
                        return;
                    }
                }
                this.setData(data);
            });

            // 2. Update Duty status only
            CefBridge.on('locker:updateDuty', (payload) => {
                let onDuty = payload;
                if (typeof payload === 'object' && payload !== null) {
                    onDuty = payload.onDuty;
                }
                this.setDutyState(Boolean(onDuty));
            });

            // 3. Show / Hide
            CefBridge.on('locker:show', () => {
                this.show();
            });
            CefBridge.on('locker:hide', () => {
                this.close();
            });
        }

        show() {
            if (this.overlay) {
                this.overlay.classList.add('active');
                this.overlay.classList.remove('hidden');
                this.overlay.style.display = 'flex';
            }
        }

        setData(data) {
            if (!data) return;
            this.data = Object.assign(this.data, data);

            // Org & Header Info
            if (this.orgName) this.orgName.textContent = data.factionName || 'Locker Faksi';
            if (this.orgTag) this.orgTag.textContent = data.tag || 'FACTION LOCKER';

            if (this.orgIconWrapper && data.icon) {
                this.orgIconWrapper.innerHTML = resolveSvgIcon(data.icon);
            }

            // Player Info
            if (this.playerName) this.playerName.textContent = (data.playerName || 'Pemain').replace(/_/g, ' ');
            if (this.playerRank) this.playerRank.textContent = data.playerRank || 'Anggota';

            // Duty Status
            this.setDutyState(Boolean(data.onDuty));

            // Current Active Uniform
            this.currentSkin = data.currentSkin || 0;

            // Render Uniforms
            this._renderUniforms(data.uniforms || []);
        }

        setDutyState(onDuty) {
            this.isOnDuty = onDuty;
            if (this.dutyBanner) {
                if (onDuty) {
                    this.dutyBanner.classList.add('on-duty');
                    this.dutyStatusLabel.textContent = 'STATUS TUGAS: ON DUTY';
                    this.dutyStatusSub.textContent = 'Anda sedang dalam jam dinas aktif. Laksanakan tugas sesuai SOP.';
                    this.btnDutyText.textContent = 'Selesai Tugas (Off Duty)';
                } else {
                    this.dutyBanner.classList.remove('on-duty');
                    this.dutyStatusLabel.textContent = 'STATUS TUGAS: OFF DUTY';
                    this.dutyStatusSub.textContent = 'Anda sedang tidak dalam status jam dinas aktif';
                    this.btnDutyText.textContent = 'Mulai Tugas (On Duty)';
                }
            }
        }

        toggleDuty() {
            SoundFx.playDutyToggle(!this.isOnDuty);
            this.setDutyState(!this.isOnDuty);

            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onLockerToggleDuty');
            }
        }

        wearCivilianClothes() {
            SoundFx.playClick();
            document.querySelectorAll('.uniform-card').forEach(c => c.classList.remove('active-skin'));
            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onLockerCivilianClothes');
            }
        }

        selectUniform(skinId, cardEl) {
            SoundFx.playClick();
            this.currentSkin = skinId;

            document.querySelectorAll('.uniform-card').forEach(c => c.classList.remove('active-skin'));
            if (cardEl) cardEl.classList.add('active-skin');

            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onLockerSelectUniform', parseInt(skinId, 10));
            }
        }

        close() {
            SoundFx.playClick();
            if (this.overlay) {
                this.overlay.classList.remove('active');
                this.overlay.classList.add('hidden');
                this.overlay.style.display = 'none';
            }
            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onLockerClose');
                if (typeof CefBridge.setFocus === 'function') {
                    CefBridge.setFocus(false);
                }
            }
        }

        _renderUniforms(uniforms) {
            if (!this.uniformsGrid) return;
            this.uniformsGrid.innerHTML = '';

            if (this.uniformCount) {
                this.uniformCount.textContent = `${uniforms.length} Seragam Tersedia`;
            }

            if (!uniforms || uniforms.length === 0) {
                this.uniformsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 32px;">
                        Tidak ada seragam khusus untuk jabatan ini
                    </div>
                `;
                return;
            }

            uniforms.forEach((u) => {
                const card = document.createElement('div');
                card.className = 'uniform-card';
                if (this.currentSkin === u.skinId) {
                    card.classList.add('active-skin');
                }

                const svgIcon = resolveSvgIcon(u.icon || 'shirt');
                card.innerHTML = `
                    <div class="uniform-icon-wrap">
                        ${svgIcon}
                    </div>
                    <div class="uniform-title">${u.title || 'Seragam'}</div>
                    <div class="uniform-skin-id">Model Skin ID: #${u.skinId}</div>
                    <button class="btn-equip-uniform">Gunakan Seragam</button>
                `;

                card.querySelector('.btn-equip-uniform').addEventListener('click', () => {
                    this.selectUniform(u.skinId, card);
                });

                card.addEventListener('mouseenter', () => SoundFx.playHover());
                this.uniformsGrid.appendChild(card);
            });
        }

        _loadMockData() {
            this.setData({
                factionId: 1,
                factionName: 'Kepolisian Los Santos (LSPD)',
                tag: 'FACTION LOCKER',
                icon: 'shield',
                playerName: 'Brenden_Randall',
                playerRank: 'Officer II (Patrol Division)',
                onDuty: false,
                currentSkin: 280,
                uniforms: [
                    { skinId: 280, title: 'LSPD Patrol Regular', icon: 'shirt' },
                    { skinId: 281, title: 'LSPD Cadet Academy', icon: 'shirt' },
                    { skinId: 282, title: 'LSPD Sergeant Duty', icon: 'star' },
                    { skinId: 283, title: 'LSPD Lieutenant Formal', icon: 'award' },
                    { skinId: 284, title: 'LSPD Highway Patrol', icon: 'motorcycle' },
                    { skinId: 285, title: 'LSPD Tactical SWAT', icon: 'shield' },
                    { skinId: 288, title: 'LSPD Detective Bureau', icon: 'tie' },
                    { skinId: 311, title: 'LSPD Chief of Police', icon: 'star' }
                ]
            });
        }
    }

    // Initialize on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        window.lockerInstance = new LockerController();
    });

})();
