/**
 * HUD Controller - FiveM Style Circular HBE HUD
 * Kota Kecilku Roleplay
 */

const CIRCUMFERENCE = 100.53; // 2 * PI * 16

function setRingProgress(ringId, value, itemId = null, criticalThreshold = null) {
    const el = document.getElementById(ringId);
    if (!el) return;
    
    const num = Number(value);
    const clamped = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
    const offset = CIRCUMFERENCE - (CIRCUMFERENCE * (clamped / 100));
    el.style.strokeDashoffset = offset;

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
        gear: arg4 || 'D'
    };
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('[CEF HUD] Circular HBE HUD Initialized.');

    // Nilai Default Awal saat HUD pertama kali dimuat
    setRingProgress('ringHealth', 100);
    setRingProgress('ringArmor', 100);
    setRingProgress('ringFood', 100);
    setRingProgress('ringWater', 100);
    setRingProgress('ringStress', 0);
    setRingProgress('ringSleep', 100);

    // Listener update status player dari Pawn
    // Mendukung 6 Status: Darah, Armor, Makan, Minum, Stress, Ngantuk
    CefBridge.on('server:updatePlayerStatus', (...args) => {
        const data = parseStatusData(...args);

        if (data.health !== undefined) {
            setRingProgress('ringHealth', data.health, 'itemHealth', 25);
        }
        if (data.armor !== undefined) {
            setRingProgress('ringArmor', data.armor, 'itemArmor');
        }
        if (data.hunger !== undefined || data.food !== undefined) {
            setRingProgress('ringFood', data.hunger ?? data.food, 'itemFood', 20);
        }
        if (data.thirst !== undefined || data.water !== undefined) {
            setRingProgress('ringWater', data.thirst ?? data.water, 'itemWater', 20);
        }
        if (data.stress !== undefined) {
            setRingProgress('ringStress', data.stress, 'itemStress');
        }
        if (data.sleepy !== undefined || data.sleep !== undefined) {
            setRingProgress('ringSleep', data.sleepy ?? data.sleep, 'itemSleep', 20);
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
        const elSpeed = document.getElementById('speedVal');
        const elFuel = document.getElementById('fuelVal');
        const elGear = document.getElementById('gearVal');

        if (elSpeed) elSpeed.innerText = Math.round(data.speed || 0);
        if (elFuel) elFuel.innerText = `${Math.round(data.fuel || 0)}%`;
        if (elGear) elGear.innerText = data.gear || 'D';
    });
});
