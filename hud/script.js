/**
 * HUD Controller - In-Game Status & Speedometer
 */

window.addEventListener('DOMContentLoaded', () => {
    // Listener update status player dari Pawn
    CefBridge.on('server:updatePlayerStatus', (data) => {
        // data = { health, armor, hunger, thirst }
        if (data.health !== undefined) {
            document.getElementById('barHealth').style.width = `${data.health}%`;
            document.getElementById('valHealth').innerText = Math.round(data.health);
        }
        if (data.armor !== undefined) {
            document.getElementById('barArmor').style.width = `${data.armor}%`;
            document.getElementById('valArmor').innerText = Math.round(data.armor);
        }
        if (data.hunger !== undefined) {
            document.getElementById('barHunger').style.width = `${data.hunger}%`;
            document.getElementById('valHunger').innerText = `${Math.round(data.hunger)}%`;
        }
        if (data.thirst !== undefined) {
            document.getElementById('barThirst').style.width = `${data.thirst}%`;
            document.getElementById('valThirst').innerText = `${Math.round(data.thirst)}%`;
        }
    });

    // Listener speedometer kendaraan
    CefBridge.on('server:updateVehicleStatus', (data) => {
        // data = { inVehicle, speed, fuel, gear }
        const speedo = document.getElementById('speedoHud');
        if (!data.inVehicle) {
            speedo.style.display = 'none';
            return;
        }

        speedo.style.display = 'flex';
        document.getElementById('speedVal').innerText = Math.round(data.speed || 0);
        document.getElementById('fuelVal').innerText = `${Math.round(data.fuel || 0)}%`;
        document.getElementById('gearVal').innerText = data.gear || 'D';
    });
});
