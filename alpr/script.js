/**
 * KKRP Police ALPR Radar - JavaScript Logic
 * Kompatibel dengan FiveM NUI dan SA-MP / open.mp CEF
 */

(function () {
    'use strict';

    // State
    let isFrontLocked = false;
    let isRearLocked = true;

    // DOM Elements
    const appWrapper = document.getElementById('alprApp');
    const patrolSpeedEl = document.getElementById('patrolSpeed');
    const btnRadarPower = document.getElementById('btnRadarPower');

    // Front
    const frontSpeedEl = document.getElementById('frontSpeed');
    const frontPlateEl = document.getElementById('frontPlate');
    const frontModelEl = document.getElementById('frontModel');
    const frontOwnerEl = document.getElementById('frontOwner');
    const frontStatusEl = document.getElementById('frontStatus');
    const frontLockStateEl = document.getElementById('frontLockState');
    const btnLockFront = document.getElementById('btnLockFront');

    // Rear
    const rearSpeedEl = document.getElementById('rearSpeed');
    const rearPlateEl = document.getElementById('rearPlate');
    const rearModelEl = document.getElementById('rearModel');
    const rearOwnerEl = document.getElementById('rearOwner');
    const rearStatusEl = document.getElementById('rearStatus');
    const rearLockStateEl = document.getElementById('rearLockState');
    const btnLockRear = document.getElementById('btnLockRear');

    function emitToGame(eventName, ...args) {
        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.emit === 'function') {
            CefBridge.emit(eventName, ...args);
        } else if (typeof cef !== 'undefined' && cef && typeof cef.emit === 'function') {
            cef.emit(eventName, ...args);
        }

        try {
            if (window.GetParentResourceName) {
                const payload = args.length === 1 ? args[0] : args;
                fetch(`https://${GetParentResourceName()}/${eventName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(payload || {})
                }).catch(() => {});
            }
        } catch (e) {}
    }

    // Toggle Front Lock
    btnLockFront.addEventListener('click', () => {
        isFrontLocked = !isFrontLocked;
        if (isFrontLocked) {
            btnLockFront.classList.add('btn-locked');
            btnLockFront.textContent = 'LOCKED [NUM 8]';
            frontLockStateEl.textContent = 'LOCKED';
            frontLockStateEl.className = 'antenna-state alert-state';
        } else {
            btnLockFront.classList.remove('btn-locked');
            btnLockFront.textContent = 'LOCK [NUM 8]';
            frontLockStateEl.textContent = 'SCANNING';
            frontLockStateEl.className = 'antenna-state';
        }
        emitToGame('cef_onAlprLock', 'front', isFrontLocked ? 1 : 0);
    });

    // Toggle Rear Lock
    btnLockRear.addEventListener('click', () => {
        isRearLocked = !isRearLocked;
        if (isRearLocked) {
            btnLockRear.classList.add('btn-locked');
            btnLockRear.textContent = 'LOCKED [NUM 2]';
            rearLockStateEl.textContent = 'FAST LOCKED';
            rearLockStateEl.className = 'antenna-state alert-state';
        } else {
            btnLockRear.classList.remove('btn-locked');
            btnLockRear.textContent = 'LOCK [NUM 2]';
            rearLockStateEl.textContent = 'SCANNING';
            rearLockStateEl.className = 'antenna-state';
        }
        emitToGame('cef_onAlprLock', 'rear', isRearLocked ? 1 : 0);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Num8' || e.code === 'Numpad8') {
            btnLockFront.click();
        } else if (e.key === 'Num2' || e.code === 'Numpad2') {
            btnLockRear.click();
        } else if (e.key === 'Escape') {
            closeRadar();
        }
    });

    if (btnRadarPower) {
        btnRadarPower.addEventListener('click', () => {
            closeRadar();
        });
    }

    const isGameClient = () => {
        return !!(
            (typeof window.GetParentResourceName === 'function') ||
            (typeof cef !== 'undefined' && cef !== null) ||
            (typeof window.cef !== 'undefined' && window.cef !== null)
        );
    };

    function showAlprReopenBtn() {
        let btn = document.getElementById('previewAlprReopenBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'previewAlprReopenBtn';
            btn.innerHTML = `Buka Kembali Radar ALPR (Pratinjau)`;
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                padding: 10px 20px;
                background: linear-gradient(135deg, #ff9e44, #ff7a18);
                color: #0c0e12;
                font-family: 'Inter', sans-serif;
                font-weight: 700;
                font-size: 13px;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(255, 122, 24, 0.4);
                z-index: 99999;
            `;
            btn.addEventListener('click', () => {
                btn.remove();
                appWrapper.style.display = 'block';
            });
            document.body.appendChild(btn);
        }
    }

    function closeRadar() {
        document.body.classList.remove('active');
        appWrapper.style.display = 'none';
        emitToGame('cef_onAlprClose');
        if (!isGameClient()) {
            showAlprReopenBtn();
        }
    }

    function showRadar(data) {
        document.body.classList.remove('in-game');
        document.body.classList.add('active');
        appWrapper.style.display = 'block';
        if (data) {
            updateAlprData(data);
        }
    }

    function updateAlprData(parsed) {
        if (!parsed) return;
        if (parsed.patrolSpeed) patrolSpeedEl.textContent = `PATROL: ${parsed.patrolSpeed} MPH`;
        if (parsed.front && !isFrontLocked) {
            frontSpeedEl.textContent = parsed.front.speed || '0';
            frontPlateEl.textContent = parsed.front.plate || '---';
            frontModelEl.textContent = parsed.front.model || 'Unknown';
            frontOwnerEl.textContent = parsed.front.owner || 'Unknown';
            if (parsed.front.bolo) {
                frontPlateEl.style.color = '#ef4444';
            } else {
                frontPlateEl.style.color = '#ff9e44';
            }
        }
        if (parsed.rear && !isRearLocked) {
            rearSpeedEl.textContent = parsed.rear.speed || '0';
            rearPlateEl.textContent = parsed.rear.plate || '---';
            rearModelEl.textContent = parsed.rear.model || 'Unknown';
            rearOwnerEl.textContent = parsed.rear.owner || 'Unknown';
            if (parsed.rear.bolo) {
                rearPlateEl.style.color = '#ef4444';
            } else {
                rearPlateEl.style.color = '#ff9e44';
            }
        }
    }

    // Bridge Update Data Live
    function setupBridge() {
        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.on === 'function') {
            CefBridge.on('cef:openAlpr', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showRadar(parsed);
            });

            CefBridge.on('cef:closeAlpr', () => {
                closeRadar();
            });

            CefBridge.on('cef:updateAlpr', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                updateAlprData(parsed);
            });

            CefBridge.on('cef:toggleAlpr', (show) => {
                if (show) showRadar();
                else closeRadar();
            });
        }

        if (typeof cef !== 'undefined' && cef && typeof cef.on === 'function') {
            cef.on('cef:openAlpr', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showRadar(parsed);
            });
            cef.on('cef:closeAlpr', () => {
                closeRadar();
            });
            cef.on('cef:updateAlpr', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                updateAlprData(parsed);
            });
        }

        window.addEventListener('message', (event) => {
            const item = event.data;
            if (!item) return;

            if (item.action === 'showAlpr' || item.action === 'openAlpr') {
                showRadar(item.data);
            } else if (item.action === 'hideAlpr' || item.action === 'closeAlpr') {
                closeRadar();
            } else if (item.action === 'updateAlpr') {
                updateAlprData(item.data);
            }
        });

        // Beritahu client bahwa bridge ALPR telah siap
        emitToGame('cef_onAlprReady');
    }

    setupBridge();

    if (isGameClient()) {
        document.body.classList.add('in-game');
    } else {
        document.body.classList.add('preview-mode');
        document.documentElement.classList.add('preview-mode');
        showRadar();
    }
})();
