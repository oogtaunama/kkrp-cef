/**
 * HUD Controller - In-Game Status & Speedometer
 * Kota Kecilku Roleplay
 */

function parseStatusData(arg1, arg2, arg3, arg4) {
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
        thirst: Number(arg4)
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
    console.log('[CEF HUD] In-Game HUD Ready.');

    // Listener update status player dari Pawn (Darah, Armor, Lapar, Haus)
    CefBridge.on('server:updatePlayerStatus', (...args) => {
        const data = parseStatusData(...args);
        
        if (data.health !== undefined && !isNaN(data.health)) {
            const h = Math.max(0, Math.min(100, Math.round(data.health)));
            const elBar = document.getElementById('barHealth');
            const elVal = document.getElementById('valHealth');
            if (elBar) elBar.style.width = `${h}%`;
            if (elVal) elVal.innerText = h;
        }

        if (data.armor !== undefined && !isNaN(data.armor)) {
            const a = Math.max(0, Math.min(100, Math.round(data.armor)));
            const elBar = document.getElementById('barArmor');
            const elVal = document.getElementById('valArmor');
            if (elBar) elBar.style.width = `${a}%`;
            if (elVal) elVal.innerText = a;
        }

        if (data.hunger !== undefined && !isNaN(data.hunger)) {
            const hu = Math.max(0, Math.min(100, Math.round(data.hunger)));
            const elBar = document.getElementById('barHunger');
            const elVal = document.getElementById('valHunger');
            if (elBar) elBar.style.width = `${hu}%`;
            if (elVal) elVal.innerText = `${hu}%`;
        }

        if (data.thirst !== undefined && !isNaN(data.thirst)) {
            const th = Math.max(0, Math.min(100, Math.round(data.thirst)));
            const elBar = document.getElementById('barThirst');
            const elVal = document.getElementById('valThirst');
            if (elBar) elBar.style.width = `${th}%`;
            if (elVal) elVal.innerText = `${th}%`;
        }
    });

    // Listener speedometer kendaraan dari Pawn
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
