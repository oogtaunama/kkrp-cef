/**
 * CEF Bridge Library - Kota Kecilku Roleplay / open.mp CEF Interface
 * Menangani komunikasi dua arah antara Web UI (JavaScript) dan Server/Client Game (Pawn / C++)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CefBridge = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    class CefBridgeService {
        constructor() {
            this.listeners = new Map();
            this.debugMode = true;
            this.mockServerEnabled = !this.isAvailable();

            this._initGlobalListeners();
        }

        /**
         * Cek apakah UI sedang berjalan di dalam engine game (CEF)
         * @returns {boolean}
         */
        isAvailable() {
            return (typeof cef !== 'undefined' && cef !== null) || 
                   (typeof window !== 'undefined' && typeof window.cef !== 'undefined' && window.cef !== null);
        }

        getCefApi() {
            if (typeof cef !== 'undefined' && cef !== null) return cef;
            if (typeof window !== 'undefined' && typeof window.cef !== 'undefined' && window.cef !== null) return window.cef;
            return null;
        }

        /**
         * Set input & mouse focus pada browser CEF
         * @param {boolean} focused - true untuk menangkap kursor mouse & keyboard, false untuk mengembalikan kontrol ke game GTA
         */
        setFocus(focused = true) {
            try {
                const api = this.getCefApi();
                if (api && typeof api.set_focus === 'function') {
                    api.set_focus(focused);
                    if (this.debugMode) {
                        console.log(`[CEF BRIDGE] cef.set_focus(${focused}) executed.`);
                    }
                    return true;
                }
            } catch (e) {
                console.error('[CEF BRIDGE] setFocus error:', e);
            }
            return false;
        }

        /**
         * Keluar dari game langsung via CEF
         */
        exitGame() {
            try {
                const api = this.getCefApi();
                if (api && typeof api.exitGame === 'function') {
                    api.exitGame();
                    return true;
                }
            } catch (e) {
                console.error('[CEF BRIDGE] exitGame error:', e);
            }
            return false;
        }

        /**
         * Inisialisasi listener bawaan browser & event adapter
         * @private
         */
        _initGlobalListeners() {
            // 1. Tangani event kustom 'cef:event' yang disalurkan dari C++ / client plugin
            window.addEventListener('cef:event', (event) => {
                const detail = event.detail || {};
                const eventName = detail.name || detail.event || detail.type;
                let args = detail.args || detail.params || [];

                if (!Array.isArray(args)) {
                    args = args !== undefined ? [args] : [];
                }

                if (this.debugMode) {
                    console.log(`%c[CEF RX (cef:event)]%c ${eventName}`, 'color: #06b6d4; font-weight: bold;', 'color: inherit;', args);
                }

                if (eventName) {
                    this._dispatch(eventName, args);
                }
            });

            // 2. Logging status saat inisialisasi
            if (this.isAvailable()) {
                console.log('%c[CEF BRIDGE] Running inside Game Client Engine.%c', 'color: #10b981; font-weight: bold;', 'color: inherit;');
            } else {
                console.warn('%c[CEF BRIDGE] Standalone Browser Mode (Mock Engine Active)%c', 'color: #f59e0b; font-weight: bold;', 'color: inherit;');
            }

            // 3. Keamanan CEF GTA SA: Blokir menu klik kanan default (View Source/Print/Back) & shortcut developer
            this._applySecurityProtections();
        }

        /**
         * Mengamankan antarmuka CEF dari context menu dan inspection shortcut
         * @private
         */
        _applySecurityProtections() {
            // Blokir menu klik kanan (context menu default CEF/Chromium)
            window.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            }, { capture: true });

            // Blokir shortcut browser umum (F12, Inspect Element, View Source, Print, Refresh)
            window.addEventListener('keydown', (e) => {
                // F12 (DevTools)
                if (e.key === 'F12' || e.keyCode === 123) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                // Ctrl+Shift+I / J / C (DevTools & Console)
                if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                // Ctrl+U (View Page Source)
                if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                // Ctrl+P (Print)
                if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                // Ctrl+S (Save Page)
                if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, { capture: true });

            // Cegah drag-and-drop elemen yang tidak sengaja
            window.addEventListener('dragstart', (e) => {
                if (e.target.tagName === 'IMG' || e.target.tagName === 'A') {
                    e.preventDefault();
                }
            });
        }

        /**
         * Kirim event dan data dari Web UI ke Server (Pawn)
         * @param {string} eventName - Nama event yang dituju (misal: "client:onLoginSubmit")
         * @param  {...any} args - Parameter yang dikirim ke server
         */
        emit(eventName, ...args) {
            if (this.debugMode) {
                console.log(`%c[CEF TX]%c ${eventName}`, 'color: #10b981; font-weight: bold;', 'color: inherit;', args);
            }

            try {
                const api = this.getCefApi();
                if (api && typeof api.emit === 'function') {
                    api.emit(eventName, ...args);
                    return;
                }
            } catch (e) {
                console.error('[CEF BRIDGE] emit error:', e);
            }

            // Fallback / Preview Mode di Browser Standalone
            if (this.mockServerEnabled) {
                this._handleMockEmit(eventName, args);
            }
        }

        /**
         * Daftarkan listener untuk mendengarkan panggilan event dari Server (Pawn)
         * @param {string} eventName - Nama event yang ingin didengar
         * @param {Function} callback - Fungsi callback penangan event
         */
        on(eventName, callback) {
            if (typeof callback !== 'function') return;

            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, new Set());
            }
            this.listeners.get(eventName).add(callback);

            const cefApi = this.getCefApi();
            // Jika API bawaan cef.on tersedia di client plugin, daftarkan juga
            if (cefApi && typeof cefApi.on === 'function') {
                try {
                    cefApi.on(eventName, (...args) => {
                        this._dispatch(eventName, args);
                    });
                } catch (e) {
                    // Abaikan jika sudah di-handle oleh window event
                }
            }

            // Dengarkan juga jika event dikirim sebagai standard DOM CustomEvent dengan nama event itu sendiri
            window.addEventListener(eventName, (e) => {
                const detail = e.detail;
                const args = Array.isArray(detail) ? detail : [detail];
                callback(...args);
            });
        }

        /**
         * Hapus listener tertentu
         * @param {string} eventName 
         * @param {Function} callback 
         */
        off(eventName, callback) {
            if (!this.listeners.has(eventName)) return;
            if (!callback) {
                this.listeners.delete(eventName);
                return;
            }
            this.listeners.get(eventName).delete(callback);
        }

        /**
         * Trigger event lokal (berguna untuk simulasi / testing)
         * @param {string} eventName 
         * @param  {...any} args 
         */
        trigger(eventName, ...args) {
            this._dispatch(eventName, args);
        }

        /**
         * Eksekusi callback internal yang terdaftar
         * @private
         */
        _dispatch(eventName, args) {
            const set = this.listeners.get(eventName);
            if (set && set.size > 0) {
                set.forEach((cb) => {
                    try {
                        cb(...args);
                    } catch (err) {
                        console.error(`[CEF BRIDGE ERROR] Error in listener '${eventName}':`, err);
                    }
                });
            }
        }

        /**
         * Penanganan otomatis Mock Server saat diuji coba di browser Chrome/Edge tanpa GTA
         * @private
         */
        _handleMockEmit(eventName, args) {
            console.info(`%c[MOCK SERVER]%c Memproses panggilan '${eventName}'...`, 'color: #8b5cf6;', 'color: inherit;');

            if (eventName === 'cef_onPlayerLoginSubmit' || eventName === 'client:onLoginSubmit') {
                const pass = args[args.length - 1];
                setTimeout(() => {
                    if (pass === 'dinar123') {
                        this.trigger('loginSuccess');
                    } else {
                        this.trigger('loginError', 'Kata sandi tidak sesuai!');
                    }
                }, 600);
            } else if (eventName === 'cef_onPlayerSelectChar') {
                console.info('[MOCK SERVER] Karakter dipilih:', args);
            } else if (eventName === 'cef_onPlayerCreateChar') {
                setTimeout(() => {
                    this.trigger('charCreateSuccess', `${args[0]}_${args[1]}`);
                }, 600);
            }
        }
    }

    return new CefBridgeService();
}));
