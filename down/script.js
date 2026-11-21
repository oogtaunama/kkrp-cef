/**
 * KKRP Down / Knockout UI Controller
 * Kompatibel dengan SA-MP open.mp CEF & FiveM NUI
 */

(function () {
    'use strict';

    let totalBleedoutTime = 300; // 5 Menit default
    let remainingTime = 300;
    let timerInterval = null;
    let emsSignalSent = false;

    const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52 -> ~326.72

    const container = document.getElementById('downContainer');
    const timerValEl = document.getElementById('timerVal');
    const timerProgressEl = document.getElementById('timerProgress');
    const pulseRateEl = document.getElementById('pulseRate');
    const medicCountEl = document.getElementById('medicCount');
    const btnCallEMS = document.getElementById('btnCallEMS');
    const btnRespawn = document.getElementById('btnRespawn');
    const dispatchStatusText = document.getElementById('dispatchStatusText');
    const respawnSubText = document.getElementById('respawnSubText');

    function emitEvent(name, ...args) {
        if (window.CefBridge && typeof window.CefBridge.emit === 'function') {
            window.CefBridge.emit(name, ...args);
        } else if (typeof cef !== 'undefined' && cef && typeof cef.emit === 'function') {
            cef.emit(name, ...args);
        }

        try {
            if (window.GetParentResourceName) {
                fetch(`https://${GetParentResourceName()}/${name}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(args.length === 1 ? args[0] : args)
                }).catch(() => {});
            }
        } catch (e) {}
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateTimerCircle() {
        if (!timerProgressEl) return;
        const progress = Math.max(0, remainingTime / totalBleedoutTime);
        const offset = CIRCUMFERENCE * (1 - progress);
        timerProgressEl.style.strokeDashoffset = offset;
    }

    function startTimer() {
        clearInterval(timerInterval);
        updateTimerCircle();
        timerInterval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                if (timerValEl) timerValEl.textContent = formatTime(remainingTime);
                updateTimerCircle();
            } else {
                clearInterval(timerInterval);
                enableRespawn();
            }
        }, 1000);
    }

    function enableRespawn() {
        if (!btnRespawn) return;
        btnRespawn.disabled = false;
        btnRespawn.classList.remove('disabled');
        if (respawnSubText) respawnSubText.textContent = 'Tekan [E] untuk respawn di RS';
    }

    function showDownUI(data = {}) {
        totalBleedoutTime = data.duration || 300;
        remainingTime = totalBleedoutTime;
        emsSignalSent = false;

        if (medicCountEl && data.medicCount !== undefined) {
            medicCountEl.textContent = `${data.medicCount} Petugas`;
        }
        if (pulseRateEl && data.pulse) {
            pulseRateEl.textContent = `${data.pulse} BPM`;
        }
        if (timerValEl) {
            timerValEl.textContent = formatTime(remainingTime);
        }

        if (btnCallEMS) {
            btnCallEMS.disabled = false;
            btnCallEMS.classList.remove('disabled');
            if (dispatchStatusText) dispatchStatusText.textContent = 'Panggil Ambulans & Paramedis';
        }

        if (btnRespawn) {
            btnRespawn.disabled = true;
            btnRespawn.classList.add('disabled');
            if (respawnSubText) respawnSubText.textContent = 'Tunggu hingga waktu habis';
        }

        document.body.classList.add('active');
        if (container) {
            container.style.display = 'flex';
            container.classList.add('active');
        }
        startTimer();
    }

    function hideDownUI() {
        clearInterval(timerInterval);
        document.body.classList.remove('active');
        if (container) {
            container.style.display = 'none';
            container.classList.remove('active');
        }
    }

    function callEMS() {
        if (emsSignalSent) return;
        emsSignalSent = true;
        if (dispatchStatusText) dispatchStatusText.textContent = 'Sinyal terkirim ke SAMD (Menunggu)';
        if (btnCallEMS) {
            btnCallEMS.disabled = true;
            btnCallEMS.classList.add('disabled');
        }
        emitEvent('cef_onDownCallEMS');
    }

    function triggerRespawn() {
        if (remainingTime > 0) return;
        hideDownUI();
        emitEvent('cef_onDownRespawn');
    }

    // Event Bindings
    if (btnCallEMS) btnCallEMS.addEventListener('click', callEMS);
    if (btnRespawn) btnRespawn.addEventListener('click', triggerRespawn);

    window.addEventListener('keydown', (e) => {
        if (!document.body.classList.contains('active')) return;
        if (e.key === 'g' || e.key === 'G') {
            callEMS();
        } else if (e.key === 'e' || e.key === 'E') {
            triggerRespawn();
        }
    });

    // CEF / NUI Bridge
    if (window.CefBridge && typeof window.CefBridge.on === 'function') {
        window.CefBridge.on('cef:showDown', (data) => {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            showDownUI(parsed);
        });
        window.CefBridge.on('cef:hideDown', () => {
            hideDownUI();
        });
    }

    window.addEventListener('message', (event) => {
        const item = event.data;
        if (!item) return;
        if (item.action === 'showDown') {
            showDownUI(item.data);
        } else if (item.action === 'hideDown') {
            hideDownUI();
        }
    });

    // Browser Preview Mode & Standalone Web Direct Check
    const isDirectBrowser = typeof cef === 'undefined' && !window.GetParentResourceName && (window.location.protocol === 'file:' || window.location.protocol === 'http:' || window.location.protocol === 'https:');
    if (window.location.search.includes('preview=true') || isDirectBrowser) {
        showDownUI({ duration: 180, medicCount: 3, pulse: 44 });
    } else {
        // Didalam game GTA SA CEF, tambahkan class 'in-game' agar background transparan
        document.body.classList.add('in-game');
    }
})();
