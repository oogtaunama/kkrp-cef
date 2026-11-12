/**
 * HUD Controller - NoPixel 4.0 Inspired QB HUD & Speedometer
 * Kota Kecilku Roleplay
 * Status: Voice, Health, Armor, Food, Water, Stress, Sleep
 * Reference: ref_hud_speedo.jpg
 */

// Tinggi total SVG Hexagon (viewBox: 0 0 28 32)
const HEX_HEIGHT = 32;

/**
 * Update level isi Hexagon (mengatur clipPath rect SVG dari bawah ke atas)
 * @param {string} rectId - ID elemen rect di dalam clipPath
 * @param {number} value - Nilai persentase (0 - 100)
 * @param {string} itemId - ID parent item untuk efek class critical
 * @param {number|null} criticalThreshold - Batas nilai kritis
 * @param {boolean} invertCritical - Jika true, nilai >= criticalThreshold dianggap kritis (misal: stress)
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
 * Sesuai referensi ref_hud_speedo.jpg
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
 * Normal: Cyan (#2dd4bf)
 * Redline: Merah (#ef4444)
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
 * Parsing data status pemain dari Pawn
 */
function parseStatusData(arg1, arg2, arg3, arg4, arg5, arg6) {
    if (typeof arg1 === 'object' && arg1 !== null) {
        return arg1;
    }
    if (typeof arg1 === 'string') {
        try {
            return JSON.parse(arg1);
        } catch (e) {}
    }
    return {
        health: Number(arg1),
        armor: Number(arg2),
        hunger: Number(arg3),
        thirst: Number(arg4),
        stress: Number(arg5),
        sleepy: Number(arg6)
    };
}

/**
 * Parsing data kendaraan dari Pawn
 */
function parseVehicleData(arg1, arg2, arg3, arg4) {
    if (typeof arg1 === 'object' && arg1 !== null) {
        return arg1;
    }
    if (typeof arg1 === 'string') {
        try {
            return JSON.parse(arg1);
        } catch (e) {}
    }
    return {
        inVehicle: Boolean(arg1),
        speed: Number(arg2),
        fuel: Number(arg3),
        gear: arg4 || '1'
    };
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('[CEF HUD] NoPixel 4.0 QB HUD Initialized.');

    // HUD WAJIB UNFOCUSED AGAR KURSOR MOUSE HILANG SAAT GAMEPLAY
    if (typeof CefBridge !== 'undefined') {
        CefBridge.setFocus(false);
    }

    // Default status awal (7 Hexagons)
    setHexProgress('rectVoice', 100);
    setHexProgress('rectHealth', 100);
    setHexProgress('rectArmor', 100);
    setHexProgress('rectFood', 100);
    setHexProgress('rectWater', 100);
    setHexProgress('rectStress', 0, 'hexStress', 60, true);
    setHexProgress('rectSleep', 100, 'hexSleep', 20);
    setSpeedDisplay(0);
    updateRpmTicks(0);

    // Kirim notifikasi ke Pawn bahwa HUD sudah siap menerima event
    if (typeof CefBridge !== 'undefined') {
        CefBridge.emit('client:onHudReady');
    }

    // Listener update status player dari server Pawn
    CefBridge.on('server:updatePlayerStatus', (...args) => {
        const data = parseStatusData(...args);

        // 1. Health / Darah (Hijau)
        if (data.health !== undefined) {
            setHexProgress('rectHealth', data.health, 'hexHealth', 20);
        }
        // 2. Armor / Rompi (Biru)
        if (data.armor !== undefined) {
            setHexProgress('rectArmor', data.armor, 'hexArmor');
        }
        // 3. Hunger / Makan (Oranye)
        if (data.hunger !== undefined || data.food !== undefined) {
            setHexProgress('rectFood', data.hunger ?? data.food, 'hexFood', 20);
        }
        // 4. Thirst / Minum (Cyan)
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

    // Listener speedometer kendaraan dari server Pawn
    CefBridge.on('server:updateVehicleStatus', (...args) => {
        const data = parseVehicleData(...args);
        const speedo = document.getElementById('speedoHud');
        if (!speedo) return;

        if (!data.inVehicle) {
            speedo.style.display = 'none';
            return;
        }

        speedo.style.display = 'block';

        // 1. Digital 3-Digit Speed
        setSpeedDisplay(data.speed || 0);

        // 2. Vertical Fuel Level Bar
        const elFuel = document.getElementById('fuelFill');
        if (elFuel) {
            const fuelPercent = Math.max(0, Math.min(100, Math.round(data.fuel || 0)));
            elFuel.style.height = `${fuelPercent}%`;
        }

        // 3. Gear Box
        const elGear = document.getElementById('gearVal');
        if (elGear) {
            elGear.innerText = String(data.gear || '1');
        }

        // 4. Horizontal RPM Ticks
        updateRpmTicks(data.speed || 0);
    });

    // Listener status mikrofon/voice
    CefBridge.on('server:updateVoiceStatus', (isTalking) => {
        const hexVoice = document.getElementById('hexVoice');
        if (!hexVoice) return;
        if (isTalking) {
            hexVoice.classList.add('talking');
        } else {
            hexVoice.classList.remove('talking');
        }
    });

    // ========================================================================
    // 3. FIVEM CEF NOTIFICATION SYSTEM & PROXIMITY PROMPT
    // Sesuai referensi cfx_notif.jpg (Warning, Error, Success, Info, Default)
    // ========================================================================
    const NotifyAudio = {
        ctx: null,
        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
        },
        play(type) {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                if (type === 'error') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'warning') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(540, now);
                    osc.frequency.setValueAtTime(680, now + 0.08);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else {
                    // Success / Info / Default
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
        warning: 'fa-triangle-exclamation',
        error: 'fa-circle-xmark',
        success: 'fa-circle-check',
        info: 'fa-circle-info',
        syntax: 'fa-terminal',
        default: 'fa-comment'
    };

    /**
     * Tampilkan notifikasi FiveM CEF ke layar
     * @param {Object} data - { type, title, message, duration }
     */
    function showFivemNotification(data) {
        if (!data) return;
        const stack = document.getElementById('notifyStack');
        if (!stack) return;

        const type = (data.type || 'info').toLowerCase();
        const title = data.title || (type.toUpperCase());
        const message = data.message || '';
        const duration = Math.max(1500, Number(data.duration) || 4500);
        const iconClass = NotifyIcons[type] || NotifyIcons.default;

        // Buat card elemen notifikasi
        const card = document.createElement('div');
        card.className = `fivem-notify notify-${type}`;

        card.innerHTML = `
            <div class="notify-badge">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="notify-body">
                <div class="notify-title">${title}</div>
                <div class="notify-msg">${message}</div>
            </div>
            <div class="notify-progress"></div>
        `;

        stack.appendChild(card);
        NotifyAudio.play(type);

        // Slide in
        requestAnimationFrame(() => {
            card.classList.add('show');
            const progress = card.querySelector('.notify-progress');
            if (progress) {
                progress.style.transition = `width ${duration}ms linear`;
                requestAnimationFrame(() => {
                    progress.style.width = '0%';
                });
            }
        });

        // Slide out & destroy
        setTimeout(() => {
            card.classList.remove('show');
            card.classList.add('hide');
            setTimeout(() => {
                if (card.parentNode) {
                    card.parentNode.removeChild(card);
                }
            }, 350);
        }, duration);
    }

    // Listener Event Notifikasi dari Pawn
    CefBridge.on('notify:show', (payload) => {
        let data = payload;
        if (typeof payload === 'string') {
            try {
                data = JSON.parse(payload);
            } catch (e) {
                data = { type: 'info', title: 'INFORMASI', message: payload, duration: 4500 };
            }
        }
        showFivemNotification(data);
    });

    // Listener Proximity Prompt Target Mata (FiveM style)
    const targetPrompt = document.getElementById('targetPrompt');
    const targetPromptDesc = document.getElementById('targetPromptDesc');

    CefBridge.on('target:promptShow', (payload) => {
        let text = 'Target Interaktif';
        if (typeof payload === 'string') {
            try {
                const parsed = JSON.parse(payload);
                text = parsed.title || parsed.desc || payload;
            } catch (e) {
                text = payload;
            }
        } else if (payload && typeof payload === 'object') {
            text = payload.title || payload.desc || 'Target Interaktif';
        }

        if (targetPromptDesc) {
            targetPromptDesc.textContent = text;
        }
        if (targetPrompt) {
            targetPrompt.classList.add('show');
        }
    });

    CefBridge.on('target:promptHide', () => {
        if (targetPrompt) {
            targetPrompt.classList.remove('show');
        }
    });
});
