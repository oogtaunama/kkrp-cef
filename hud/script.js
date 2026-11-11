/**
 * HUD Controller - NoPixel 4.0 Inspired QB HUD & Speedometer
 * Kota Kecilku Roleplay
 */

// Total tinggi SVG Hexagon
const HEX_HEIGHT = 44;

/**
 * Update level isi Hexagon (mengatur clipPath rect SVG)
 * @param {string} rectId - ID elemen rect di dalam clipPath
 * @param {number} value - Nilai persentase (0 - 100)
 * @param {string} itemId - ID parent item untuk kelas status
 * @param {number|null} criticalThreshold - Batas nilai kritis untuk animasi peringatan
 */
function setHexProgress(rectId, value, itemId = null, criticalThreshold = null) {
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
            if (clamped <= criticalThreshold) {
                itemEl.classList.add('critical');
            } else {
                itemEl.classList.remove('critical');
            }
        }
    }
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

/**
 * Update RPM / Speedometer Ticks Bar (16 Segmen)
 */
function updateRpmTicks(speed, maxSpeed = 180) {
    const ticks = document.querySelectorAll('.rpm-ticks-wrap .tick');
    if (!ticks.length) return;

    const totalTicks = ticks.length;
    const currentSpeed = Math.max(0, Number(speed) || 0);
    const activeCount = Math.min(totalTicks, Math.round((currentSpeed / maxSpeed) * totalTicks));

    ticks.forEach((tick, index) => {
        if (index < activeCount) {
            tick.classList.add('active');
            if (index >= totalTicks - 3) {
                tick.classList.add('active-high');
            } else {
                tick.classList.remove('active-high');
            }
        } else {
            tick.classList.remove('active', 'active-high');
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('[CEF HUD] NoPixel 4.0 Inspired QB HUD Initialized.');

    // Default awal saat pertama kali load
    setHexProgress('rectVoice', 100);
    setHexProgress('rectHealth', 100);
    setHexProgress('rectArmor', 100);
    setHexProgress('rectFood', 100);
    setHexProgress('rectWater', 100);
    setHexProgress('rectStress', 0);
    setHexProgress('rectSleep', 100);

    // Listener update status player dari Pawn
    CefBridge.on('server:updatePlayerStatus', (...args) => {
        const data = parseStatusData(...args);

        if (data.health !== undefined) {
            setHexProgress('rectHealth', data.health, 'hexHealth', 25);
        }
        if (data.armor !== undefined) {
            setHexProgress('rectArmor', data.armor, 'hexArmor');
        }
        if (data.hunger !== undefined || data.food !== undefined) {
            setHexProgress('rectFood', data.hunger ?? data.food, 'hexFood', 20);
        }
        if (data.thirst !== undefined || data.water !== undefined) {
            setHexProgress('rectWater', data.thirst ?? data.water, 'hexWater', 20);
        }
        if (data.stress !== undefined) {
            setHexProgress('rectStress', data.stress, 'hexStress');
        }
        if (data.sleepy !== undefined || data.sleep !== undefined) {
            setHexProgress('rectSleep', data.sleepy ?? data.sleep, 'hexSleep', 20);
        }
    });

    // Listener speedometer kendaraan
    CefBridge.on('server:updateVehicleStatus', (...args) => {
        const data = parseVehicleData(...args);
        const speedo = document.getElementById('speedoHud');
        if (!speedo) return;

        if (!data.inVehicle) {
            speedo.style.display = 'none';
            return;
        }

        speedo.style.display = 'flex';
        
        // 1. Digital Speed (3 Digit e.g. "045", "120")
        const elSpeed = document.getElementById('speedVal');
        if (elSpeed) {
            const spd = Math.max(0, Math.round(data.speed || 0));
            elSpeed.innerText = String(spd).padStart(3, '0');
        }

        // 2. Fuel Gauge Bar
        const elFuel = document.getElementById('fuelFill');
        if (elFuel) {
            const fuelPercent = Math.max(0, Math.min(100, Math.round(data.fuel || 0)));
            elFuel.style.height = `${fuelPercent}%`;
            
            const badgeEngine = document.getElementById('badgeEngine');
            if (badgeEngine) {
                if (fuelPercent <= 15) {
                    badgeEngine.classList.add('warning');
                } else {
                    badgeEngine.classList.remove('warning');
                }
            }
        }

        // 3. Gear Box
        const elGear = document.getElementById('gearVal');
        if (elGear) {
            elGear.innerText = data.gear || '1';
        }

        // 4. RPM Segmented Ticks Bar
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
});
