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

            const cefApi = this.getCefApi();
            if (cefApi && typeof cefApi.emit === 'function') {
                cefApi.emit(eventName, ...args);
            } else {
                // Fallback / Preview Mode di Browser Standalone
                if (this.mockServerEnabled) {
                    this._handleMockEmit(eventName, args);
                }
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

            setTimeout(() => {
                switch (eventName) {
                    case 'client:onLoginSubmit': {
                        const [username, password] = args;
                        if (password === 'salah') {
                            this._dispatch('server:onLoginResponse', [{
                                success: false,
                                message: 'Password yang Anda masukkan salah! (Coba password lain)'
                            }]);
                        } else {
                            this._dispatch('server:onLoginResponse', [{
                                success: true,
                                ucpName: username || 'Arya_Pratama',
                                message: 'Login berhasil! Memuat karakter...'
                            }]);

                            // Simulasi pengiriman data karakter setelah login berhasil
                            setTimeout(() => {
                                this._dispatch('server:onLoadCharacters', [{
                                    characters: [
                                        {
                                            id: 1,
                                            name: 'Arya Pratama',
                                            level: 12,
                                            job: 'Mechanic Specialist',
                                            money: 24500,
                                            bank: 150000,
                                            skinId: 294,
                                            gender: 'male',
                                            status: 'active',
                                            lastPlayed: 'Hari ini, 14:20'
                                        },
                                        {
                                            id: 2,
                                            name: 'Sarah Jenkins',
                                            level: 5,
                                            job: 'Paramedic EMT',
                                            money: 8200,
                                            bank: 45000,
                                            skinId: 91,
                                            gender: 'female',
                                            status: 'active',
                                            lastPlayed: 'Kemarin, 21:05'
                                        }
                                    ],
                                    maxSlots: 3
                                }]);
                            }, 600);
                        }
                        break;
                    }

                    case 'client:onRegisterSubmit': {
                        const [data] = args;
                        this._dispatch('server:onRegisterResponse', [{
                            success: true,
                            message: `Pendaftaran akun ${data.username} berhasil! Silakan login.`
                        }]);
                        break;
                    }

                    case 'client:onSelectCharacter': {
                        const [charId] = args;
                        console.info(`%c[MOCK SERVER]%c Karakter ID: ${charId} dipilih untuk spawn di open.mp world.`, 'color: #10b981; font-weight: bold;', 'color: inherit;');
                        this._dispatch('server:onSpawnSuccess', [{ charId }]);
                        break;
                    }

                    case 'client:onForgotPassword': {
                        const [emailOrUcp] = args;
                        this._dispatch('server:onForgotResponse', [{
                            success: true,
                            message: `Kode pemulihan telah dikirim ke email/Discord terhubung untuk '${emailOrUcp}'.`
                        }]);
                        break;
                    }

                    case 'client:onQuitGame': {
                        alert('[MOCK SERVER] Game akan ditutup (OnPlayerQuitGame)');
                        break;
                    }
                }
            }, 600);
        }
    }

    return new CefBridgeService();
}));
