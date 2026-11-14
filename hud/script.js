/**
 * HUD Controller - Kota Kecilku Roleplay
 * - Top-Right: Server Info HUD (Jam, Tanggal, Logo KK, Server, ID, Job, Uang)
 * - Top-Right: Weapon HUD (Sesuai Senjata Aktif, Ammo Orange, Silhouette)
 * - Bottom-Left: NoPixel 4.0 HBE (7 Hexagons: Voice, HP, Armor, Food, Water, Stress, Sleep)
 * - Bottom-Left: Speedometer (Di sebelah Kanan Minimap)
 * - Notification System & Target Proximity Prompt
 */

// Tinggi total SVG Hexagon (viewBox: 0 0 28 32)
const HEX_HEIGHT = 32;

// Kamus Nama Senjata GTA San Andreas
const WEAPON_NAMES = {
    0: "Fist",
    1: "Brass Knuckles",
    2: "Golf Club",
    3: "Nightstick",
    4: "Knife",
    5: "Baseball Bat",
    6: "Shovel",
    7: "Pool Cue",
    8: "Katana",
    9: "Chainsaw",
    14: "Flowers",
    15: "Cane",
    16: "Grenade",
    17: "Tear Gas",
    18: "Molotov",
    22: "9mm Pistol",
    23: "Silenced 9mm",
    24: "Desert Eagle",
    25: "Shotgun",
    26: "Sawnoff Shotgun",
    27: "Combat Shotgun",
    28: "Micro Uzi",
    29: "MP5 Navy",
    30: "AK-47",
    31: "M4 Carbine",
    32: "Tec-9",
    33: "Country Rifle",
    34: "Sniper Rifle",
    35: "RPG-7",
    36: "Heat-Seeking Rocket",
    37: "Flamethrower",
    38: "Minigun",
    41: "Spray Can",
    42: "Fire Extinguisher",
    43: "Camera",
    46: "Parachute"
};

// Kapasitas Magazine Standar GTA San Andreas (untuk kalkulasi peluru mag & cadangan)
const WEAPON_CLIP_SIZES = {
    22: 17, // 9mm Pistol
    23: 17, // Silenced 9mm
    24: 7,  // Desert Eagle
    25: 1,  // Shotgun
    26: 2,  // Sawnoff Shotgun
    27: 7,  // Combat Shotgun
    28: 50, // Micro Uzi
    29: 30, // MP5 Navy
    30: 30, // AK-47
    31: 50, // M4 Carbine
    32: 50, // Tec-9
    33: 1,  // Country Rifle
    34: 1,  // Sniper Rifle
    35: 1,  // RPG-7
    36: 1,  // Heatseeker
    37: 50, // Flamethrower
    38: 500 // Minigun
};

/**
 * Format Angka ke Format Mata Uang ($56,000,12 atau $56,000)
 */
function formatCurrency(val) {
    const num = Math.round(Number(val) || 0);
    return '$' + num.toLocaleString('en-US');
}

/**
 * Update level isi Hexagon (mengatur clipPath rect SVG dari bawah ke atas)
 */
function setHexProgress(rectId, value, itemId = null, criticalThreshold = null, invertCritical = false) {
    const rect = document.getElementById(rectId);
    if (!rect) return;

    const num = Number(value);
    const clamped = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
    
    // Hitung posisi Y dan Height untuk pengisian dari bawah ke atas
    const fillHeight = (HEX_HEIGHT * (clamped / 100));
    const yPos = HEX_HEIGHT - fillHeight;

    rect.setAttribute('y', yPos);
    rect.setAttribute('height', fillHeight);

    if (itemId && criticalThreshold !== null) {
        const itemEl = document.getElementById(itemId);
        if (itemEl) {
            const isCrit = invertCritical ? (clamped >= criticalThreshold) : (clamped <= criticalThreshold);
            if (isCrit) {
                itemEl.classList.add('critical');
            } else {
                itemEl.classList.remove('critical');
            }
        }
    }
}

/**
 * Update 3-digit digital speedometer (000 format dengan leading zeros redup)
 */
function setSpeedDisplay(speed) {
    const spd = Math.max(0, Math.round(Number(speed) || 0));
    const spdStr = String(spd).padStart(3, '0');

    const d1 = document.getElementById('d1');
    const d2 = document.getElementById('d2');
    const d3 = document.getElementById('d3');

    if (!d1 || !d2 || !d3) return;

    d1.innerText = spdStr[0];
    d2.innerText = spdStr[1];
    d3.innerText = spdStr[2];

    if (spd < 10) {
        d1.className = 'digit dim';
        d2.className = 'digit dim';
        d3.className = 'digit';
    } else if (spd < 100) {
        d1.className = 'digit dim';
        d2.className = 'digit';
        d3.className = 'digit';
    } else {
        d1.className = 'digit';
        d2.className = 'digit';
        d3.className = 'digit';
    }
}

/**
 * Update Horizontal Segmented RPM Ticks (16 Ticks)
 */
function updateRpmTicks(speed, maxSpeed = 160) {
    const ticks = document.querySelectorAll('.rpm-bar .rpm-tick');
    if (!ticks.length) return;

    const totalTicks = ticks.length;
    const currentSpeed = Math.max(0, Number(speed) || 0);
    const activeCount = Math.min(totalTicks, Math.round((currentSpeed / maxSpeed) * totalTicks));

    ticks.forEach((tick, index) => {
        if (index < activeCount) {
            tick.classList.add('active');
            if (index >= totalTicks - 3) {
                tick.classList.add('redline');
            } else {
                tick.classList.remove('redline');
            }
        } else {
            tick.classList.remove('active', 'redline');
        }
    });
}

/**
 * Update Real-Time Clock & Date (HH:MM & DD.MM.YYYY)
 */
function startClockUpdater() {
    function update() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();

        const timeEl = document.getElementById('hudTime');
        const dateEl = document.getElementById('hudDate');
        if (timeEl) timeEl.innerText = `${hh}:${mm}`;
        if (dateEl) dateEl.innerText = `${day}.${month}.${year}`;
    }
    update();
    setInterval(update, 1000);
}

/**
 * Parsing data objek atau JSON string
 */
function parseJsonSafe(arg) {
    if (typeof arg === 'object' && arg !== null) return arg;
    if (typeof arg === 'string') {
        try {
            return JSON.parse(arg);
        } catch (e) {}
    }
    return {};
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('[CEF HUD] Kota Kecilku Roleplay HUD Initialized.');

    // HUD WAJIB UNFOCUSED AGAR KURSOR MOUSE HILANG SAAT GAMEPLAY
    if (typeof CefBridge !== 'undefined') {
        CefBridge.setFocus(false);
    }

    // Jalankan jam & tanggal real-time
    startClockUpdater();

    // Inisialisasi default 7 Hexagons Status
    setHexProgress('rectVoice', 100);
    setHexProgress('rectHealth', 100);
    setHexProgress('rectArmor', 0);
    setHexProgress('rectFood', 100);
    setHexProgress('rectWater', 100);
    setHexProgress('rectStress', 0, 'hexStress', 60, true);
    setHexProgress('rectSleep', 100, 'hexSleep', 20);
    setSpeedDisplay(0);
    updateRpmTicks(0);

    // Kirim sinyal ke Pawn bahwa HUD sudah siap menerima event
    if (typeof CefBridge !== 'undefined') {
        CefBridge.emit('client:onHudReady');
    }

    // ============================================================
    // 1. LISTENER UPDATE STATUS PLAYER (7 HEXAGONS)
    // ============================================================
    CefBridge.on('server:updatePlayerStatus', (...args) => {
        let data = {};
        if (args.length === 1) {
            data = parseJsonSafe(args[0]);
        } else {
            data = {
                health: Number(args[0]),
                armor: Number(args[1]),
                hunger: Number(args[2]),
                thirst: Number(args[3]),
                stress: Number(args[4]),
                sleepy: Number(args[5])
            };
        }

        // 1. Health / Darah
        if (data.health !== undefined) {
            setHexProgress('rectHealth', data.health, 'hexHealth', 20);
        }
        // 2. Armor / Rompi
        if (data.armor !== undefined) {
            setHexProgress('rectArmor', data.armor, 'hexArmor');
        }
        // 3. Hunger / Makan
        if (data.hunger !== undefined || data.food !== undefined) {
            setHexProgress('rectFood', data.hunger ?? data.food, 'hexFood', 20);
        }
        // 4. Thirst / Minum
        if (data.thirst !== undefined || data.water !== undefined) {
            setHexProgress('rectWater', data.thirst ?? data.water, 'hexWater', 20);
        }
        // 5. Stress / Stres (Ungu, mengisi saat naik, kritis >= 60%)
        if (data.stress !== undefined) {
            setHexProgress('rectStress', data.stress, 'hexStress', 60, true);
        }
        // 6. Sleepy / Ngantuk (Kuning, berkurang saat lelah, kritis <= 20%)
        if (data.sleepy !== undefined || data.sleep !== undefined) {
            setHexProgress('rectSleep', data.sleepy ?? data.sleep, 'hexSleep', 20);
        }
    });

    // ============================================================
    // 2. LISTENER UPDATE SERVER INFO HUD (TOP-RIGHT)
    // ============================================================
    CefBridge.on('server:updateServerInfo', (payload) => {
        const data = parseJsonSafe(payload);

        if (data.name !== undefined) {
            const nameEl = document.getElementById('hudPlayerName');
            if (nameEl) nameEl.innerText = data.name.replace('_', ' ');
        }
        if (data.id !== undefined) {
            const idEl = document.getElementById('hudPlayerId');
            if (idEl) idEl.innerText = String(data.id);
        }
        if (data.job !== undefined) {
            const jobEl = document.getElementById('hudPlayerJob');
            if (jobEl) jobEl.innerText = String(data.job);
        }
        if (data.cash !== undefined) {
            const cashEl = document.getElementById('hudCash');
            if (cashEl) cashEl.innerText = formatCurrency(data.cash);
        }
        if (data.bank !== undefined) {
            const bankEl = document.getElementById('hudBank');
            if (bankEl) bankEl.innerText = formatCurrency(data.bank);
        }
    });

    // ============================================================
    // 3. LISTENER MODERN WEAPON HUD (TOP-RIGHT)
    // Sesuai referensi media_1794484266280_70b49703.png
    // Muncul HANYA jika memegang senjata (weaponId > 0)
    // ============================================================
    const weaponHud = document.getElementById('weaponHud');
    const weaponNameEl = document.getElementById('weaponName');
    const weaponTopAmmoEl = document.getElementById('weaponTopAmmo');
    const weaponBigAmmoEl = document.getElementById('weaponBigAmmo');
    const weaponImgEl = document.getElementById('weaponImg');

    CefBridge.on('server:updateWeapon', (payload, pClip, pAmmo, pName) => {
        let weaponId = 0;
        let clip = 0;
        let ammo = 0;
        let customName = null;

        if (typeof payload === 'object' && payload !== null) {
            weaponId = Number(payload.weaponId ?? payload.weapon ?? 0);
            clip = Number(payload.clip ?? 0);
            ammo = Number(payload.ammo ?? payload.totalAmmo ?? 0);
            customName = payload.name || payload.weaponName || null;
        } else if (typeof payload === 'string' && payload.startsWith('{')) {
            const d = parseJsonSafe(payload);
            weaponId = Number(d.weaponId ?? d.weapon ?? 0);
            clip = Number(d.clip ?? 0);
            ammo = Number(d.ammo ?? d.totalAmmo ?? 0);
            customName = d.name || d.weaponName || null;
        } else {
            weaponId = Number(payload) || 0;
            clip = Number(pClip) || 0;
            ammo = Number(pAmmo) || 0;
            customName = pName || null;
        }

        // Ketentuan: HANYA MUNCUL JIKA PEGANG SENJATA (sembunyikan jika fist / unarmed)
        if (weaponId > 0) {
            if (weaponHud) weaponHud.style.display = 'flex';
            if (weaponNameEl) {
                weaponNameEl.innerText = customName || WEAPON_NAMES[weaponId] || `Weapon #${weaponId}`;
            }

            // Hitung reserve ammo dan clip ammo untuk tampilan "13 / 18" (sesuai Gambar 2)
            let displayClip = clip;
            let displayReserve = ammo;

            if (clip > 0) {
                displayClip = clip;
                displayReserve = Math.max(0, ammo - clip);
            } else if (ammo > 0) {
                const magSize = WEAPON_CLIP_SIZES[weaponId] || 30;
                displayClip = Math.min(magSize, ammo);
                displayReserve = Math.max(0, ammo - displayClip);
            } else {
                displayClip = 0;
                displayReserve = 0;
            }

            if (weaponTopAmmoEl) weaponTopAmmoEl.innerText = String(displayReserve);
            if (weaponBigAmmoEl) weaponBigAmmoEl.innerText = String(displayClip);

            if (weaponImgEl) {
                weaponImgEl.src = `weapons/${weaponId}.svg`;
                weaponImgEl.onerror = () => {
                    weaponImgEl.src = 'weapons/default.svg';
                };
            }
        } else {
            // Tangan kosong / Fist -> sembunyikan sepenuhnya
            if (weaponHud) weaponHud.style.display = 'none';
        }
    });

    // ============================================================
    // 4. LISTENER VEHICLE SPEEDOMETER (DI SEBELAH KANAN MINIMAP)
    // ============================================================
    const speedoWrap = document.getElementById('speedoWrap');
    const fuelFill = document.getElementById('fuelFill');
    const gearVal = document.getElementById('gearVal');
    const seatbeltBadge = document.getElementById('seatbeltBadge');

    CefBridge.on('server:updateVehicleStatus', (...args) => {
        let data = {};
        if (args.length === 1) {
            data = parseJsonSafe(args[0]);
        } else {
            data = {
                inVehicle: Boolean(args[0]),
                speed: Number(args[1]),
                fuel: Number(args[2]),
                gear: args[3] || 'D'
            };
        }

        if (speedoWrap) {
            if (data.inVehicle) {
                speedoWrap.style.display = 'block';
                setSpeedDisplay(data.speed || 0);
                updateRpmTicks(data.speed || 0);

                if (fuelFill && data.fuel !== undefined) {
                    const clampedFuel = Math.max(0, Math.min(100, Number(data.fuel)));
                    fuelFill.style.height = `${clampedFuel}%`;
                    if (clampedFuel <= 15) {
                        fuelFill.style.background = '#ef4444';
                        fuelFill.style.boxShadow = '0 0 6px #ef4444';
                    } else {
                        fuelFill.style.background = '#ffffff';
                        fuelFill.style.boxShadow = '0 0 6px rgba(255, 255, 255, 0.7)';
                    }
                }

                if (gearVal && data.gear !== undefined) {
                    gearVal.innerText = String(data.gear);
                }

                if (seatbeltBadge && data.seatbelt !== undefined) {
                    if (data.seatbelt) {
                        seatbeltBadge.classList.add('active');
                    } else {
                        seatbeltBadge.classList.remove('active');
                    }
                }
            } else {
                speedoWrap.style.display = 'none';
            }
        }
    });

    // Voice Status
    CefBridge.on('server:updateVoice', (talking, level) => {
        const hexVoice = document.getElementById('hexVoice');
        if (!hexVoice) return;
        if (talking) {
            hexVoice.classList.add('talking');
        } else {
            hexVoice.classList.remove('talking');
        }
        if (level !== undefined) {
            setHexProgress('rectVoice', level);
        }
    });

    // ============================================================
    // 5. FIVEM MODERN NOTIFICATION & TARGET PROMPT SYSTEM
    // ============================================================
    const NotifyAudio = {
        ctx: null,
        init() {
            if (!this.ctx) {
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) this.ctx = new AudioContext();
                } catch (e) {}
            }
        },
        play(type) {
            try {
                this.init();
                if (!this.ctx) return;
                if (this.ctx.state === 'suspended') this.ctx.resume();

                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                if (type === 'error') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.setValueAtTime(140, now + 0.1);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.25);
                } else if (type === 'warning' || type === 'target' || type === 'interaction') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(580, now);
                    osc.frequency.setValueAtTime(740, now + 0.08);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else {
                    // Success / Info
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(740, now);
                    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.1);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.15);
                }
            } catch (e) {}
        }
    };

    const NotifyIcons = {
        success: 'fa-check',
        info: 'fa-info',
        warning: 'fa-triangle-exclamation',
        error: 'fa-xmark',
        target: 'fa-hand',
        interaction: 'fa-hand',
        default: 'fa-bell'
    };

    // State untuk debounce prompt interaksi dekat (ALT)
    let currentPromptIdentity = null;
    let activePromptCard = null;

    function showNotification(type = 'info', title = '', message = '', duration = 4000, key = null, isPrompt = false) {
        const container = document.getElementById('notification-container');
        if (!container) return null;

        const normType = (type || 'info').toLowerCase();
        const displayTitle = title || (normType.toUpperCase());
        const displayMsg = message || '';
        const dur = Math.max(1500, Number(duration) || 3500);

        const card = document.createElement('div');
        card.className = `notif-card ${normType}`;

        const iconClass = NotifyIcons[normType] || NotifyIcons.default;
        const iconHtml = key ? `<span style="font-size: 13px; font-weight: 800;">${key}</span>` : `<i class="fa-solid ${iconClass}"></i>`;

        card.innerHTML = `
            <div class="notif-icon">
                ${iconHtml}
            </div>
            <div class="notif-content">
                <div class="notif-title">${displayTitle}</div>
                <div class="notif-desc">${displayMsg}</div>
            </div>
            <div class="notif-progress-track">
                <div class="notif-progress-bar"></div>
            </div>
        `;

        container.appendChild(card);
        NotifyAudio.play(normType);

        const progressBar = card.querySelector('.notif-progress-bar');
        if (progressBar) {
            progressBar.style.animation = `shrink ${dur}ms linear forwards`;
        }

        const dismissTimeout = setTimeout(() => {
            dismiss();
        }, dur);

        function dismiss() {
            clearTimeout(dismissTimeout);
            card.classList.add('fade-out');
            setTimeout(() => {
                if (card.parentNode) card.parentNode.removeChild(card);
                if (activePromptCard === card) activePromptCard = null;
            }, 300);
        }

        card.dismiss = dismiss;
        return card;
    }

    function handleTargetPrompt(data) {
        if (!data) return;
        const key = data.key || 'ALT';
        const title = data.title || `INTERAKSI [${key}]`;
        const msg = data.message || data.desc || data.text || 'Tekan tombol untuk berinteraksi';
        const identity = `${title}_${msg}`;

        // Jika pemain masih di dekat target yang sama, jangan munculkan ulang terus menerus
        if (currentPromptIdentity === identity) return;
        currentPromptIdentity = identity;

        if (activePromptCard) {
            activePromptCard.dismiss();
        }

        activePromptCard = showNotification('target', title, msg, 3500, key, true);
    }

    function hideTargetPrompt() {
        // Pemain menjauh dari target - reset identity sehingga saat mendekat lagi bisa muncul 3-4 detik
        currentPromptIdentity = null;
        if (activePromptCard) {
            activePromptCard.dismiss();
            activePromptCard = null;
        }
    }

    // Listener Notifikasi Umum
    CefBridge.on('notify:show', (payload) => {
        let data = payload;
        if (typeof payload === 'string') {
            try {
                data = JSON.parse(payload);
            } catch (e) {
                data = { type: 'info', title: 'INFORMASI', message: payload, duration: 4000 };
            }
        }
        if (data) {
            if (data.isPrompt || data.type === 'target' || data.type === 'interaction') {
                handleTargetPrompt(data);
            } else {
                showNotification(data.type, data.title, data.message, data.duration, data.key);
            }
        }
    });

    // Listener Proximity Prompt Target / Area Interaksi
    CefBridge.on('target:promptShow', (payload) => {
        let data = payload;
        if (typeof payload === 'string') {
            try {
                data = JSON.parse(payload);
            } catch (e) {
                data = { message: payload, key: 'ALT' };
            }
        }
        handleTargetPrompt(data);
    });

    CefBridge.on('target:promptHide', () => {
        hideTargetPrompt();
    });

    // Listen postMessage fallback
    window.addEventListener('message', (event) => {
        if (!event.data) return;
        const d = event.data;
        if (d.action === 'notify' || d.type === 'notify') {
            showNotification(d.notifType || d.type, d.title, d.message, d.duration, d.key);
        } else if (d.action === 'targetPrompt') {
            handleTargetPrompt(d);
        } else if (d.action === 'hideTargetPrompt') {
            hideTargetPrompt();
        }
    });
});
