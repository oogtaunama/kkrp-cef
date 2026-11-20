/**
 * KKRP Police Dispatch - JavaScript Logic
 * Kompatibel dengan FiveM NUI dan SA-MP / open.mp CEF
 */

(function () {
    'use strict';

    // Mock Dispatch Alerts
    let ALERTS_DATA = [
        {
            id: 'CALL-1082',
            code: '10-71',
            codeClass: 'code-red',
            priority: 'high',
            title: 'Penembakan Senjata Api',
            desc: 'Warga melaporkan beberapa kali letusan senjata api di dekat pom bensin. 2 orang melarikan diri menggunakan motor.',
            location: 'Idlewood Gas Station',
            time: '1 Menit Lalu',
            attachedUnits: ['Unit 2-ADAM (Hayes)']
        },
        {
            id: 'CALL-1081',
            code: '10-90',
            codeClass: 'code-orange',
            priority: 'medium',
            title: 'Alarm Perampokan Toko 24/7',
            desc: 'Sistem keamanan otomatis mendeteksi pintu kasir dijebol paksa. Tersangka diduga masih berada di dalam.',
            location: 'Rodeo 24/7 Supermarket',
            time: '4 Menit Lalu',
            attachedUnits: []
        },
        {
            id: 'CALL-1080',
            code: '10-31',
            codeClass: 'code-blue',
            priority: 'low',
            title: 'Aktivitas Mencurigakan',
            desc: 'Laporan satpam pelabuhan melihat pemindahan boks peti kemas tanpa izin resmi di dermaga timur.',
            location: 'Ocean Docks Logistics Yard',
            time: '10 Menit Lalu',
            attachedUnits: ['Unit 1-LINCOLN (Miller)']
        }
    ];

    // DOM Elements
    const appWrapper = document.getElementById('dispatchApp');
    const dispatchFeed = document.getElementById('dispatchFeed');
    const btnClose = document.getElementById('btnCloseDispatch');
    const activeAlertCountEl = document.getElementById('activeAlertCount');
    const btnClearResolved = document.getElementById('btnClearResolved');
    const miniHud = document.getElementById('dispatchMiniHud');

    function captureFocus(focused = true) {
        try {
            if (typeof CefBridge !== 'undefined' && typeof CefBridge.setFocus === 'function') {
                CefBridge.setFocus(focused);
            }
        } catch (e) {}

        try {
            if (typeof cef !== 'undefined' && cef && typeof cef.set_focus === 'function') {
                cef.set_focus(focused);
            }
        } catch (e) {}
    }

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

    // Render Alert Cards
    function renderAlerts() {
        dispatchFeed.innerHTML = '';
        activeAlertCountEl.textContent = `${ALERTS_DATA.length} Panggilan Darurat Aktif`;

        if (ALERTS_DATA.length === 0) {
            dispatchFeed.innerHTML = `
                <div style="text-align: center; padding: 48px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" style="opacity: 0.5; margin-bottom: 10px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <p>Tidak ada panggilan darurat aktif saat ini. Situasi kota terkendali.</p>
                </div>
            `;
            return;
        }

        ALERTS_DATA.forEach(alert => {
            const card = document.createElement('div');
            card.className = `dispatch-card priority-${alert.priority}`;
            card.innerHTML = `
                <div class="card-top-row">
                    <div class="code-title-wrap">
                        <span class="alert-code ${alert.codeClass}">${alert.code}</span>
                        <h3 class="call-title">${alert.title}</h3>
                    </div>
                    <span class="call-time">${alert.time}</span>
                </div>

                <p class="card-details-row">${alert.desc}</p>

                <div class="card-loc-row">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>${alert.location}</span>
                </div>

                <div class="card-bottom-actions">
                    <span class="units-attached-text">
                        Unit Merespons: <b>${alert.attachedUnits.length > 0 ? alert.attachedUnits.join(', ') : 'Belum Ada'}</b>
                    </span>
                    <div class="btn-group">
                        <button class="btn-attach" data-id="${alert.id}">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span>Tanggapi & Set GPS</span>
                        </button>
                        <button class="btn-dismiss" data-id="${alert.id}">Selesai</button>
                    </div>
                </div>
            `;

            // Tombol Respond / Attach
            const btnAttach = card.querySelector('.btn-attach');
            btnAttach.addEventListener('click', () => {
                if (!alert.attachedUnits.includes('Unit Anda')) {
                    alert.attachedUnits.push('Unit Anda');
                }
                card.classList.add('attached');
                emitToGame('cef_onDispatchRespond', alert.id, alert.location);
                if (!isGameClient()) {
                    window.alert(`GPS Checkpoint disetel ke lokasi panggilan darurat: ${alert.location}!`);
                }
                renderAlerts();
            });

            // Tombol Selesai
            const btnDismiss = card.querySelector('.btn-dismiss');
            btnDismiss.addEventListener('click', () => {
                ALERTS_DATA = ALERTS_DATA.filter(a => a.id !== alert.id);
                emitToGame('cef_onDispatchDismiss', alert.id);
                renderAlerts();
            });

            dispatchFeed.appendChild(card);
        });
    }

    // Bersihkan Selesai
    btnClearResolved.addEventListener('click', () => {
        ALERTS_DATA = [];
        renderAlerts();
    });

    // Helper Game Client
    const isGameClient = () => {
        return !!(
            (typeof window.GetParentResourceName === 'function') ||
            (typeof cef !== 'undefined' && cef !== null) ||
            (typeof window.cef !== 'undefined' && window.cef !== null)
        );
    };

    function showDispatchReopenBtn() {
        let btn = document.getElementById('previewDispatchReopenBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'previewDispatchReopenBtn';
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                Buka Kembali Police Dispatch (Pratinjau)
            `;
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                background: linear-gradient(135deg, #ff9e44, #ff7a18);
                color: #0c0e12;
                font-family: 'Inter', sans-serif;
                font-weight: 700;
                font-size: 14px;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(255, 122, 24, 0.4);
                z-index: 99999;
                transition: transform 0.2s, box-shadow 0.2s;
            `;
            btn.addEventListener('mouseenter', () => btn.style.transform = 'translateX(-50%) scale(1.05)');
            btn.addEventListener('mouseleave', () => btn.style.transform = 'translateX(-50%) scale(1)');
            btn.addEventListener('click', () => {
                btn.remove();
                showDispatch();
            });
            document.body.appendChild(btn);
        }
    }

    function closeDispatchUI() {
        appWrapper.style.display = 'none';
        captureFocus(false);
        emitToGame('cef_onDispatchClose');

        if (!isGameClient()) {
            showDispatchReopenBtn();
        }
    }

    btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeDispatchUI();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            e.preventDefault();
            if (appWrapper.style.display !== 'none') {
                closeDispatchUI();
            }
        }
    });

    function showDispatch() {
        document.body.classList.add('active');
        appWrapper.style.display = 'flex';
        captureFocus(true);
    }

    // Bridge Listeners
    function setupBridge() {
        emitToGame('cef_onDispatchReady');

        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.on === 'function') {
            CefBridge.on('cef:openDispatch', () => {
                showDispatch();
            });

            CefBridge.on('cef:newAlert', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                if (parsed) {
                    ALERTS_DATA.unshift(parsed);
                    renderAlerts();
                }
            });

            CefBridge.on('cef:closeDispatch', () => {
                appWrapper.style.display = 'none';
                captureFocus(false);
            });
        }

        window.addEventListener('message', (event) => {
            const item = event.data;
            if (!item) return;

            if (item.action === 'dispatch:open' || item.action === 'openDispatch') {
                showDispatch();
            } else if (item.action === 'dispatch:close' || item.action === 'closeDispatch') {
                appWrapper.style.display = 'none';
                captureFocus(false);
            } else if (item.action === 'dispatch:newAlert') {
                if (item.data) {
                    ALERTS_DATA.unshift(item.data);
                    renderAlerts();
                }
            }
        });
    }

    // Inisialisasi
    renderAlerts();
    setupBridge();

    if (isGameClient()) {
        document.body.classList.add('in-game');
    } else {
        document.body.classList.add('preview-mode');
        document.documentElement.classList.add('preview-mode');
        showDispatch();
    }
})();
