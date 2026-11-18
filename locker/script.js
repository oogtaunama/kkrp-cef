/**
 * ============================================================================
 * MODERN LOCKER CONTROLLER - KOTA KECILKU ROLEPLAY
 * Faction & Job Locker UI System (open.mp & FiveM CEF Compatible)
 * Theme: Orange Glassmorphism
 * ============================================================================
 */

(function () {
    'use strict';

    // ========================================================================
    // 1. WEB AUDIO SYNTHESIZER (ZERO-LATENCY SOUND FX)
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
    // 2. LOCKER UI CONTROLLER
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

            this.orgIcon = document.getElementById('orgIcon');
            this.orgTag = document.getElementById('orgTag');
            this.orgName = document.getElementById('orgName');
            this.playerName = document.getElementById('playerName');
            this.playerRank = document.getElementById('playerRank');

            this.uniformsGrid = document.getElementById('uniformsGrid');
            this.equipmentsGrid = document.getElementById('equipmentsGrid');
            this.uniformCount = document.getElementById('uniformCount');
            this.btnCivilianClothes = document.getElementById('btnCivilianClothes');
            this.btnClaimAllEquipment = document.getElementById('btnClaimAllEquipment');
            this.btnStoreAllEquipment = document.getElementById('btnStoreAllEquipment');

            this.statFactionId = document.getElementById('statFactionId');
            this.statRankLevel = document.getElementById('statRankLevel');

            // Internal State
            this.isOnDuty = false;
            this.currentSkin = 0;
            this.data = {
                factionId: 1,
                factionName: 'Kepolisian Los Santos',
                tag: 'FACTION LOCKER',
                icon: 'fa-shield-halved',
                playerName: 'Brenden Randall',
                playerRank: 'Officer II',
                rankLevel: 'Rank 2',
                onDuty: false,
                currentSkin: 311,
                uniforms: [],
                equipments: []
            };

            this._init();
        }

        _init() {
            // Tab Switching
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    SoundFx.playHover();
                    const target = tab.getAttribute('data-tab');
                    this.switchTab(target);
                });
            });

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

            // Equipment Batch Actions
            if (this.btnClaimAllEquipment) {
                this.btnClaimAllEquipment.addEventListener('click', () => this.claimAllEquipment());
            }
            if (this.btnStoreAllEquipment) {
                this.btnStoreAllEquipment.addEventListener('click', () => this.storeAllEquipment());
            }

            // CEF Bridge listeners
            this._setupBridge();

            // Standalone Browser Preview Check
            const isCef = Boolean(
                (typeof cef !== 'undefined' && cef !== null) ||
                (typeof window !== 'undefined' && typeof window.cef !== 'undefined' && window.cef !== null) ||
                (window.CefBridge && typeof CefBridge.isAvailable === 'function' && CefBridge.isAvailable()) ||
                window.cefQuery ||
                window.mp
            );

            if (!isCef && (window.location.protocol === 'file:' || window.location.search.includes('preview=true'))) {
                document.body.classList.add('preview-mode');
                console.log('%c[LockerUI] Running in Standalone Preview Mode', 'color: #ff9800; font-weight: bold;');
                this._loadMockData();
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
                if (this.overlay) this.overlay.classList.remove('hidden');
            });
            CefBridge.on('locker:hide', () => {
                if (this.overlay) this.overlay.classList.add('hidden');
            });
        }

        switchTab(tabName) {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            const activeBtn = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
            const activePane = document.getElementById(`pane-${tabName}`);

            if (activeBtn) activeBtn.classList.add('active');
            if (activePane) activePane.classList.add('active');
        }

        setData(data) {
            if (!data) return;
            this.data = Object.assign(this.data, data);

            // Org & Header Info
            if (this.orgName) this.orgName.textContent = data.factionName || 'Locker Faksi';
            if (this.orgTag) this.orgTag.textContent = data.tag || 'FACTION LOCKER';
            if (this.orgIcon && data.icon) {
                this.orgIcon.className = `fa-solid ${data.icon}`;
            }

            // Player Info
            if (this.playerName) this.playerName.textContent = (data.playerName || 'Pemain').replace('_', ' ');
            if (this.playerRank) this.playerRank.textContent = data.playerRank || 'Anggota';

            if (this.statFactionId) this.statFactionId.textContent = `#${data.factionId || 1} (${data.factionName || 'Faksi'})`;
            if (this.statRankLevel) this.statRankLevel.textContent = data.rankLevel || 'Tingkat 1';

            // Duty Status
            this.setDutyState(Boolean(data.onDuty));

            // Current Active Uniform
            this.currentSkin = data.currentSkin || 0;

            // Render Uniforms
            this._renderUniforms(data.uniforms || []);

            // Render Equipments
            this._renderEquipments(data.equipments || []);
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

        claimAllEquipment() {
            SoundFx.playClick();
            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onLockerClaimEquipment', 'all');
            }
        }

        storeAllEquipment() {
            SoundFx.playClick();
            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onLockerStoreEquipment');
            }
        }

        claimSingleEquipment(equipId) {
            SoundFx.playClick();
            if (typeof CefBridge !== 'undefined') {
                CefBridge.emit('cef_onLockerClaimEquipment', equipId);
            }
        }

        close() {
            SoundFx.playClick();
            if (this.overlay) this.overlay.classList.add('hidden');
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

                const icon = u.icon || 'fa-shirt';
                card.innerHTML = `
                    <div class="uniform-icon-wrap">
                        <i class="fa-solid ${icon}"></i>
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

        _renderEquipments(equipments) {
            if (!this.equipmentsGrid) return;
            this.equipmentsGrid.innerHTML = '';

            if (!equipments || equipments.length === 0) {
                this.equipmentsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 32px;">
                        Tidak ada perlengkapan khusus untuk divisi ini
                    </div>
                `;
                return;
            }

            equipments.forEach((eq) => {
                const card = document.createElement('div');
                card.className = 'equipment-card';

                const icon = eq.icon || 'fa-shield';
                card.innerHTML = `
                    <div class="equip-icon-box">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div class="equip-details">
                        <div class="equip-name">${eq.name || 'Perlengkapan'}</div>
                        <div class="equip-desc">${eq.desc || 'Inventaris kedinasan'}</div>
                    </div>
                    <button class="btn-claim-single" title="Ambil item ini">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                `;

                card.querySelector('.btn-claim-single').addEventListener('click', () => {
                    this.claimSingleEquipment(eq.id || eq.name);
                });

                card.addEventListener('mouseenter', () => SoundFx.playHover());
                this.equipmentsGrid.appendChild(card);
            });
        }

        _loadMockData() {
            this.setData({
                factionId: 1,
                factionName: 'Kepolisian Los Santos (LSPD)',
                tag: 'FACTION LOCKER',
                icon: 'fa-shield-halved',
                playerName: 'Brenden_Randall',
                playerRank: 'Officer II (Patrol Division)',
                rankLevel: 'Tingkat 2',
                onDuty: false,
                currentSkin: 280,
                uniforms: [
                    { skinId: 280, title: 'LSPD Patrol Regular', icon: 'fa-shirt' },
                    { skinId: 281, title: 'LSPD Cadet Academy', icon: 'fa-shirt' },
                    { skinId: 282, title: 'LSPD Sergeant Duty', icon: 'fa-star' },
                    { skinId: 283, title: 'LSPD Lieutenant Formal', icon: 'fa-award' },
                    { skinId: 284, title: 'LSPD Highway Patrol', icon: 'fa-motorcycle' },
                    { skinId: 285, title: 'LSPD Tactical SWAT', icon: 'fa-user-ninja' },
                    { skinId: 288, title: 'LSPD Detective Bureau', icon: 'fa-user-secret' },
                    { skinId: 311, title: 'LSPD Chief of Police', icon: 'fa-crown' }
                ],
                equipments: [
                    { id: 'armor', name: 'Kevlar Vest (Armor 100%)', desc: 'Rompi anti-peluru standar kepolisian', icon: 'fa-vest-patches' },
                    { id: 'nightstick', name: 'Nightstick (Baton)', desc: 'Tongkat tumpul pengendali massa', icon: 'fa-wand-magic-sparkles' },
                    { id: 'spray', name: 'Pepper Spray', desc: 'Semprotan merica pelumpuh non-lethal', icon: 'fa-spray-can' },
                    { id: 'taser', name: 'Stun Gun (Taser 9mm)', desc: 'Senjata kejut listrik berdaya tinggi', icon: 'fa-bolt' },
                    { id: 'shotgun', name: 'Remington 870 Shotgun', desc: 'Senjata dinas laras panjang (Beanbag)', icon: 'fa-crosshairs' },
                    { id: 'radio', name: 'Handy Talky (Radio LSPD)', desc: 'Komunikasi darurat saluran terenkripsi', icon: 'fa-walkie-talkie' }
                ]
            });
        }
    }

    // Initialize on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        window.lockerInstance = new LockerController();
    });

})();
