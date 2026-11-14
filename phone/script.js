/**
 * KKRP FIVEM SMARTPHONE CONTROLLER - iOS SYSTEM
 * Integrated with open.mp CEF Bridge
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. SOUND FX SYNTHESIZER (Web Audio API - Zero External Dependencies)
    // =========================================================================
    const PhoneSvg = {
        phone: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
        phoneMissed: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1 0-1.41C3.41 8.65 7.46 7 12 7s8.59 1.65 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>',
        comment: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
        trash: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
        heart: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
        heartEmpty: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>',
        car: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>',
        location: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
        crosshairs: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
        bell: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
        volume: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
        plane: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
        camera: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>',
        xTwitter: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    };

    const PhoneAudio = {
        ctx: null,
        ringtoneInterval: null,
        ringbackInterval: null,
        soundEnabled: true,

        init() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext && !this.ctx) {
                    this.ctx = new AudioContext();
                }
            } catch (e) {
                console.warn('[Phone Audio] Web Audio API tidak didukung:', e);
            }
        },

        ensureActive() {
            if (!this.ctx) this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },

        // Play DTMF Tone for Phone Keypad (0-9, *, #)
        playDTMF(key) {
            if (!this.soundEnabled) return;
            this.ensureActive();
            if (!this.ctx) return;

            const dtmfFreqs = {
                '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
                '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
                '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
                '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
            };

            const freqs = dtmfFreqs[key];
            if (!freqs) return;

            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(freqs[0], now);
            osc2.frequency.setValueAtTime(freqs[1], now);

            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.12);
            osc2.stop(now + 0.12);
        },

        // iOS Lock / Click Tick
        playClick() {
            if (!this.soundEnabled) return;
            this.ensureActive();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.03);
        },

        // Message Sent Chime (Swoosh)
        playMessageSent() {
            if (!this.soundEnabled) return;
            this.ensureActive();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        },

        // Notification Ding
        playNotification() {
            if (!this.soundEnabled) return;
            this.ensureActive();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            [587.33, 880.00].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const start = now + (idx * 0.08);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.08, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(start);
                osc.stop(start + 0.25);
            });
        },

        // Camera Shutter Snap
        playShutter() {
            if (!this.soundEnabled) return;
            this.ensureActive();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.06);
        },

        // Incoming Call Ringtone (Synthesized Marimba Melody)
        startRingtone() {
            if (!this.soundEnabled) return;
            this.stopRingtone();
            this.ensureActive();
            if (!this.ctx) return;

            const playMelody = () => {
                const notes = [
                    { f: 659.25, d: 0.12 }, // E5
                    { f: 587.33, d: 0.12 }, // D5
                    { f: 739.99, d: 0.24 }, // F#5
                    { f: 830.61, d: 0.24 }, // G#5
                    { f: 659.25, d: 0.12 }, // E5
                    { f: 587.33, d: 0.12 }, // D5
                    { f: 493.88, d: 0.35 }  // B4
                ];

                let timeOffset = 0;
                notes.forEach(note => {
                    const now = this.ctx.currentTime + timeOffset;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(note.f, now);

                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + note.d);

                    timeOffset += note.d + 0.04;
                });
            };

            playMelody();
            this.ringtoneInterval = setInterval(() => {
                if (this.soundEnabled) playMelody();
            }, 2600);
        },

        stopRingtone() {
            if (this.ringtoneInterval) {
                clearInterval(this.ringtoneInterval);
                this.ringtoneInterval = null;
            }
        },

        // Outgoing Ringback Tone
        startRingback() {
            if (!this.soundEnabled) return;
            this.stopRingback();
            this.ensureActive();
            if (!this.ctx) return;

            const playPulse = () => {
                const now = this.ctx.currentTime;
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.setValueAtTime(440, now);
                osc2.frequency.setValueAtTime(480, now);

                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.ctx.destination);

                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 1.2);
                osc2.stop(now + 1.2);
            };

            playPulse();
            this.ringbackInterval = setInterval(() => {
                if (this.soundEnabled) playPulse();
            }, 3000);
        },

        stopRingback() {
            if (this.ringbackInterval) {
                clearInterval(this.ringbackInterval);
                this.ringbackInterval = null;
            }
        }
    };

    // =========================================================================
    // 2. STATE MANAGER & DATA STORE
    // =========================================================================
    const PhoneState = {
        isOpen: false,
        isLocked: true,
        currentView: 'viewLockScreen', // Base active screen starts at lock screen
        historyStack: [],
        airplaneMode: false,
        soundMode: true,
        darkMode: true,
        wallpaper: 'ios13-wave',

        // Character Phone Info
        ownerName: 'Warga Los Santos',
        phoneNumber: '0812-9988-7711',
        bankBalance: 78500,
        bankCardNum: '4112 5590 8821 7711',

        // Call State
        activeCall: {
            isActive: false,
            targetNumber: '',
            targetName: '',
            startTime: null,
            timerInterval: null,
            isSpeaker: false,
            isMuted: false
        },
        incomingCall: {
            isActive: false,
            fromNumber: '',
            fromName: ''
        },

        // Calculator State
        calc: {
            current: '0',
            formula: '',
            waitingForOperand: false,
            operator: null,
            prevValue: null
        },

        // Data Arrays
        contacts: [],
        messages: [],
        activeChatContact: null,
        vehicles: [],
        twitterFeed: [],
        yellowpages: [],
        photos: [],
        notes: [],
        recents: []
    };

    // =========================================================================
    // 3. UI CONTROLLER & VIEW ROUTER
    // =========================================================================
    const PhoneUI = {
        wrapper: document.getElementById('phoneWrapper'),
        screen: document.getElementById('phoneScreen'),

        init() {
            // Ensure phone screen starts locked cleanly
            if (this.screen) {
                this.screen.classList.add('is-locked');
            }

            // Set wallpaper from storage or state
            const savedWall = localStorage.getItem('kkrp_phone_wallpaper') || 'ios13-wave';
            PhoneState.wallpaper = savedWall;
            this.setWallpaper(savedWall);

            this.updateClock();
            setInterval(() => this.updateClock(), 1000);

            this.bindEvents();
            this.loadInitialMockData();

            // Notify CEF / Pawn that Phone UI is Ready
            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneReady');
            }

            // Standalone Browser Detection (Preview Mode)
            if (!window.CefBridge || !CefBridge.isAvailable()) {
                document.body.classList.add('browser-preview');
                // Automatically open phone on Lock Screen in preview mode
                this.showPhone(false);
            }
        },

        // Update Status Bar & Lock Screen Clocks
        updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            const statusClock = document.getElementById('statusClock');
            const lockTime = document.getElementById('lockTime');
            if (statusClock) statusClock.textContent = timeStr;
            if (lockTime) lockTime.textContent = timeStr;

            // Date formatting in Indonesian
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const lockDate = document.getElementById('lockDate');
            if (lockDate) {
                lockDate.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
            }
        },

        // Show / Open Smartphone
        showPhone(unlocked = false) {
            PhoneState.isOpen = true;
            this.wrapper.classList.add('phone-visible');
            PhoneAudio.playClick();

            if (unlocked) {
                this.unlockPhone(false);
            } else {
                this.lockPhone(false);
            }
        },

        // Hide / Close Smartphone
        hidePhone() {
            PhoneState.isOpen = false;
            this.wrapper.classList.remove('phone-visible');
            PhoneAudio.playClick();

            // End active or incoming call if closed
            if (PhoneState.incomingCall.isActive) {
                this.declineCall();
            }

            // Kembalikan ke Homescreen bersih agar buka HP berikutnya langsung normal
            this.goHome();

            // Emit close to server
            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneClose');
            }
        },

        // Unlock Phone (From Lock Screen -> Home Screen)
        unlockPhone(playSound = true) {
            PhoneState.isLocked = false;
            if (playSound) PhoneAudio.playClick();

            if (this.screen) {
                this.screen.classList.remove('is-locked');
            }

            const lockEl = document.getElementById('viewLockScreen');
            if (lockEl) {
                lockEl.classList.add('unlocked');
                lockEl.classList.remove('active');
                lockEl.style.transform = '';
                lockEl.style.opacity = '';
            }

            // Reveal home screen cleanly
            this.switchView('viewHomeScreen', false);
        },

        // Lock Phone (Go back to Lock Screen)
        lockPhone(playSound = true) {
            PhoneState.isLocked = true;
            if (playSound) PhoneAudio.playClick();

            if (this.screen) {
                this.screen.classList.add('is-locked');
            }

            const lockEl = document.getElementById('viewLockScreen');
            if (lockEl) {
                lockEl.classList.remove('unlocked');
                lockEl.classList.add('active');
                lockEl.style.transform = '';
                lockEl.style.opacity = '';
            }

            // Sembunyikan seluruh tampilan aplikasi dan menu home agar lockscreen murni bersih
            document.querySelectorAll('.screen-view:not(.screen-lock)').forEach(el => el.classList.remove('active'));
            PhoneState.currentView = 'viewLockScreen';
        },

        // Switch Screen View
        switchView(viewId, pushHistory = true) {
            const targetEl = document.getElementById(viewId);
            if (!targetEl) return;

            if (pushHistory && PhoneState.currentView && PhoneState.currentView !== viewId && PhoneState.currentView !== 'viewLockScreen') {
                PhoneState.historyStack.push(PhoneState.currentView);
            }

            // Hapus class .active dari SELURUH screen-view untuk memastikan tidak ada screen yang tertinggal/stuck
            document.querySelectorAll('.screen-view').forEach(el => {
                if (el.id !== viewId) {
                    el.classList.remove('active');
                }
            });

            targetEl.classList.add('active');
            PhoneState.currentView = viewId;
        },

        // Go Back to Home Screen
        goHome() {
            PhoneAudio.playClick();
            PhoneState.historyStack = [];
            this.switchView('viewHomeScreen', false);
        },

        // Set Wallpaper
        setWallpaper(wallName) {
            PhoneState.wallpaper = wallName;
            this.screen.setAttribute('data-wallpaper', wallName);
            localStorage.setItem('kkrp_phone_wallpaper', wallName);

            // Update wallpaper preset active state in Settings
            document.querySelectorAll('.wall-preset').forEach(preset => {
                if (preset.getAttribute('data-wall') === wallName) {
                    preset.classList.add('active');
                } else {
                    preset.classList.remove('active');
                }
            });

            // Inform server if needed
            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneSetWallpaper', wallName);
            }
        },

        // iOS Top Notification Banner (Persis FiveM iOS Card di Bawah Notch)
        showNotification(title, desc, iconSvg = 'bell', appTarget = null) {
            PhoneAudio.playNotification();
            const notif = document.getElementById('notchNotification');
            const notifTitle = document.getElementById('notifTitle');
            const notifDesc = document.getElementById('notifDesc');
            const notifIcon = document.getElementById('notifIcon');
            const notifAppName = document.getElementById('notifAppName');
            const notifIconBox = document.getElementById('notifIconBox');

            // Tentukan App Name & Warna Ikon iOS
            let appName = 'Kota Kecilku';
            let iconBg = '#0284c7';
            let iconCode = PhoneSvg[iconSvg] || iconSvg || PhoneSvg.bell;

            if (appTarget === 'twitter' || iconSvg === 'xTwitter' || (title && title.includes('Chirper')) || (title && title.includes('@'))) {
                appName = 'Twitter';
                iconBg = '#1d9bf0';
                iconCode = PhoneSvg.xTwitter;
                appTarget = 'twitter';
            } else if (appTarget === 'messages' || iconSvg === 'comment' || (title && title.toLowerCase().includes('pesan'))) {
                appName = 'Pesan';
                iconBg = '#34c759';
                iconCode = PhoneSvg.comment;
                appTarget = 'messages';
            } else if (appTarget === 'phone' || iconSvg === 'phone' || (title && title.toLowerCase().includes('panggilan'))) {
                appName = 'Telepon';
                iconBg = '#30d158';
                iconCode = PhoneSvg.phone;
                appTarget = 'phone';
            } else if (appTarget === 'contacts' || (title && title.toLowerCase().includes('kontak'))) {
                appName = 'Kontak';
                iconBg = '#6366f1';
                iconCode = PhoneSvg.contacts;
                appTarget = 'contacts';
            } else if (appTarget === 'bank' || (title && title.toLowerCase().includes('bank'))) {
                appName = 'Fleeca Bank';
                iconBg = '#10b981';
                iconCode = PhoneSvg.bank;
                appTarget = 'bank';
            }

            if (notifAppName) notifAppName.textContent = appName;
            if (notifIconBox) notifIconBox.style.backgroundColor = iconBg;
            if (notifIcon) notifIcon.innerHTML = iconCode;
            if (notifTitle) notifTitle.textContent = title || appName;
            if (notifDesc) notifDesc.textContent = desc || '';

            if (notif) {
                notif.classList.add('show');
                clearTimeout(this._notifTimeout);

                // Click banner to open target app or active action screen
                notif.onclick = () => {
                    notif.classList.remove('show');
                    if (PhoneState.isLocked) PhoneUI.unlockPhone(false);

                    if (PhoneState.incomingCall.isActive) {
                        PhoneUI.switchView('viewIncomingCall', false);
                        return;
                    }
                    if (PhoneState.activeCall.isActive) {
                        PhoneUI.switchView('viewActiveCall', false);
                        return;
                    }
                    if (PhoneState.incomingShare) {
                        document.getElementById('modalConfirmShare')?.classList.add('active');
                        return;
                    }
                    if (appTarget) {
                        PhoneUI.openApp(appTarget);
                    }
                };

                this._notifTimeout = setTimeout(() => {
                    notif.classList.remove('show');
                }, 4500);
            }
        },

        // Floating Bottom Pop-up Notification (Tetap didukung & sinkron)
        showBottomNotification(title, message, iconSvg = 'bell') {
            this.showNotification(title, message, iconSvg);
            const bottomCard = document.getElementById('bottomNotificationCard');
            const bottomTitle = document.getElementById('bottomNotifTitle');
            const bottomMsg = document.getElementById('bottomNotifMsg');
            const bottomIcon = document.getElementById('bottomNotifIcon');
            if (bottomCard) {
                if (bottomTitle) bottomTitle.textContent = title || 'Notifikasi';
                if (bottomMsg) bottomMsg.textContent = message || '';
                if (bottomIcon && PhoneSvg[iconSvg]) bottomIcon.innerHTML = PhoneSvg[iconSvg];
                bottomCard.classList.add('show');
                clearTimeout(this._bottomNotifTimeout);
                this._bottomNotifTimeout = setTimeout(() => {
                    bottomCard.classList.remove('show');
                }, 4500);
            }
        },

        // Open App by Name
        openApp(appName) {
            PhoneAudio.playClick();
            switch (appName) {
                case 'phone':
                    this.switchView('viewAppPhone');
                    break;
                case 'messages':
                    this.renderMessagesThreadList();
                    this.switchView('viewAppMessages');
                    break;
                case 'contacts':
                    this.renderContactsList();
                    this.switchView('viewAppContacts');
                    break;
                case 'bank':
                    this.renderBankView();
                    this.switchView('viewAppBank');
                    break;
                case 'twitter':
                    this.renderTwitterFeed();
                    this.switchView('viewAppTwitter');
                    break;
                case 'garage':
                    this.renderGarageList();
                    this.switchView('viewAppGarage');
                    break;
                case 'yellowpages':
                    this.renderYellowpagesFeed();
                    this.switchView('viewAppYellowpages');
                    break;
                case 'dispatch':
                    this.switchView('viewAppDispatch');
                    break;
                case 'camera':
                    this.switchView('viewAppCamera');
                    break;
                case 'photos':
                    this.renderPhotosGrid();
                    this.switchView('viewAppPhotos');
                    break;
                case 'notes':
                    this.renderNotesList();
                    this.switchView('viewAppNotes');
                    break;
                case 'calculator':
                    this.switchView('viewAppCalculator');
                    break;
                case 'settings':
                    this.renderSettingsView();
                    this.switchView('viewAppSettings');
                    break;
                default:
                    console.log('App belum diimplementasikan:', appName);
            }
        },

        // =====================================================================
        // 4. APP LOGIC: PHONE & CALLS
        // =====================================================================
        startCall(number) {
            if (!number || number.trim() === '') return;
            if (PhoneState.airplaneMode) {
                this.showNotification('Mode Pesawat', 'Matikan mode pesawat untuk melakukan panggilan.');
                return;
            }

            PhoneState.activeCall.isActive = true;
            PhoneState.activeCall.targetNumber = number;
            
            // Look up contact name
            const contact = PhoneState.contacts.find(c => c.number === number);
            PhoneState.activeCall.targetName = contact ? contact.name : number;

            // Update Call UI
            const callNameEl = document.getElementById('callName');
            const callNumberEl = document.getElementById('callNumber');
            const callStatusEl = document.getElementById('callStatusText');
            const callTimerEl = document.getElementById('callTimer');

            if (callNameEl) callNameEl.textContent = PhoneState.activeCall.targetName;
            if (callNumberEl) callNumberEl.textContent = number;
            if (callStatusEl) callStatusEl.textContent = 'Menghubungkan...';
            if (callTimerEl) callTimerEl.textContent = '00:00';

            this.switchView('viewActiveCall', false);
            PhoneAudio.startRingback();

            // Emit to server
            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneCall', number);
            }

            // In Mock Standalone Mode, auto-connect call in 3 seconds
            if (!window.CefBridge || !CefBridge.isAvailable()) {
                setTimeout(() => {
                    this.onCallConnected();
                }, 3000);
            }
        },

        onCallConnected() {
            PhoneAudio.stopRingback();
            const callStatusEl = document.getElementById('callStatusText');
            if (callStatusEl) callStatusEl.textContent = 'Terhubung';

            PhoneState.activeCall.startTime = Date.now();
            clearInterval(PhoneState.activeCall.timerInterval);

            PhoneState.activeCall.timerInterval = setInterval(() => {
                const elapsedSec = Math.floor((Date.now() - PhoneState.activeCall.startTime) / 1000);
                const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
                const secs = String(elapsedSec % 60).padStart(2, '0');
                const timerEl = document.getElementById('callTimer');
                if (timerEl) timerEl.textContent = `${mins}:${secs}`;
            }, 1000);
        },

        hangupCall() {
            PhoneAudio.stopRingback();
            PhoneAudio.stopRingtone();
            PhoneAudio.playClick();

            if (PhoneState.activeCall.timerInterval) {
                clearInterval(PhoneState.activeCall.timerInterval);
                PhoneState.activeCall.timerInterval = null;
            }

            // Record to recents
            if (PhoneState.activeCall.targetNumber) {
                PhoneState.recents.unshift({
                    name: PhoneState.activeCall.targetName,
                    number: PhoneState.activeCall.targetNumber,
                    type: 'outgoing',
                    time: 'Baru saja'
                });
                this.renderRecentsList();
            }

            PhoneState.activeCall.isActive = false;
            PhoneState.activeCall.targetNumber = '';

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneHangup');
            }

            // Bersihkan input angka dialer
            const disp = document.getElementById('dialerNumberText');
            if (disp) disp.textContent = '';

            // Kembalikan ke Beranda bersih (tidak stuck di keypad)
            this.goHome();
        },

        // Trigger Incoming Call
        triggerIncomingCall(fromNumber, fromName = null) {
            if (PhoneState.airplaneMode) return;

            PhoneState.incomingCall.isActive = true;
            PhoneState.incomingCall.fromNumber = fromNumber;

            const contact = PhoneState.contacts.find(c => c.number === fromNumber);
            PhoneState.incomingCall.fromName = fromName || (contact ? contact.name : fromNumber);

            const incNameEl = document.getElementById('incomingName');
            const incNumEl = document.getElementById('incomingNumber');
            if (incNameEl) incNameEl.textContent = PhoneState.incomingCall.fromName;
            if (incNumEl) incNumEl.textContent = fromNumber;

            // Pastikan screen tidak terhalang lockscreen saat ada panggilan masuk
            if (this.screen) {
                this.screen.classList.remove('is-locked');
            }
            const lockEl = document.getElementById('viewLockScreen');
            if (lockEl) {
                lockEl.classList.remove('active');
                lockEl.classList.add('unlocked');
            }

            this.switchView('viewIncomingCall', false);
            PhoneAudio.startRingtone();
        },

        acceptCall() {
            PhoneAudio.stopRingtone();
            PhoneState.incomingCall.isActive = false;

            PhoneState.activeCall.isActive = true;
            PhoneState.activeCall.targetNumber = PhoneState.incomingCall.fromNumber;
            PhoneState.activeCall.targetName = PhoneState.incomingCall.fromName;

            const callNameEl = document.getElementById('callName');
            const callNumberEl = document.getElementById('callNumber');
            if (callNameEl) callNameEl.textContent = PhoneState.activeCall.targetName;
            if (callNumberEl) callNumberEl.textContent = PhoneState.activeCall.targetNumber;

            this.switchView('viewActiveCall', false);
            this.onCallConnected();

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneAnswerCall');
            }
        },

        declineCall() {
            PhoneAudio.stopRingtone();
            PhoneState.incomingCall.isActive = false;

            // Record missed call
            if (PhoneState.incomingCall.fromNumber) {
                PhoneState.recents.unshift({
                    name: PhoneState.incomingCall.fromName,
                    number: PhoneState.incomingCall.fromNumber,
                    type: 'missed',
                    time: 'Baru saja'
                });
                this.renderRecentsList();
            }

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneHangup');
            }

            this.goHome();
        },

        // =====================================================================
        // 5. APP LOGIC: MESSAGES
        // =====================================================================
        renderMessagesThreadList() {
            const listEl = document.getElementById('messagesThreadList');
            if (!listEl) return;

            if (PhoneState.messages.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: var(--ios-text-muted); font-size: 12px; margin-top: 40px;">Tidak ada percakapan pesan.</div>';
                return;
            }

            // Group messages by contact number
            const threads = {};
            PhoneState.messages.forEach(msg => {
                const key = msg.number;
                if (!threads[key] || msg.timestamp > threads[key].timestamp) {
                    threads[key] = msg;
                }
            });

            listEl.innerHTML = '';
            Object.values(threads).forEach(thread => {
                const initials = (thread.name || thread.number).substring(0, 2).toUpperCase();
                const item = document.createElement('div');
                item.className = 'thread-item';
                item.innerHTML = `
                    <div class="thread-avatar">${initials}</div>
                    <div class="thread-body">
                        <div class="thread-top">
                            <span class="thread-name">${thread.name || thread.number}</span>
                            <span class="thread-time">${thread.time || '12:00'}</span>
                        </div>
                        <div class="thread-snippet">${thread.isLocation ? '📍 Titik Lokasi GPS' : (thread.text || '')}</div>
                    </div>
                `;
                item.onclick = () => {
                    this.openConversation(thread.number, thread.name);
                };
                listEl.appendChild(item);
            });
        },

        openConversation(number, name) {
            PhoneState.activeChatContact = { number, name: name || number };

            const nameEl = document.getElementById('chatRecipientName');
            const numEl = document.getElementById('chatRecipientNumber');
            if (nameEl) nameEl.textContent = PhoneState.activeChatContact.name;
            if (numEl) numEl.textContent = number;

            this.renderChatMessages();
            this.switchView('viewChatConversation');
        },

        renderChatMessages() {
            const container = document.getElementById('chatMessagesContainer');
            if (!container || !PhoneState.activeChatContact) return;

            const relevant = PhoneState.messages.filter(m => m.number === PhoneState.activeChatContact.number);
            container.innerHTML = '';

            relevant.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${msg.isSent ? 'sent' : 'received'}`;

                if (msg.isLocation) {
                    bubble.classList.add('location-bubble');
                    bubble.innerHTML = `
                        <span style="color: #38bdf8; display: flex; align-items: center;">${PhoneSvg.location}</span>
                        <div>
                            <strong>Titik Lokasi GPS</strong>
                            <div style="font-size: 11px; opacity: 0.85;">Klik untuk menandai di radar</div>
                        </div>
                        <div class="bubble-time">${msg.time || '12:00'}</div>
                    `;
                    bubble.onclick = () => {
                        this.trackLocation(msg.coords || { x: 0, y: 0, z: 0 });
                    };
                } else {
                    bubble.innerHTML = `
                        <div>${msg.text}</div>
                        <div class="bubble-time">${msg.time || '12:00'}</div>
                    `;
                }

                container.appendChild(bubble);
            });

            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        },

        sendChatMessage(text, isLocation = false, coords = null) {
            if (!PhoneState.activeChatContact) return;
            if (!text && !isLocation) return;

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            const newMsg = {
                number: PhoneState.activeChatContact.number,
                name: PhoneState.activeChatContact.name,
                text: text,
                isSent: true,
                isLocation: isLocation,
                coords: coords,
                time: timeStr,
                timestamp: Date.now()
            };

            PhoneState.messages.push(newMsg);
            PhoneAudio.playMessageSent();
            this.renderChatMessages();

            // Emit to server
            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneSendSMS', PhoneState.activeChatContact.number, text, isLocation ? 1 : 0);
            }
        },

        trackLocation(coords) {
            PhoneAudio.playClick();
            this.showNotification('GPS Lokasi', 'Titik koordinat berhasil ditandai di radar peta!');
            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneTrackLocation', coords.x, coords.y, coords.z);
            }
        },

        // =====================================================================
        // 6. APP LOGIC: CONTACTS
        // =====================================================================
        renderContactsList() {
            const container = document.getElementById('contactsListContainer');
            if (!container) return;

            const myCardName = document.getElementById('myCardName');
            const myCardPhone = document.getElementById('myCardPhone');
            const myCardAvatar = document.getElementById('myCardAvatar');

            if (myCardName) myCardName.textContent = PhoneState.ownerName;
            if (myCardPhone) myCardPhone.textContent = PhoneState.phoneNumber;
            if (myCardAvatar) myCardAvatar.textContent = PhoneState.ownerName.substring(0, 2).toUpperCase();

            const query = (document.getElementById('searchContactsInput')?.value || '').toLowerCase();
            const filtered = PhoneState.contacts.filter(c => 
                c.name.toLowerCase().includes(query) || c.number.includes(query)
            );

            if (filtered.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--ios-text-muted); font-size: 12px; margin-top: 30px;">Kontak tidak ditemukan.</div>';
                return;
            }

            container.innerHTML = '';
            filtered.sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                const initials = contact.name.substring(0, 2).toUpperCase();
                const row = document.createElement('div');
                row.className = 'contact-row';
                row.innerHTML = `
                    <div class="contact-left">
                        <div class="contact-avatar">${initials}</div>
                        <div>
                            <div class="contact-name">${contact.name}</div>
                            <div class="contact-num">${contact.number}</div>
                        </div>
                    </div>
                    <div class="contact-actions">
                        <button class="c-act-btn c-act-call" title="Panggil">${PhoneSvg.phone}</button>
                        <button class="c-act-btn c-act-sms" title="Kirim Pesan">${PhoneSvg.comment}</button>
                        <button class="c-act-btn c-act-share" title="Bagikan Kontak ke Pemain Terdekat">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                        </button>
                        <button class="c-act-btn c-act-del" title="Hapus">${PhoneSvg.trash}</button>
                    </div>
                `;

                // Call Action
                row.querySelector('.c-act-call').onclick = (e) => {
                    e.stopPropagation();
                    this.startCall(contact.number);
                };

                // SMS Action
                row.querySelector('.c-act-sms').onclick = (e) => {
                    e.stopPropagation();
                    this.openConversation(contact.number, contact.name);
                };

                // Share Contact Action (Bagi Kontak ke Pemain Terdekat)
                row.querySelector('.c-act-share').onclick = (e) => {
                    e.stopPropagation();
                    this.shareContact(contact.name, contact.number);
                };

                // Delete Action
                row.querySelector('.c-act-del').onclick = (e) => {
                    e.stopPropagation();
                    this.deleteContact(contact.id || contact.number);
                };

                container.appendChild(row);
            });
        },

        addContact(name, number) {
            if (!name || !number) return;
            const newContact = {
                id: Date.now(),
                name: name.trim(),
                number: number.trim()
            };
            PhoneState.contacts.push(newContact);
            PhoneAudio.playClick();
            this.showNotification('Kontak Disimpan', `${name} berhasil ditambahkan ke kontak.`);
            this.renderContactsList();

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneAddContact', newContact.name, newContact.number);
            }
        },

        // Bagikan Kontak ke Pemain Terdekat (Nearby Player Share)
        shareContact(name, number) {
            if (!name || !number) return;
            PhoneAudio.playClick();
            PhoneState.pendingShare = { name, number };

            const nameEl = document.getElementById('shareContactNameDisplay');
            const numEl = document.getElementById('shareContactNumDisplay');
            if (nameEl) nameEl.textContent = name;
            if (numEl) numEl.textContent = number;

            const inputEl = document.getElementById('shareTargetIdInput');
            if (inputEl) inputEl.value = '';

            const listEl = document.getElementById('nearbyPlayersList');
            if (listEl) {
                listEl.innerHTML = '<div style="font-size: 10.5px; color: var(--ios-text-muted); padding: 4px;">Mendeteksi pemain terdekat...</div>';
            }

            document.getElementById('modalShareContact')?.classList.add('active');

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneRequestNearbyPlayers', name, number);
            }
        },

        // Kirim kontak ke Target Player ID yang dipilih
        sendContactToTargetId(targetId) {
            if (!PhoneState.pendingShare || !targetId) return;
            const { name, number } = PhoneState.pendingShare;
            PhoneAudio.playClick();

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneSendContactToTarget', Number(targetId), name, number);
            }
            document.getElementById('modalShareContact')?.classList.remove('active');
            this.showNotification('Membagikan Kontak', `Permintaan dikirim ke ID ${targetId}...`, 'contacts');
        },

        deleteContact(identifier) {
            PhoneState.contacts = PhoneState.contacts.filter(c => (c.id !== identifier && c.number !== identifier));
            PhoneAudio.playClick();
            this.renderContactsList();

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneDeleteContact', identifier);
            }
        },

        // =====================================================================
        // 7. APP LOGIC: BANK
        // =====================================================================
        renderBankView() {
            const balanceEl = document.getElementById('bankBalanceVal');
            const holderEl = document.getElementById('bankCardHolder');
            const cardNumEl = document.getElementById('bankCardNumber');

            if (balanceEl) balanceEl.textContent = `$${PhoneState.bankBalance.toLocaleString('en-US')}`;
            if (holderEl) holderEl.textContent = PhoneState.ownerName.toUpperCase();
            if (cardNumEl) cardNumEl.textContent = PhoneState.bankCardNum;

            this.renderBankHistory();
        },

        renderBankHistory() {
            const listEl = document.getElementById('bankHistoryList');
            if (!listEl) return;

            const mockHistory = [
                { title: 'Gaji Pekerjaan', amount: 850, type: 'plus', date: 'Hari ini' },
                { title: 'Transfer ke Bengkel Joe', amount: 450, type: 'minus', date: 'Kemarin' },
                { title: 'Pembelian di Supermarket 24/7', amount: 120, type: 'minus', date: '2 hari lalu' }
            ];

            listEl.innerHTML = '';
            mockHistory.forEach(item => {
                const row = document.createElement('div');
                row.className = 'trans-item';
                row.innerHTML = `
                    <div>
                        <div style="font-weight: 600;">${item.title}</div>
                        <div style="font-size: 10px; color: var(--ios-text-muted);">${item.date}</div>
                    </div>
                    <div class="trans-amount ${item.type}">
                        ${item.type === 'plus' ? '+' : '-'}$${item.amount}
                    </div>
                `;
                listEl.appendChild(row);
            });
        },

        transferMoney(target, amount, note) {
            amount = parseInt(amount, 10);
            if (isNaN(amount) || amount <= 0) {
                this.showNotification('Bank', 'Nominal transfer tidak valid!');
                return;
            }
            if (amount > PhoneState.bankBalance) {
                this.showNotification('Saldo Kurang', 'Saldo bank Anda tidak mencukupi untuk transfer ini!');
                return;
            }

            PhoneState.bankBalance -= amount;
            this.renderBankView();
            PhoneAudio.playMessageSent();
            this.showNotification('Transfer Berhasil', `Berhasil mengirim $${amount.toLocaleString()} ke ${target}.`);

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneTransferBank', target, amount, note || '');
            }
        },

        // =====================================================================
        // 8. APP LOGIC: CHIRPER / TWITTER
        // =====================================================================
        renderTwitterFeed() {
            const feedEl = document.getElementById('twitterFeedList');
            if (!feedEl) return;

            feedEl.innerHTML = '';
            PhoneState.twitterFeed.forEach(chirp => {
                const card = document.createElement('div');
                card.className = 'chirp-card';
                card.innerHTML = `
                    <div class="chirp-header">
                        <div class="chirp-avatar">${chirp.author.substring(0, 2).toUpperCase()}</div>
                        <div class="chirp-user-meta">
                            <span class="chirp-author">${chirp.author}</span>
                            <span class="chirp-handle">@${chirp.handle || chirp.author.toLowerCase().replace(/\s+/g, '')}</span>
                        </div>
                    </div>
                    <div class="chirp-content">${chirp.content}</div>
                    <div class="chirp-footer">
                        <span>${chirp.time || '10m lalu'}</span>
                        <button class="chirp-like-btn ${chirp.isLiked ? 'liked' : ''}">
                            ${chirp.isLiked ? PhoneSvg.heart : PhoneSvg.heartEmpty}
                            <span>${chirp.likes || 0}</span>
                        </button>
                    </div>
                `;

                card.querySelector('.chirp-like-btn').onclick = (e) => {
                    chirp.isLiked = !chirp.isLiked;
                    chirp.likes = (chirp.likes || 0) + (chirp.isLiked ? 1 : -1);
                    PhoneAudio.playClick();
                    PhoneUI.renderTwitterFeed();

                    if (window.CefBridge && chirp.id) {
                        CefBridge.emit('cef_onPhoneLikeTweet', Number(chirp.id));
                    }
                };

                feedEl.appendChild(card);
            });
        },

        postTweet(content) {
            if (!content || content.trim() === '') return;
            const newChirp = {
                id: Date.now(),
                author: PhoneState.ownerName,
                handle: PhoneState.ownerName.toLowerCase().replace(/\s+/g, ''),
                content: content.trim(),
                time: 'Baru saja',
                likes: 0,
                isLiked: false
            };
            PhoneState.twitterFeed.unshift(newChirp);
            PhoneAudio.playMessageSent();
            this.showNotification('Chirper', 'Kicauan Anda berhasil diposting!');
            this.renderTwitterFeed();

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhonePostTweet', content);
            }
        },

        // =====================================================================
        // 9. APP LOGIC: GARAGE
        // =====================================================================
        renderGarageList() {
            const listEl = document.getElementById('garageVehiclesList');
            if (!listEl) return;

            if (PhoneState.vehicles.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: var(--ios-text-muted); font-size: 12px; margin-top: 40px;">Anda tidak memiliki kendaraan terdaftar.</div>';
                return;
            }

            listEl.innerHTML = '';
            PhoneState.vehicles.forEach(veh => {
                const card = document.createElement('div');
                card.className = 'veh-card';
                card.innerHTML = `
                    <div class="veh-top">
                        <span class="veh-name" style="display:inline-flex; align-items:center; gap:6px;">${PhoneSvg.car} ${veh.modelName}</span>
                        <span class="veh-plate">${veh.plate}</span>
                    </div>
                    <div class="veh-meta-grid">
                        <span>Kondisi Mesin: <strong>${veh.engineHealth || 100}%</strong></span>
                        <span>Status: <strong>${veh.status || 'Tersimpan'}</strong></span>
                    </div>
                    <button class="veh-gps-btn">
                        ${PhoneSvg.crosshairs} <span>Lacak Kendaraan (GPS)</span>
                    </button>
                `;

                card.querySelector('.veh-gps-btn').onclick = () => {
                    PhoneAudio.playClick();
                    PhoneUI.showNotification('GPS Garasi', `Menandai lokasi kendaraan ${veh.modelName} (${veh.plate})`);
                    if (window.CefBridge) {
                        CefBridge.emit('cef_onPhoneTrackVehicle', veh.id || veh.plate);
                    }
                };

                listEl.appendChild(card);
            });
        },

        // =====================================================================
        // 10. APP LOGIC: YELLOW PAGES (IKLAN)
        // =====================================================================
        renderYellowpagesFeed() {
            const feedEl = document.getElementById('yellowpagesFeedList');
            if (!feedEl) return;

            feedEl.innerHTML = '';
            PhoneState.yellowpages.forEach(ad => {
                const card = document.createElement('div');
                card.className = 'ad-card';
                card.innerHTML = `
                    <span class="ad-badge">${ad.category}</span>
                    <div class="ad-desc">${ad.description}</div>
                    <div class="ad-footer">
                        <span>Oleh: <strong>${ad.author}</strong></span>
                        <div class="ad-actions">
                            <button class="ad-btn ad-btn-call" title="Telepon">${PhoneSvg.phone}</button>
                            <button class="ad-btn ad-btn-sms" title="Kirim Pesan">${PhoneSvg.comment}</button>
                        </div>
                    </div>
                `;

                card.querySelector('.ad-btn-call').onclick = () => {
                    this.startCall(ad.phone);
                };
                card.querySelector('.ad-btn-sms').onclick = () => {
                    this.openConversation(ad.phone, ad.author);
                };

                feedEl.appendChild(card);
            });
        },

        postAd(category, description) {
            if (!description || description.trim() === '') return;
            const newAd = {
                id: Date.now(),
                category: category,
                description: description.trim(),
                author: PhoneState.ownerName,
                phone: PhoneState.phoneNumber,
                time: 'Baru saja'
            };
            PhoneState.yellowpages.unshift(newAd);
            PhoneAudio.playMessageSent();
            this.showNotification('Iklan Dipasang', 'Iklan Anda berhasil ditayangkan di Yellow Pages!');
            this.renderYellowpagesFeed();

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhonePostAd', category, description);
            }
        },

        // =====================================================================
        // 11. APP LOGIC: EMERGENCY DISPATCH
        // =====================================================================
        openDispatchModal(serviceType) {
            const titles = {
                'police': 'Panggil Kepolisian (911)',
                'medic': 'Panggil Medis & Ambulans (912)',
                'mechanic': 'Panggil Jasa Derek / Mekanik (913)',
                'taxi': 'Pesan Armada Taxi (914)'
            };

            const titleEl = document.getElementById('dispatchModalTitle');
            if (titleEl) titleEl.textContent = titles[serviceType] || 'Panggilan Darurat';

            this._currentDispatchService = serviceType;
            document.getElementById('modalDispatchReport').classList.add('active');
        },

        sendEmergencyDispatch(serviceType, message) {
            PhoneAudio.playMessageSent();
            this.showNotification('Panggilan Darurat Terkirim', 'Panggilan dan sinyal GPS Anda telah diterima petugas!');

            if (window.CefBridge) {
                CefBridge.emit('cef_onPhoneEmergencyDispatch', serviceType, message);
            }
        },

        // =====================================================================
        // 12. APP LOGIC: CAMERA & PHOTOS
        // =====================================================================
        takeSnapshot() {
            PhoneAudio.playShutter();
            const flash = document.createElement('div');
            flash.style.position = 'absolute';
            flash.style.top = '0';
            flash.style.left = '0';
            flash.style.right = '0';
            flash.style.bottom = '0';
            flash.style.background = '#ffffff';
            flash.style.zIndex = '999';
            flash.style.pointerEvents = 'none';
            flash.style.transition = 'opacity 0.22s ease';
            this.screen.appendChild(flash);

            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => flash.remove(), 220);
            }, 60);

            // Daftar foto roleplay Los Santos berkualitas tinggi
            const samplePhotos = [
                'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80'
            ];
            const randomUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            const newPhoto = {
                id: Date.now(),
                url: randomUrl,
                title: 'Tangkapan Kamera',
                location: 'Los Santos',
                time: timeStr,
                date: 'Hari ini'
            };

            PhoneState.photos.unshift(newPhoto);
            try {
                localStorage.setItem('kkrp_phone_gallery', JSON.stringify(PhoneState.photos.slice(0, 30)));
            } catch (e) {}

            this.showNotification('Foto Disimpan', 'Tangkapan foto disimpan ke Galeri.', 'camera');
            this.renderPhotosGrid();
        },

        renderPhotosGrid() {
            const grid = document.getElementById('photosGridContainer');
            if (!grid) return;

            grid.innerHTML = '';
            if (PhoneState.photos.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--ios-text-muted); font-size: 12px; margin-top: 40px;">Belum ada foto di galeri.<br>Gunakan kamera untuk mengambil foto.</div>';
                return;
            }

            PhoneState.photos.forEach(photo => {
                const thumb = document.createElement('div');
                thumb.className = 'photo-thumb';
                thumb.style.backgroundImage = `url(${photo.url})`;
                thumb.innerHTML = `<span class="photo-thumb-tag">${photo.time || ''}</span>`;
                thumb.onclick = () => {
                    this.openPhotoViewer(photo);
                };
                grid.appendChild(thumb);
            });
        },

        // Penampil Foto Layar Penuh (Photo Viewer Modal)
        openPhotoViewer(photo) {
            PhoneAudio.playClick();
            const modal = document.getElementById('modalPhotoView');
            const imgBox = document.getElementById('photoModalImage');
            const dateEl = document.getElementById('photoModalDate');
            if (!modal || !imgBox) return;

            if (dateEl) dateEl.textContent = `${photo.location || 'Los Santos'} • ${photo.time || photo.date || ''}`;
            imgBox.style.backgroundImage = `url(${photo.url})`;

            // Jadikan Wallpaper
            const setWallBtn = document.getElementById('photoSetWallpaperBtn');
            if (setWallBtn) {
                setWallBtn.onclick = () => {
                    PhoneAudio.playClick();
                    if (this.screen) {
                        this.screen.style.backgroundImage = `url(${photo.url})`;
                        this.screen.style.backgroundSize = 'cover';
                        this.screen.style.backgroundPosition = 'center';
                    }
                    modal.classList.remove('active');
                    this.showNotification('Wallpaper', 'Foto berhasil dipasang sebagai wallpaper.', 'settings');
                    if (window.CefBridge) {
                        CefBridge.emit('cef_onPhoneSetWallpaper', photo.url);
                    }
                };
            }

            // Hapus Foto
            const delBtn = document.getElementById('photoDeleteBtn');
            if (delBtn) {
                delBtn.onclick = () => {
                    PhoneAudio.playClick();
                    PhoneState.photos = PhoneState.photos.filter(p => p.id !== photo.id);
                    try {
                        localStorage.setItem('kkrp_phone_gallery', JSON.stringify(PhoneState.photos));
                    } catch (e) {}
                    this.renderPhotosGrid();
                    modal.classList.remove('active');
                    this.showNotification('Galeri', 'Foto telah dihapus dari galeri.', 'trash');
                };
            }

            modal.classList.add('active');
        },

        // =====================================================================
        // 13. APP LOGIC: CALCULATOR
        // =====================================================================
        handleCalcInput(action) {
            PhoneAudio.playClick();
            const calc = PhoneState.calc;
            const currentEl = document.getElementById('calcCurrent');
            const formulaEl = document.getElementById('calcFormula');

            if (!isNaN(action)) {
                // Digit
                if (calc.current === '0' || calc.waitingForOperand) {
                    calc.current = String(action);
                    calc.waitingForOperand = false;
                } else {
                    calc.current += String(action);
                }
            } else if (action === '.') {
                if (!calc.current.includes('.')) {
                    calc.current += '.';
                }
            } else if (action === 'clear') {
                calc.current = '0';
                calc.formula = '';
                calc.prevValue = null;
                calc.operator = null;
                calc.waitingForOperand = false;
            } else if (action === 'sign') {
                calc.current = String(parseFloat(calc.current) * -1);
            } else if (action === 'percent') {
                calc.current = String(parseFloat(calc.current) / 100);
            } else if (['+', '-', '*', '/'].includes(action)) {
                const inputValue = parseFloat(calc.current);
                if (calc.prevValue == null) {
                    calc.prevValue = inputValue;
                } else if (calc.operator) {
                    const result = this._calcPerform(calc.operator, calc.prevValue, inputValue);
                    calc.current = String(result);
                    calc.prevValue = result;
                }
                calc.waitingForOperand = true;
                calc.operator = action;
                calc.formula = `${calc.prevValue} ${action}`;
            } else if (action === '=') {
                const inputValue = parseFloat(calc.current);
                if (calc.operator && calc.prevValue != null) {
                    const result = this._calcPerform(calc.operator, calc.prevValue, inputValue);
                    calc.formula = `${calc.prevValue} ${calc.operator} ${inputValue} =`;
                    calc.current = String(result);
                    calc.prevValue = null;
                    calc.operator = null;
                    calc.waitingForOperand = true;
                }
            }

            if (currentEl) currentEl.textContent = calc.current;
            if (formulaEl) formulaEl.textContent = calc.formula;
        },

        _calcPerform(op, a, b) {
            switch (op) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/': return b !== 0 ? a / b : '0';
                default: return b;
            }
        },

        // =====================================================================
        // 14. APP LOGIC: NOTES
        // =====================================================================
        renderNotesList() {
            const container = document.getElementById('notesListContainer');
            if (!container) return;

            if (PhoneState.notes.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--ios-text-muted); font-size: 12px; margin-top: 40px;">Belum ada catatan tersimpan.</div>';
                return;
            }

            container.innerHTML = '';
            PhoneState.notes.forEach(note => {
                const row = document.createElement('div');
                row.className = 'recent-row';
                row.innerHTML = `
                    <div class="recent-info">
                        <span class="recent-name">${note.title}</span>
                        <span class="recent-meta">${note.content}</span>
                    </div>
                    <button class="c-act-btn c-act-del" title="Hapus">${PhoneSvg.trash}</button>
                `;
                row.querySelector('.c-act-del').onclick = () => {
                    PhoneState.notes = PhoneState.notes.filter(n => n.id !== note.id);
                    PhoneUI.renderNotesList();
                };
                container.appendChild(row);
            });
        },

        // =====================================================================
        // 15. APP LOGIC: SETTINGS
        // =====================================================================
        renderSettingsView() {
            const nameEl = document.getElementById('settingsProfileName');
            const phoneEl = document.getElementById('settingsProfilePhone');
            const phoneNumEl = document.getElementById('settingsPhoneNum');
            const avatarEl = document.getElementById('settingsAvatar');

            if (nameEl) nameEl.textContent = PhoneState.ownerName;
            if (phoneEl) phoneEl.textContent = PhoneState.phoneNumber;
            if (phoneNumEl) phoneNumEl.textContent = PhoneState.phoneNumber;
            if (avatarEl) avatarEl.textContent = PhoneState.ownerName.substring(0, 2).toUpperCase();

            const airToggle = document.getElementById('toggleAirplaneMode');
            if (airToggle) airToggle.checked = PhoneState.airplaneMode;

            const soundToggle = document.getElementById('toggleSoundMode');
            if (soundToggle) soundToggle.checked = PhoneState.soundMode;
        },

        // Render Recents Call List
        renderRecentsList() {
            const listEl = document.getElementById('recentsList');
            if (!listEl) return;

            if (PhoneState.recents.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: var(--ios-text-muted); font-size: 12px; margin-top: 30px;">Tidak ada riwayat panggilan.</div>';
                return;
            }

            listEl.innerHTML = '';
            PhoneState.recents.forEach(item => {
                const row = document.createElement('div');
                row.className = 'recent-row';
                row.innerHTML = `
                    <div class="recent-info">
                        <span class="recent-name ${item.type === 'missed' ? 'missed' : ''}" style="display:inline-flex; align-items:center; gap:6px;">
                            ${item.type === 'missed' ? PhoneSvg.phoneMissed : PhoneSvg.phone} ${item.name || item.number}
                        </span>
                        <span class="recent-meta">${item.type === 'missed' ? 'Tak Terjawab' : (item.type === 'incoming' ? 'Masuk' : 'Keluar')} • ${item.time}</span>
                    </div>
                    <div class="recent-call-icon">${PhoneSvg.phone}</div>
                `;
                row.onclick = () => {
                    this.startCall(item.number);
                };
                listEl.appendChild(row);
            });
        },

        // =====================================================================
        // 16. BIND USER DOM EVENTS
        // =====================================================================
        bindEvents() {
            // Setup Gestures Tarik / Geser Layar Kunci (Swipe Up to Unlock)
            this.setupLockScreenGestures();

            // Unlock swipe / tap button
            document.getElementById('unlockSwipeBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.unlockPhone(true);
            });

            // Close / Click Bottom Pop-up Notification
            document.getElementById('bottomNotifCloseBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = document.getElementById('bottomNotificationCard');
                if (card) card.classList.remove('show');
            });
            document.getElementById('bottomNotificationCard')?.addEventListener('click', (e) => {
                if (e.target.closest('#bottomNotifCloseBtn')) return;
                const card = document.getElementById('bottomNotificationCard');
                if (card) card.classList.remove('show');
                if (PhoneState.incomingCall.isActive) {
                    this.switchView('viewIncomingCall', false);
                } else if (PhoneState.activeCall.isActive) {
                    this.switchView('viewActiveCall', false);
                } else if (PhoneState.incomingShare) {
                    document.getElementById('modalConfirmShare')?.classList.add('active');
                }
            });

            // Bottom Home Indicator Bar (Click to Go Home / Minimize / Unlock)
            document.getElementById('homeIndicatorWrap')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (PhoneState.isLocked) {
                    this.unlockPhone(true);
                } else if (PhoneState.currentView === 'viewHomeScreen') {
                    // Already at home -> Minimize / Close phone
                    this.hidePhone();
                } else {
                    this.goHome();
                }
            });

            // Physical Power Button -> Lock / Unlock
            document.getElementById('powerBtn')?.addEventListener('click', () => {
                if (PhoneState.isLocked) {
                    this.unlockPhone(true);
                } else {
                    this.lockPhone(true);
                }
            });

            // Physical Volume Buttons
            document.getElementById('volUpBtn')?.addEventListener('click', () => {
                PhoneAudio.playClick();
                this.showNotification('Volume', 'Volume Ditingkatkan (100%)', 'volume');
            });
            document.getElementById('volDownBtn')?.addEventListener('click', () => {
                PhoneAudio.playClick();
                this.showNotification('Volume', 'Volume Diturunkan (50%)', 'volume');
            });

            // Back button on all apps
            document.querySelectorAll('[data-action="go-home"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.goHome();
                });
            });
            document.getElementById('phoneBackBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goHome();
            });

            // App Icons click (Homescreen & Dock)
            document.querySelectorAll('[data-app]').forEach(appEl => {
                appEl.addEventListener('click', () => {
                    const app = appEl.getAttribute('data-app');
                    this.openApp(app);
                });
            });

            // Phone Dialer Keypad
            document.querySelectorAll('.key-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const key = btn.getAttribute('data-key');
                    PhoneAudio.playDTMF(key);
                    const disp = document.getElementById('dialerNumberText');
                    if (disp && disp.textContent.length < 16) {
                        disp.textContent += key;
                    }
                });
            });

            // Dialer Backspace
            const dialerBackBtn = document.getElementById('dialerBackspaceBtn');
            if (dialerBackBtn) {
                dialerBackBtn.addEventListener('click', () => {
                    PhoneAudio.playClick();
                    const disp = document.getElementById('dialerNumberText');
                    if (disp && disp.textContent.length > 0) {
                        disp.textContent = disp.textContent.slice(0, -1);
                    }
                });
                // Double click / Long click to clear all digits
                dialerBackBtn.addEventListener('dblclick', () => {
                    const disp = document.getElementById('dialerNumberText');
                    if (disp) disp.textContent = '';
                });
            }

            // Dialer Call / Hangup Button
            document.getElementById('startCallBtn')?.addEventListener('click', () => {
                if (PhoneState.activeCall.isActive) {
                    // Jika sedang dalam panggilan aktif, tombol ini berfungsi menutup panggilan
                    this.hangupCall();
                } else {
                    const disp = document.getElementById('dialerNumberText');
                    if (disp && disp.textContent && disp.textContent.trim() !== '') {
                        this.startCall(disp.textContent.trim());
                    }
                }
            });

            // Active Call Screen Tool Buttons
            document.getElementById('callKeypadBtn')?.addEventListener('click', () => {
                PhoneAudio.playClick();
                // Beralih ke layar dialer untuk input angka tanpa memutus panggilan
                this.switchView('viewAppPhone', false);
            });

            // Dialer Tabs (Keypad vs Recents)
            document.querySelectorAll('.phone-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    PhoneAudio.playClick();
                    document.querySelectorAll('.phone-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.phone-tab-content').forEach(c => c.classList.remove('active'));

                    tab.classList.add('active');
                    const targetTab = tab.getAttribute('data-tab');
                    if (targetTab === 'keypad') {
                        document.getElementById('tabContentKeypad')?.classList.add('active');
                    } else {
                        document.getElementById('tabContentRecents')?.classList.add('active');
                        this.renderRecentsList();
                    }
                });
            });

            // Call Overlays: Minimize, Hangup, Accept, Decline
            document.getElementById('activeCallBackBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goHome();
            });
            document.getElementById('hangupCallBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hangupCall();
            });
            document.getElementById('acceptCallBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.acceptCall();
            });
            document.getElementById('declineCallBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.declineCall();
            });

            // Chat Input & Send
            const sendBtn = document.getElementById('sendMsgBtn');
            const chatInput = document.getElementById('chatTextInput');
            if (sendBtn && chatInput) {
                const send = () => {
                    const val = chatInput.value.trim();
                    if (val) {
                        this.sendChatMessage(val);
                        chatInput.value = '';
                    }
                };
                sendBtn.addEventListener('click', send);
                chatInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') send();
                });
            }

            // Share Location in Chat
            document.getElementById('shareLocationBtn')?.addEventListener('click', () => {
                this.sendChatMessage('', true, { x: 1481.2, y: -1750.4, z: 15.3 });
            });

            // Back to Threads list from Chat
            document.getElementById('backToThreadsBtn')?.addEventListener('click', () => {
                this.renderMessagesThreadList();
                this.switchView('viewAppMessages', false);
            });

            // Shortcut call from inside chat conversation
            document.getElementById('chatCallShortcutBtn')?.addEventListener('click', () => {
                if (PhoneState.activeChatContact) {
                    this.startCall(PhoneState.activeChatContact.number);
                }
            });

            // Search Contacts
            document.getElementById('searchContactsInput')?.addEventListener('input', () => {
                this.renderContactsList();
            });

            // Bagikan Nomor Saya ke Pemain Terdekat (Nearby Only)
            document.getElementById('myCardShareBtn')?.addEventListener('click', () => {
                this.shareContact(PhoneState.ownerName, PhoneState.phoneNumber);
            });

            // Target Player: Terima Kontak (Yes)
            document.getElementById('btnAcceptContactShare')?.addEventListener('click', () => {
                if (PhoneState.incomingShare) {
                    const { fromPlayerId, contactName, contactNumber } = PhoneState.incomingShare;
                    PhoneAudio.playClick();

                    // Langsung simpan ke daftar kontak lokal agar kontak 100% langsung muncul tanpa delay
                    const alreadyExists = PhoneState.contacts.some(c => c.number === contactNumber);
                    if (!alreadyExists) {
                        PhoneState.contacts.push({ id: Date.now(), name: contactName, number: contactNumber });
                        PhoneUI.renderContactsList();
                    }

                    if (window.CefBridge) {
                        CefBridge.emit('cef_onPhoneAcceptContactShare', Number(fromPlayerId), contactName, contactNumber);
                    }
                    document.getElementById('modalConfirmShare')?.classList.remove('active');
                    PhoneUI.showNotification('Kontak Disimpan', `${contactName} (${contactNumber}) berhasil disimpan ke buku telepon.`, 'contacts');
                    PhoneState.incomingShare = null;
                }
            });

            // Target Player: Tolak Kontak (No)
            document.getElementById('btnDeclineContactShare')?.addEventListener('click', () => {
                if (PhoneState.incomingShare) {
                    const { fromPlayerId, contactName } = PhoneState.incomingShare;
                    PhoneAudio.playClick();
                    if (window.CefBridge) {
                        CefBridge.emit('cef_onPhoneDeclineContactShare', Number(fromPlayerId), contactName);
                    }
                    document.getElementById('modalConfirmShare')?.classList.remove('active');
                    PhoneState.incomingShare = null;
                }
            });

            // Modal: Add Contact
            document.getElementById('addContactModalBtn')?.addEventListener('click', () => {
                document.getElementById('modalAddContact')?.classList.add('active');
            });
            document.getElementById('saveContactSubmitBtn')?.addEventListener('click', () => {
                const name = document.getElementById('newContactNameInput')?.value;
                const phone = document.getElementById('newContactPhoneInput')?.value;
                if (name && phone) {
                    this.addContact(name, phone);
                    document.getElementById('modalAddContact')?.classList.remove('active');
                    document.getElementById('newContactNameInput').value = '';
                    document.getElementById('newContactPhoneInput').value = '';
                }
            });

            // Modal: Bank Transfer
            document.getElementById('btnOpenTransferModal')?.addEventListener('click', () => {
                document.getElementById('modalBankTransfer')?.classList.add('active');
            });
            document.getElementById('submitBankTransferBtn')?.addEventListener('click', () => {
                const target = document.getElementById('transferTargetInput')?.value;
                const amount = document.getElementById('transferAmountInput')?.value;
                const note = document.getElementById('transferNoteInput')?.value;
                if (target && amount) {
                    this.transferMoney(target, amount, note);
                    document.getElementById('modalBankTransfer')?.classList.remove('active');
                    document.getElementById('transferTargetInput').value = '';
                    document.getElementById('transferAmountInput').value = '';
                    document.getElementById('transferNoteInput').value = '';
                }
            });

            // Modal: New Tweet
            document.getElementById('newTweetBtn')?.addEventListener('click', () => {
                document.getElementById('modalNewTweet')?.classList.add('active');
            });
            document.getElementById('submitTweetBtn')?.addEventListener('click', () => {
                const content = document.getElementById('newTweetContentInput')?.value;
                if (content) {
                    this.postTweet(content);
                    document.getElementById('modalNewTweet')?.classList.remove('active');
                    document.getElementById('newTweetContentInput').value = '';
                }
            });

            // Modal: Post Ad
            document.getElementById('postAdBtn')?.addEventListener('click', () => {
                document.getElementById('modalPostAd')?.classList.add('active');
            });
            document.getElementById('submitAdBtn')?.addEventListener('click', () => {
                const cat = document.getElementById('adCategorySelect')?.value;
                const desc = document.getElementById('adDescriptionInput')?.value;
                if (desc) {
                    this.postAd(cat, desc);
                    document.getElementById('modalPostAd')?.classList.remove('active');
                    document.getElementById('adDescriptionInput').value = '';
                }
            });

            // Dispatch Cards Click
            document.querySelectorAll('.dispatch-card').forEach(card => {
                card.querySelector('.dispatch-call-btn')?.addEventListener('click', () => {
                    const service = card.getAttribute('data-service');
                    this.openDispatchModal(service);
                });
            });

            document.getElementById('submitDispatchReportBtn')?.addEventListener('click', () => {
                const msg = document.getElementById('dispatchMessageInput')?.value;
                this.sendEmergencyDispatch(this._currentDispatchService || 'police', msg || 'Bantuan dibutuhkan segera!');
                document.getElementById('modalDispatchReport')?.classList.remove('active');
                document.getElementById('dispatchMessageInput').value = '';
            });

            // Camera Shutter
            document.getElementById('camShutterBtn')?.addEventListener('click', () => {
                this.takeSnapshot();
            });
            document.getElementById('camCloseBtn')?.addEventListener('click', () => {
                this.goHome();
            });
            document.getElementById('camGalleryBtn')?.addEventListener('click', () => {
                this.openApp('photos');
            });

            // Calculator Keys
            document.querySelectorAll('[data-calc]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-calc');
                    this.handleCalcInput(action);
                });
            });

            // Wallpaper Selector in Settings
            document.querySelectorAll('.wall-preset').forEach(preset => {
                preset.addEventListener('click', () => {
                    const wall = preset.getAttribute('data-wall');
                    this.setWallpaper(wall);
                });
            });

            // Airplane Mode Switch
            document.getElementById('toggleAirplaneMode')?.addEventListener('change', (e) => {
                PhoneState.airplaneMode = e.target.checked;
                PhoneAudio.playClick();
                this.showNotification('Mode Pesawat', PhoneState.airplaneMode ? 'Mode pesawat diaktifkan' : 'Mode pesawat dinonaktifkan', 'plane');
            });

            // Sound Toggle
            document.getElementById('toggleSoundMode')?.addEventListener('change', (e) => {
                PhoneState.soundMode = e.target.checked;
                PhoneAudio.soundEnabled = PhoneState.soundMode;
            });

            // Close Modals
            document.querySelectorAll('[data-close]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.getAttribute('data-close');
                    document.getElementById(targetId)?.classList.remove('active');
                });
            });

            // ESC Key Handler
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (!PhoneState.isOpen) return;

                    // Close any active modal first
                    const activeModal = document.querySelector('.modal-backdrop.active');
                    if (activeModal) {
                        activeModal.classList.remove('active');
                        return;
                    }

                    if (PhoneState.currentView !== 'viewHomeScreen' && PhoneState.currentView !== 'viewLockScreen') {
                        this.goHome();
                    } else {
                        this.hidePhone();
                    }
                }
            });
        },

        // Setup Gestures: Tarik / Geser ke atas untuk membuka Lock Screen
        setupLockScreenGestures() {
            const lockEl = document.getElementById('viewLockScreen');
            if (!lockEl) return;

            let startY = 0;
            let currentY = 0;
            let isDragging = false;
            let startTime = 0;

            const onPointerDown = (e) => {
                if (!PhoneState.isLocked) return;
                // Jangan drag jika menekan tombol senter / kamera
                if (e.target.closest('#lockFlashlightBtn') || e.target.closest('#lockCameraBtn')) {
                    return;
                }
                isDragging = true;
                startY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
                currentY = startY;
                startTime = Date.now();
                lockEl.classList.add('dragging');
            };

            const onPointerMove = (e) => {
                if (!isDragging || !PhoneState.isLocked) return;
                const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
                const deltaY = clientY - startY;

                // Hanya izinkan tarik ke atas (deltaY negatif)
                if (deltaY < 0) {
                    lockEl.style.transform = `translateY(${deltaY}px)`;
                    const progress = Math.min(Math.abs(deltaY) / 320, 1);
                    lockEl.style.opacity = `${1 - progress * 0.75}`;
                } else {
                    // Resistensi pegas jika ditarik ke bawah
                    lockEl.style.transform = `translateY(${deltaY * 0.15}px)`;
                    lockEl.style.opacity = '1';
                }
            };

            const onPointerUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                lockEl.classList.remove('dragging');

                const clientY = e.clientY || (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : currentY);
                const deltaY = clientY - startY;
                const duration = Date.now() - startTime;
                const velocity = Math.abs(deltaY) / Math.max(duration, 1);

                // Jika ditarik ke atas lebih dari 50px atau diflick cepat
                if (deltaY < -50 || (velocity > 0.35 && deltaY < -20)) {
                    this.unlockPhone(true);
                } else {
                    // Kembali ke posisi lockscreen semula
                    lockEl.style.transform = '';
                    lockEl.style.opacity = '';
                }
            };

            // Event Pointer Desktop & Sentuhan Touch Mobile
            lockEl.addEventListener('mousedown', onPointerDown);
            window.addEventListener('mousemove', onPointerMove);
            window.addEventListener('mouseup', onPointerUp);

            lockEl.addEventListener('touchstart', onPointerDown, { passive: true });
            window.addEventListener('touchmove', onPointerMove, { passive: true });
            window.addEventListener('touchend', onPointerUp);
            window.addEventListener('touchcancel', onPointerUp);

            // Senter (Flashlight) Toggle Button
            const flashBtn = document.getElementById('lockFlashlightBtn');
            if (flashBtn) {
                flashBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    flashBtn.classList.toggle('active');
                    PhoneAudio.playClick();
                    const isOn = flashBtn.classList.contains('active');
                    this.showNotification('Senter', isOn ? 'Senter Dinyalakan' : 'Senter Dimatikan', 'flashlight');
                });
            }

            // Kamera Shortcut Button
            const cameraBtn = document.getElementById('lockCameraBtn');
            if (cameraBtn) {
                cameraBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.unlockPhone(false);
                    this.openApp('camera');
                });
            }

            // Lock Header tap untuk membuka
            const lockHeader = document.getElementById('lockHeaderBtn');
            if (lockHeader) {
                lockHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.unlockPhone(true);
                });
            }
        },

        // =====================================================================
        // 17. INITIAL MOCK DATA (For Standalone Browser Preview & Fallback)
        // =====================================================================
        loadInitialMockData() {
            PhoneState.contacts = [
                { id: 1, name: 'Franklin Clinton', number: '5550192' },
                { id: 2, name: 'Michael De Santa', number: '5550100' },
                { id: 3, name: 'Trevor Philips', number: '5550144' },
                { id: 4, name: 'Lamar Davis', number: '5550177' },
                { id: 5, name: 'Montir Benny', number: '5550233' }
            ];

            PhoneState.messages = [
                { number: '5550192', name: 'Franklin Clinton', text: 'Bro, lu ada di mana sekarang? Kumpul di flat.', isSent: false, time: '11:45', timestamp: Date.now() - 3600000 },
                { number: '5550192', name: 'Franklin Clinton', text: 'Otw bentar lagi, lagi isi bensin di Vinewood.', isSent: true, time: '11:48', timestamp: Date.now() - 3000000 },
                { number: '5550100', name: 'Michael De Santa', text: 'Jangan lupa meeting bisnis nanti malam.', isSent: false, time: '09:12', timestamp: Date.now() - 12000000 }
            ];

            PhoneState.vehicles = [
                { id: 1, modelName: 'Sultan Classic', plate: 'KK 1337 RP', engineHealth: 100, status: 'Garasi Central' },
                { id: 2, modelName: 'Sanchez Enduro', plate: 'KK 2024 LS', engineHealth: 94, status: 'Luar (Terparkir)' }
            ];

            PhoneState.twitterFeed = [
                { id: 1, author: 'Franklin Clinton', handle: 'franklin_c', content: 'Hari yang cerah di Los Santos! Siap untuk misi baru 🚗💨 #KKRP', time: '15m lalu', likes: 12, isLiked: false },
                { id: 2, author: 'Weazel News', handle: 'weazel_news', content: 'Info Lalu Lintas: Ruas jalan Commerce terpantau lancar terkendali.', time: '1j lalu', likes: 45, isLiked: true }
            ];

            PhoneState.yellowpages = [
                { id: 1, category: 'Kendaraan', description: 'Jual Elegy Full Modif Custom, mesin sehat siap gas! Hubungi nomor di bawah.', author: 'Alex Murphy', phone: '5550881' },
                { id: 2, category: 'Properti', description: 'Disewakan Flat bergaya minimalis di Rodeo, garasi aman 24 jam.', author: 'Sarah Jenkins', phone: '5550422' }
            ];

            PhoneState.photos = [
                { id: 1, url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80', date: 'Kemarin' },
                { id: 2, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80', date: '2 hari lalu' }
            ];

            PhoneState.notes = [
                { id: 1, title: 'Frekuensi Radio Faksi', content: 'Radio Utama: 105.4 | Cadangan: 108.2' },
                { id: 2, title: 'Daftar Belanja', content: 'Perban, Repair Kit, Kunci Cadangan' }
            ];
        }
    };

    // =========================================================================
    // 18. CEF BRIDGE EVENT LISTENERS (Communicating with Pawn open.mp Server)
    // =========================================================================
    if (window.CefBridge) {
        
        // Open Phone Event from Pawn
        CefBridge.on('openPhone', (unlocked) => {
            PhoneUI.showPhone(Boolean(unlocked));
        });

        // Close Phone Event from Pawn
        CefBridge.on('closePhone', () => {
            PhoneUI.hidePhone();
        });

        // Set Full Phone Data from Pawn
        CefBridge.on('setPhoneData', (jsonData) => {
            try {
                const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                if (data.ownerName) PhoneState.ownerName = data.ownerName;
                if (data.phoneNumber) PhoneState.phoneNumber = data.phoneNumber;
                if (data.bankBalance !== undefined) PhoneState.bankBalance = data.bankBalance;
                if (data.bankCardNum) PhoneState.bankCardNum = data.bankCardNum;
                if (data.wallpaper) PhoneUI.setWallpaper(data.wallpaper);

                if (Array.isArray(data.contacts)) PhoneState.contacts = data.contacts;
                if (Array.isArray(data.messages)) PhoneState.messages = data.messages;
                if (Array.isArray(data.vehicles)) PhoneState.vehicles = data.vehicles;
                if (Array.isArray(data.twitterFeed)) PhoneState.twitterFeed = data.twitterFeed;
                if (Array.isArray(data.yellowpages)) PhoneState.yellowpages = data.yellowpages;

                // Re-render current open view
                if (PhoneState.currentView === 'viewAppContacts') PhoneUI.renderContactsList();
                if (PhoneState.currentView === 'viewAppBank') PhoneUI.renderBankView();
                if (PhoneState.currentView === 'viewAppMessages') PhoneUI.renderMessagesThreadList();
                if (PhoneState.currentView === 'viewAppGarage') PhoneUI.renderGarageList();
                if (PhoneState.currentView === 'viewAppTwitter') PhoneUI.renderTwitterFeed();
                if (PhoneState.currentView === 'viewAppYellowpages') PhoneUI.renderYellowpagesFeed();
            } catch (e) {
                console.error('[CEF Phone] Gagal parse data dari Pawn:', e);
            }
        });

        // Incoming Call Event from Pawn
        CefBridge.on('incomingCall', (fromNumber, fromName) => {
            PhoneUI.showPhone(true);
            PhoneUI.triggerIncomingCall(fromNumber, fromName);
        });

        // Outgoing Call Answered
        CefBridge.on('callConnected', () => {
            PhoneUI.onCallConnected();
        });

        // Call Ended / Hung Up by Remote Player
        CefBridge.on('callEnded', () => {
            PhoneUI.hangupCall();
        });

        // Receive SMS Event from Pawn
        CefBridge.on('receiveSMS', (fromNumber, fromName, text, isLocation) => {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            PhoneState.messages.push({
                number: fromNumber,
                name: fromName || fromNumber,
                text: text,
                isSent: false,
                isLocation: Boolean(isLocation),
                time: timeStr,
                timestamp: Date.now()
            });

            PhoneUI.showNotification(
                `Pesan dari ${fromName || fromNumber}`,
                isLocation ? '📍 Mengirimkan titik lokasi' : text,
                'comment',
                'messages'
            );

            // If chat conversation is currently open with this contact, refresh messages
            if (PhoneState.currentView === 'viewChatConversation' && PhoneState.activeChatContact?.number === fromNumber) {
                PhoneUI.renderChatMessages();
            } else if (PhoneState.currentView === 'viewAppMessages') {
                PhoneUI.renderMessagesThreadList();
            }
        });

        // Add Contact Event dari Pemain Terdekat (Share Contact)
        CefBridge.on('addContact', (name, number) => {
            PhoneState.contacts.push({ id: Date.now(), name, number });
            PhoneUI.renderContactsList();
            PhoneUI.showNotification('Kontak Baru', `${name} (${number}) telah disimpan ke kontak.`, 'contacts');
        });

        // Tampilkan Daftar Pemain Terdekat untuk Share Contact
        CefBridge.on('showNearbyShareList', (name, number, playersJson) => {
            const listEl = document.getElementById('nearbyPlayersList');
            if (!listEl) return;

            let players = [];
            try {
                players = typeof playersJson === 'string' ? JSON.parse(playersJson) : playersJson;
            } catch (e) {
                players = [];
            }

            if (!Array.isArray(players) || players.length === 0) {
                listEl.innerHTML = '<div style="font-size: 10.5px; color: var(--ios-text-muted); padding: 4px;">Tidak ada pemain lain di sekitar Anda (radius 5m).</div>';
                return;
            }

            listEl.innerHTML = '';
            players.forEach(p => {
                const item = document.createElement('div');
                item.className = 'nearby-player-item';
                item.innerHTML = `
                    <span><strong class="nearby-player-id">[ID: ${p.id}]</strong> ${p.name}</span>
                    <span class="nearby-player-dist">${p.dist || '1.0'}m</span>
                `;
                item.onclick = () => {
                    PhoneUI.sendContactToTargetId(p.id);
                };
                listEl.appendChild(item);
            });
        });

        // Event Permintaan Kontak Masuk (Target Screen: Yes / No)
        CefBridge.on('incomingContactShare', (fromPlayerId, fromName, contactName, contactNumber) => {
            PhoneState.incomingShare = { fromPlayerId, fromName, contactName, contactNumber };
            PhoneAudio.playNotification();

            const senderEl = document.getElementById('confirmSenderInfo');
            const nameEl = document.getElementById('confirmContactName');
            const numEl = document.getElementById('confirmContactNumber');

            if (senderEl) senderEl.innerHTML = `<strong>${fromName} (ID: ${fromPlayerId})</strong> ingin membagikan kontak:`;
            if (nameEl) nameEl.textContent = contactName;
            if (numEl) numEl.textContent = contactNumber;

            // Buka HP dalam mode aktif dan tampilkan alert konfirmasi
            PhoneUI.showPhone(true);
            if (PhoneUI.screen) {
                PhoneUI.screen.classList.remove('is-locked');
            }
            const modalEl = document.getElementById('modalConfirmShare');
            if (modalEl) {
                modalEl.classList.add('active');
            }
        });

        // Update Bank Balance from Pawn
        CefBridge.on('updateBankBalance', (newBalance) => {
            PhoneState.bankBalance = newBalance;
            PhoneUI.renderBankView();
        });

        // New Tweet Broadcast
        CefBridge.on('newTweet', (author, content, time) => {
            PhoneState.twitterFeed.unshift({
                id: Date.now(),
                author: author,
                content: content,
                time: time || 'Baru saja',
                likes: 0,
                isLiked: false
            });
            PhoneUI.showNotification(`Kicauan Baru (@${author})`, content, 'xTwitter', 'twitter');
            if (PhoneState.currentView === 'viewAppTwitter') {
                PhoneUI.renderTwitterFeed();
            }
        });

        // New Yellow Pages Ad Broadcast
        CefBridge.on('newAd', (category, desc, author, phone) => {
            PhoneState.yellowpages.unshift({
                id: Date.now(),
                category: category,
                description: desc,
                author: author,
                phone: phone,
                time: 'Baru saja'
            });
            PhoneUI.showNotification(`[IKLAN] ${category}`, desc, 'bullhorn', 'yellowpages');
            if (PhoneState.currentView === 'viewAppYellowpages') {
                PhoneUI.renderYellowpagesFeed();
            }
        });

        // Bottom Pop-up Notification from Pawn / mp.trigger
        CefBridge.on('client:showNotification', (title, msg, icon) => {
            PhoneUI.showBottomNotification(title, msg, icon || 'bell');
        });
        CefBridge.on('showBottomNotification', (title, msg, icon) => {
            PhoneUI.showBottomNotification(title, msg, icon || 'bell');
        });

        // Load Call Logs from Pawn (MySQL phone_calls)
        CefBridge.on('loadCallLogs', (jsonLogs) => {
            try {
                const logs = typeof jsonLogs === 'string' ? JSON.parse(jsonLogs) : jsonLogs;
                if (Array.isArray(logs)) {
                    PhoneState.recents = logs;
                    if (PhoneState.currentView === 'viewAppPhone') {
                        PhoneUI.renderRecentsList();
                    }
                }
            } catch (e) {
                console.error('[CEF Phone] Gagal parse call logs:', e);
            }
        });

        // Load Messages from Pawn (MySQL phone_messages)
        CefBridge.on('loadMessages', (jsonMsgs) => {
            try {
                const msgs = typeof jsonMsgs === 'string' ? JSON.parse(jsonMsgs) : jsonMsgs;
                if (Array.isArray(msgs)) {
                    PhoneState.messages = msgs;
                    if (PhoneState.currentView === 'viewAppMessages') {
                        PhoneUI.renderMessagesThreadList();
                    } else if (PhoneState.currentView === 'viewChatConversation') {
                        PhoneUI.renderChatMessages();
                    }
                }
            } catch (e) {
                console.error('[CEF Phone] Gagal parse messages:', e);
            }
        });

        // Load Chirper Tweets from Pawn (MySQL chirper_tweets)
        CefBridge.on('loadTweets', (jsonTweets) => {
            try {
                const tweets = typeof jsonTweets === 'string' ? JSON.parse(jsonTweets) : jsonTweets;
                if (Array.isArray(tweets)) {
                    PhoneState.twitterFeed = tweets;
                    if (PhoneState.currentView === 'viewAppTwitter') {
                        PhoneUI.renderTwitterFeed();
                    }
                }
            } catch (e) {
                console.error('[CEF Phone] Gagal parse tweets:', e);
            }
        });

        // Update Likes on Chirper
        CefBridge.on('updateTweetLikes', (tweetId, likes) => {
            const tweet = PhoneState.twitterFeed.find(t => Number(t.id) === Number(tweetId));
            if (tweet) {
                tweet.likes = Number(likes);
                if (PhoneState.currentView === 'viewAppTwitter') {
                    PhoneUI.renderTwitterFeed();
                }
            }
        });
    }

    // =========================================================================
    // 19. STARTUP & GLOBAL EXPORT
    // =========================================================================
    // Adapter mp.trigger & mp.events untuk kompatibilitas framework OMP/RAGE
    if (!window.mp) {
        window.mp = {
            trigger: function(eventName, ...args) {
                if (eventName === 'client:showNotification') {
                    PhoneUI.showBottomNotification(args[0], args[1], args[2] || 'bell');
                } else if (window.CefBridge) {
                    CefBridge.emit(eventName, ...args);
                }
            },
            events: {
                add: function(name, fn) {
                    if (window.CefBridge) CefBridge.on(name, fn);
                }
            }
        };
    }

    window.addEventListener('DOMContentLoaded', () => {
        PhoneUI.init();
    });

    window.PhoneUI = PhoneUI;
    window.PhoneState = PhoneState;

})();
