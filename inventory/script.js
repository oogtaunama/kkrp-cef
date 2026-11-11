/**
 * KOTA KECILKU ROLEPLAY - CEF INVENTORY CONTROLLER
 * FiveM / NoPixel Inspired Grid Inventory with Secondary Container (Drop/Trunk/Shop)
 * Color Theme: Vibrant Orange & Cyber Glassmorphism
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. SOUND EFFECTS (Web Audio API Synthesizer - Zero External Assets)
    // =========================================================================
    const SoundFx = {
        ctx: null,
        init() {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            } catch (e) {
                console.warn('[Audio] Web Audio API tidak didukung:', e);
            }
        },
        play(type) {
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            switch (type) {
                case 'hover':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(420, now);
                    osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);
                    gain.gain.setValueAtTime(0.03, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                case 'click':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
                    gain.gain.setValueAtTime(0.07, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                    osc.start(now);
                    osc.stop(now + 0.06);
                    break;
                case 'move':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(260, now);
                    osc.frequency.linearRampToValueAtTime(480, now + 0.08);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;
                case 'use':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(750, now + 0.14);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                    osc.start(now);
                    osc.stop(now + 0.14);
                    break;
                case 'error':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.setValueAtTime(140, now + 0.08);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
            }
        }
    };

    // =========================================================================
    // 2. ICON REGISTRY (Crisp Inline SVGs for KKRP Roleplay Items)
    // =========================================================================
    const ItemIcons = {
        // Makanan (Food)
        food_fries: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffaa00" stroke-width="1.8"><path d="M5 11l2 11h10l2-11H5z"/><line x1="8" y1="11" x2="8" y2="4"/><line x1="12" y1="11" x2="12" y2="2"/><line x1="16" y1="11" x2="16" y2="5"/><line x1="10" y1="11" x2="9" y2="3"/><line x1="14" y1="11" x2="15" y2="3"/></svg>`,
        food_burger: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffaa00" stroke-width="1.8"><path d="M4 11a8 8 0 0 1 16 0H4z"/><rect x="3" y="14" width="18" height="3" rx="1.5"/><path d="M4 18h16a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3z"/><line x1="3" y1="11" x2="21" y2="11"/></svg>`,
        food_meal: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff9100" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,

        // Minuman (Drink)
        drink_water: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
        drink_soda: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="1.8"><rect x="6" y="5" width="12" height="16" rx="3"/><path d="M9 2h6v3H9z"/><line x1="6" y1="11" x2="18" y2="11"/></svg>`,
        drink_coffee: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,

        // Peralatan Elektronik (Gadgets)
        gadget_phone: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5"/><line x1="10" y1="5" x2="14" y2="5"/></svg>`,
        gadget_radio: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.8"><rect x="4" y="6" width="16" height="15" rx="2"/><circle cx="9" cy="13" r="3"/><line x1="15" y1="11" x2="17" y2="11"/><line x1="15" y1="15" x2="17" y2="15"/><line x1="7" y1="2" x2="7" y2="6"/></svg>`,

        // Medis (Medical)
        med_kit: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8"><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/></svg>`,
        med_bandage: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8"><rect x="2" y="7" width="20" height="10" rx="2" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="1.5"/></svg>`,
        med_pills: `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.8"><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>`,

        // Senjata & Peluru (Weapons & Ammo)
        weap_ammo: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8"><rect x="4" y="9" width="4" height="11" rx="1"/><path d="M4 9l2-5 2 5z"/><rect x="10" y="9" width="4" height="11" rx="1"/><path d="M10 9l2-5 2 5z"/><rect x="16" y="9" width="4" height="11" rx="1"/><path d="M16 9l2-5 2 5z"/></svg>`,
        weap_gun: `<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.8"><path d="M3 8h12l5 4v3h-4l-2 5h-4l1-5H3z"/></svg>`,

        // Tools & Kerajinan (Tools & Materials)
        tool_wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
        tool_hoe: `<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="1.8"><path d="M3 4l18 18"/><path d="M14 3h7v5l-4-2z"/></svg>`,
        tool_box: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff7b00" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,

        // Bahan Alam & Tambang (Ores & Wood)
        res_wood: `<svg viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="1.8"><circle cx="6" cy="12" r="3"/><path d="M6 9h12a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H6"/></svg>`,
        res_ore: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8"><polygon points="12 2 2 9 12 22 22 9 12 2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
        res_gold: `<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="1.8"><polygon points="6 3 18 3 22 9 12 21 2 9 6 3"/><polyline points="2 9 12 13 22 9"/></svg>`,
        res_diamond: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="1.8"><polygon points="6 2 18 2 22 8 12 22 2 8 6 2"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="12" y1="2" x2="6" y2="8"/><line x1="12" y1="2" x2="18" y2="8"/><line x1="12" y1="22" x2="6" y2="8"/><line x1="12" y1="22" x2="18" y2="8"/></svg>`,

        // Ilegal / Drugs
        illegal_leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
        illegal_chem: `<svg viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="1.8"><path d="M10 2v7.31L4.67 19.53A2 2 0 0 0 6.4 22h11.2a2 2 0 0 0 1.73-2.47L14 9.31V2"/></svg>`,

        // Default & Key
        item_key: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffaa00" stroke-width="1.8"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 3-9.5 9.5"/><path d="m15.5 7.5 3 3M18 5l3 3"/></svg>`,
        item_card: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
        item_default: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff7b00" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>`
    };

    /**
     * Cari icon berdasarkan nama item
     */
    function getItemIcon(itemName) {
        if (!itemName) return ItemIcons.item_default;
        const name = itemName.toLowerCase();

        // Makanan
        if (name.includes('fries') || name.includes('kentang')) return ItemIcons.food_fries;
        if (name.includes('burger')) return ItemIcons.food_burger;
        if (name.includes('nasi') || name.includes('ayam') || name.includes('donut') || name.includes('snack') || name.includes('cereal') || name.includes('bbq') || name.includes('daging')) return ItemIcons.food_meal;

        // Minuman
        if (name.includes('air') || name.includes('mineral')) return ItemIcons.drink_water;
        if (name.includes('cola') || name.includes('sprunk') || name.includes('soda')) return ItemIcons.drink_soda;
        if (name.includes('coffee') || name.includes('kopi') || name.includes('milkshake') || name.includes('sirup') || name.includes('tuak') || name.includes('jus')) return ItemIcons.drink_coffee;

        // Gadget
        if (name.includes('phone') || name.includes('smartphone') || name.includes('hp')) return ItemIcons.gadget_phone;
        if (name.includes('radio') || name.includes('walkie')) return ItemIcons.gadget_radio;
        if (name.includes('tablet')) return ItemIcons.item_card;

        // Medis
        if (name.includes('medkit')) return ItemIcons.med_kit;
        if (name.includes('perban') || name.includes('bandage')) return ItemIcons.med_bandage;
        if (name.includes('pil') || name.includes('vitamin') || name.includes('obat')) return ItemIcons.med_pills;

        // Senjata & Peluru
        if (name.includes('ammo') || name.includes('peluru') || name.includes('clip')) return ItemIcons.weap_ammo;
        if (name.includes('gun') || name.includes('shotgun') || name.includes('pistol') || name.includes('rifle') || name.includes('weapon')) return ItemIcons.weap_gun;

        // Tools
        if (name.includes('toolkit') || name.includes('kunci') || name.includes('obeng') || name.includes('linggis')) return ItemIcons.tool_wrench;
        if (name.includes('cangkul') || name.includes('pancingan')) return ItemIcons.tool_hoe;
        if (name.includes('komponen') || name.includes('part') || name.includes('jerigen')) return ItemIcons.tool_box;

        // Ores & Materials
        if (name.includes('kayu') || name.includes('papan')) return ItemIcons.res_wood;
        if (name.includes('batu') || name.includes('baja') || name.includes('alumunium') || name.includes('besi') || name.includes('tembaga')) return ItemIcons.res_ore;
        if (name.includes('emas')) return ItemIcons.res_gold;
        if (name.includes('berlian')) return ItemIcons.res_diamond;

        // Drugs
        if (name.includes('ganja') || name.includes('marijuana') || name.includes('bibit') || name.includes('daun') || name.includes('tani')) return ItemIcons.illegal_leaf;
        if (name.includes('sabu') || name.includes('cocaine') || name.includes('heroin') || name.includes('sinte') || name.includes('stimulan')) return ItemIcons.illegal_chem;

        // Kartu & Kunci
        if (name.includes('key')) return ItemIcons.item_key;
        if (name.includes('card') || name.includes('booster')) return ItemIcons.item_card;

        return ItemIcons.item_default;
    }

    /**
     * Cari path gambar PNG untuk item (FiveM Style)
     * Folder: img/items/<nama_item>.png
     */
    function getItemImage(itemName) {
        if (!itemName) return 'img/items/default.png';
        const clean = itemName.toLowerCase().trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        // Pemetaan variasi nama item khusus roleplay
        const customMap = {
            'kentang': 'french_fries',
            'french_fries': 'french_fries',
            'fries': 'french_fries',
            'air': 'air_mineral',
            'water': 'air_mineral',
            'mineral': 'air_mineral',
            'kopi': 'brewed_coffee',
            'coffee': 'brewed_coffee',
            'bandage': 'perban',
            'hoe': 'cangkul',
            'wood': 'kayu',
            'iron': 'besi',
            'gold': 'emas',
            'diamond': 'berlian',
            'stone': 'batu',
            'phone': 'smartphone',
            'hp': 'smartphone',
            'repairkit': 'toolkit',
            'ammo': 'ammo_9x19mm',
            'component': 'komponen',
            'armor': 'kevlar_biru',
            'kevlar': 'kevlar_biru',
            'key': 'newbie_key',
            'weed': 'daun_ganja',
            'marijuana': 'daun_ganja',
            'fish': 'ikan',
            'meat': 'daging'
        };

        if (customMap[clean]) {
            return `img/items/${customMap[clean]}.png`;
        }

        return `img/items/${clean}.png`;
    }

    /**
     * Klasifikasi kategori item
     */
    function getItemCategory(itemName) {
        const name = (itemName || '').toLowerCase();
        if (name.includes('fries') || name.includes('burger') || name.includes('nasi') || name.includes('ayam') || name.includes('snack') || name.includes('daging')) return 'Makanan';
        if (name.includes('air') || name.includes('cola') || name.includes('coffee') || name.includes('sprunk') || name.includes('milkshake')) return 'Minuman';
        if (name.includes('phone') || name.includes('radio') || name.includes('tablet')) return 'Elektronik';
        if (name.includes('medkit') || name.includes('perban') || name.includes('vitamin') || name.includes('pil')) return 'Medis';
        if (name.includes('ammo') || name.includes('gun') || name.includes('pistol')) return 'Senjata';
        if (name.includes('kayu') || name.includes('batu') || name.includes('besi') || name.includes('emas') || name.includes('material')) return 'Material';
        if (name.includes('ganja') || name.includes('sabu') || name.includes('cocaine')) return 'Terlarang';
        return 'Peralatan';
    }


    // =========================================================================
    // 3. INVENTORY STATE MANAGEMENT
    // =========================================================================
    const InventoryApp = {
        MAX_PLAYER_SLOTS: 20,
        MAX_RIGHT_SLOTS: 20,

        // Data Pemain
        player: {
            name: 'Rey_Simanjuntak',
            ucp: 'Dinar123',
            citizenId: 'KKRP-45287',
            phone: '555-047-0255',
            vehicle: 'Sultan (KK-782)',
            home: 'Shelly Apart, Room 1',
            weight: 12.50,
            maxWeight: 50.00,
            slots: []
        },

        // Status Tubuh
        body: {
            overall: 'OPTIMAL',
            head: 100,
            torso: 100,
            lArm: 100,
            rArm: 100,
            lLeg: 100,
            rLeg: 100
        },

        // Kontainer Kanan (Drop/Shop/Trunk/Safe)
        rightContainer: {
            mode: 'ground', // 'ground' | 'trunk' | 'shop' | 'safe'
            title: 'Ground (Sekitar)',
            subtitle: 'ITEM DI TANAH TERDEKAT',
            weight: 0.00,
            maxWeight: 100.00,
            slots: []
        },

        // Item yang sedang aktif dibuka di Popup Context Menu
        selectedItem: null, // { source: 'player' | 'right', slotIndex, item }
        
        // Pemain terdekat (untuk dialog Give)
        nearbyPlayers: [],

        // Dragging State
        draggedItem: null, // { source: 'player' | 'right', slotIndex }

        // Filter / Search
        playerSearchQuery: '',
        rightSearchQuery: '',

        // =====================================================================
        // Inisialisasi Aplikasi
        // =====================================================================
        init() {
            SoundFx.init();
            this.bindDomElements();
            this.bindEvents();
            this.setupCefBridge();

            // Selalu siapkan struktur slot kosong terlebih dahulu agar grid slot langsung tampil
            this.initEmptySlots();

            // Cek apakah berjalan di dalam Game atau Standalone Web Preview
            const isCef = window.CefBridge && window.CefBridge.isAvailable();
            if (!isCef) {
                console.info('[CEF INVENTORY] Standalone Mode aktif. Memuat Mock Roleplay Data...');
                this.loadMockData();
            } else {
                console.info('[CEF INVENTORY] Running inside open.mp CEF Engine.');
                // Minta server mengirim data awal
                window.CefBridge.emit('cef_onInventoryReady');
            }

            this.renderAll();
        },

        initEmptySlots() {
            if (!this.player.slots || this.player.slots.length === 0) {
                this.player.slots = Array.from({ length: this.MAX_PLAYER_SLOTS }, (_, i) => ({
                    slotIndex: i,
                    exists: false
                }));
            }
            if (!this.rightContainer.slots || this.rightContainer.slots.length === 0) {
                this.rightContainer.slots = Array.from({ length: this.MAX_RIGHT_SLOTS }, (_, i) => ({
                    slotIndex: i,
                    exists: false
                }));
            }
        },

        // =====================================================================
        // DOM Elements Binding
        // =====================================================================
        bindDomElements() {
            // Panel Kiri: Body & Info
            this.dom = {
                valHead: document.getElementById('valHead'),
                valTorso: document.getElementById('valTorso'),
                valLArm: document.getElementById('valLArm'),
                valRArm: document.getElementById('valRArm'),
                valLLeg: document.getElementById('valLLeg'),
                valRLeg: document.getElementById('valRLeg'),
                overallBodyStatus: document.getElementById('overallBodyStatus'),
                infoCitizenId: document.getElementById('infoCitizenId'),
                infoPhone: document.getElementById('infoPhone'),

                // Panel Tengah: Player Inventory
                btnCloseInventory: document.getElementById('btnCloseInventory'),
                btnBottomClose: document.getElementById('btnBottomClose'),
                playerWeightVal: document.getElementById('playerWeightVal'),
                playerWeightMax: document.getElementById('playerWeightMax'),
                playerWeightBar: document.getElementById('playerWeightBar'),
                playerSearchInput: document.getElementById('playerSearchInput'),
                btnClearPlayerSearch: document.getElementById('btnClearPlayerSearch'),
                playerFilledSlots: document.getElementById('playerFilledSlots'),
                playerTotalSlots: document.getElementById('playerTotalSlots'),
                hotbarSlotsContainer: document.getElementById('hotbarSlotsContainer'),
                playerSlotsContainer: document.getElementById('playerSlotsContainer'),

                // Panel Kanan: Right Container
                rightContainerTitle: document.getElementById('rightContainerTitle'),
                rightContainerSubtitle: document.getElementById('rightContainerSubtitle'),
                rightContainerModeTag: document.getElementById('rightContainerModeTag'),
                rightWeightVal: document.getElementById('rightWeightVal'),
                rightWeightMax: document.getElementById('rightWeightMax'),
                rightWeightBar: document.getElementById('rightWeightBar'),
                rightSearchInput: document.getElementById('rightSearchInput'),
                btnClearRightSearch: document.getElementById('btnClearRightSearch'),
                rightFilledSlots: document.getElementById('rightFilledSlots'),
                rightTotalSlots: document.getElementById('rightTotalSlots'),
                rightSlotsContainer: document.getElementById('rightSlotsContainer'),
                btnTakeAll: document.getElementById('btnTakeAll'),

                // Context Popup
                itemContextPopup: document.getElementById('itemContextPopup'),
                ctxItemImg: document.getElementById('ctxItemImg'),
                ctxItemName: document.getElementById('ctxItemName'),
                ctxItemCategory: document.getElementById('ctxItemCategory'),
                ctxItemWeight: document.getElementById('ctxItemWeight'),
                ctxItemQuality: document.getElementById('ctxItemQuality'),
                ctxBtnClose: document.getElementById('ctxBtnClose'),
                ctxBtnMinus: document.getElementById('ctxBtnMinus'),
                ctxBtnPlus: document.getElementById('ctxBtnPlus'),
                ctxBtnMax: document.getElementById('ctxBtnMax'),
                ctxAmountInput: document.getElementById('ctxAmountInput'),
                ctxBtnUse: document.getElementById('ctxBtnUse'),
                ctxBtnGive: document.getElementById('ctxBtnGive'),
                ctxBtnTransfer: document.getElementById('ctxBtnTransfer'),
                ctxTransferLabel: document.getElementById('ctxTransferLabel'),
                ctxBtnDrop: document.getElementById('ctxBtnDrop'),

                // Give Modal
                giveModal: document.getElementById('giveModal'),
                giveModalItemInfo: document.getElementById('giveModalItemInfo'),
                giveTargetSelect: document.getElementById('giveTargetSelect'),
                giveAmountInput: document.getElementById('giveAmountInput'),
                btnCancelGive: document.getElementById('btnCancelGive'),
                btnConfirmGive: document.getElementById('btnConfirmGive'),
                btnGiveModalClose: document.getElementById('btnGiveModalClose'),

                // Toasts & Backdrop
                toastContainer: document.getElementById('toastContainer'),
                backdrop: document.getElementById('backdrop')
            };
        },

        // =====================================================================
        // Event Listeners (Mouse, Keyboard, Tabs, Drag)
        // =====================================================================
        bindEvents() {
            // Click Close Buttons (Header ✕, Bottom Bar, Backdrop)
            if (this.dom.btnCloseInventory) {
                this.dom.btnCloseInventory.addEventListener('click', () => this.closeInventory());
            }
            if (this.dom.btnBottomClose) {
                this.dom.btnBottomClose.addEventListener('click', () => this.closeInventory());
            }
            if (this.dom.backdrop) {
                this.dom.backdrop.addEventListener('click', (e) => {
                    if (e.target === this.dom.backdrop) {
                        this.closeInventory();
                    }
                });
            }

            // Keyboard Shortcuts: ESC / TAB / I untuk menutup
            window.addEventListener('keydown', (e) => {
                const key = e.key;
                const code = e.code;
                const keyCode = e.keyCode || e.which;

                // Tutup inventory jika ESC, TAB, atau I ditekan
                if (key === 'Escape' || code === 'Escape' || keyCode === 27 ||
                    key === 'Tab' || code === 'Tab' || keyCode === 9 ||
                    key === 'i' || key === 'I' || code === 'KeyI' || keyCode === 73) {
                    if (this.dom.giveModal && this.dom.giveModal.style.display !== 'none') {
                        this.closeGiveModal();
                        e.preventDefault();
                        return;
                    }
                    if (this.dom.itemContextPopup && this.dom.itemContextPopup.style.display !== 'none') {
                        this.closeContextMenu();
                        e.preventDefault();
                        return;
                    }
                    this.closeInventory();
                    e.preventDefault();
                    return;
                }

                // Angka 1-5 untuk Hotbar Shortcut
                if (['1', '2', '3', '4', '5'].includes(key) && !this.isTypingInInput()) {
                    const slotIndex = parseInt(key, 10) - 1;
                    this.useHotbarSlot(slotIndex);
                    e.preventDefault();
                }
            }, true);

            // Klik di luar context menu untuk menutup popup
            document.addEventListener('click', (e) => {
                if (this.dom.itemContextPopup.style.display !== 'none') {
                    if (!this.dom.itemContextPopup.contains(e.target) && !e.target.closest('.inv-slot')) {
                        this.closeContextMenu();
                    }
                }
            });

            // Search Bar Filter Pemain
            this.dom.playerSearchInput.addEventListener('input', (e) => {
                this.playerSearchQuery = e.target.value.toLowerCase().trim();
                this.dom.btnClearPlayerSearch.style.display = this.playerSearchQuery ? 'block' : 'none';
                this.renderPlayerSlots();
            });

            this.dom.btnClearPlayerSearch.addEventListener('click', () => {
                this.dom.playerSearchInput.value = '';
                this.playerSearchQuery = '';
                this.dom.btnClearPlayerSearch.style.display = 'none';
                this.renderPlayerSlots();
            });

            // Search Bar Filter Kontainer Kanan
            this.dom.rightSearchInput.addEventListener('input', (e) => {
                this.rightSearchQuery = e.target.value.toLowerCase().trim();
                this.dom.btnClearRightSearch.style.display = this.rightSearchQuery ? 'block' : 'none';
                this.renderRightSlots();
            });

            this.dom.btnClearRightSearch.addEventListener('click', () => {
                this.dom.rightSearchInput.value = '';
                this.rightSearchQuery = '';
                this.dom.btnClearRightSearch.style.display = 'none';
                this.renderRightSlots();
            });

            // Context Menu Actions
            this.dom.ctxBtnClose.addEventListener('click', () => this.closeContextMenu());

            this.dom.ctxBtnMinus.addEventListener('click', () => {
                let val = parseInt(this.dom.ctxAmountInput.value, 10) || 1;
                if (val > 1) this.dom.ctxAmountInput.value = val - 1;
                SoundFx.play('hover');
            });

            this.dom.ctxBtnPlus.addEventListener('click', () => {
                let val = parseInt(this.dom.ctxAmountInput.value, 10) || 1;
                const max = this.selectedItem ? this.selectedItem.item.quantity : 999;
                if (val < max) this.dom.ctxAmountInput.value = val + 1;
                SoundFx.play('hover');
            });

            this.dom.ctxBtnMax.addEventListener('click', () => {
                if (this.selectedItem) {
                    this.dom.ctxAmountInput.value = this.selectedItem.item.quantity;
                }
                SoundFx.play('hover');
            });

            // Tombol Gunakan (Use)
            this.dom.ctxBtnUse.addEventListener('click', () => this.executeAction('use'));

            // Tombol Beri (Give)
            this.dom.ctxBtnGive.addEventListener('click', () => this.openGiveModal());

            // Tombol Pindah (Transfer)
            this.dom.ctxBtnTransfer.addEventListener('click', () => this.executeAction('transfer'));

            // Tombol Buang (Drop)
            this.dom.ctxBtnDrop.addEventListener('click', () => this.executeAction('drop'));

            // Tombol Ambil Semua (Take All)
            this.dom.btnTakeAll.addEventListener('click', () => this.executeTakeAll());

            // Give Modal Controls
            this.dom.btnCancelGive.addEventListener('click', () => this.closeGiveModal());
            this.dom.btnGiveModalClose.addEventListener('click', () => this.closeGiveModal());
            this.dom.btnConfirmGive.addEventListener('click', () => this.confirmGiveItem());
        },

        isTypingInInput() {
            const active = document.activeElement;
            return active && (active.tagName === 'INPUT' || active.tagName === 'SELECT');
        },

        // =====================================================================
        // CEF Bridge Integration (Dua arah antara Pawn & JS)
        // =====================================================================
        setupCefBridge() {
            if (!window.CefBridge) return;

            // 1. Terima update inventaris lengkap dari Pawn (backward compatible)
            window.CefBridge.on('server:openInventory', (data) => {
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (parsed.player) this.player = { ...this.player, ...parsed.player };
                    if (parsed.body) this.body = { ...this.body, ...parsed.body };
                    if (parsed.rightContainer) this.rightContainer = { ...this.rightContainer, ...parsed.rightContainer };
                    if (parsed.nearbyPlayers) this.nearbyPlayers = parsed.nearbyPlayers;

                    const root = document.getElementById('inventoryRoot');
                    if (root) root.style.display = 'grid';

                    this.renderAll();
                    window.CefBridge.setFocus(true);
                } catch (e) {
                    console.error('[CEF BRIDGE] Gagal parse data server:openInventory:', e);
                }
            });

            // 2. Terima update terpisah item pemain (aman dari pemotongan buffer)
            window.CefBridge.on('server:updatePlayerInventory', (slotsData, weight, maxWeight, citizenId, phone, name) => {
                try {
                    let slots = slotsData;
                    if (typeof slotsData === 'string') {
                        slots = JSON.parse(slotsData);
                    }
                    if (Array.isArray(slots)) {
                        this.player.slots = slots;
                    }
                    if (weight !== undefined) this.player.weight = parseFloat(weight) || 0;
                    if (maxWeight !== undefined) this.player.maxWeight = parseFloat(maxWeight) || 50;
                    if (citizenId !== undefined) this.player.citizenId = citizenId;
                    if (phone !== undefined) this.player.phone = phone;
                    if (name !== undefined) this.player.name = name;

                    const root = document.getElementById('inventoryRoot');
                    if (root) root.style.display = 'grid';

                    this.renderPlayerStats();
                    this.renderPlayerSlots();
                    window.CefBridge.setFocus(true);
                } catch (e) {
                    console.error('[CEF BRIDGE] Gagal parse server:updatePlayerInventory:', e);
                }
            });

            // 3. Terima update kontainer sekunder (ground / trunk)
            window.CefBridge.on('server:updateRightContainer', (mode, title, subtitle, weight, maxWeight, slotsData) => {
                try {
                    let slots = slotsData;
                    if (typeof slotsData === 'string') {
                        slots = JSON.parse(slotsData);
                    }
                    this.rightContainer.mode = mode || 'ground';
                    this.rightContainer.title = title || 'Ground (Sekitar)';
                    this.rightContainer.subtitle = subtitle || 'ITEM DI TANAH TERDEKAT';
                    this.rightContainer.weight = parseFloat(weight) || 0;
                    this.rightContainer.maxWeight = parseFloat(maxWeight) || 100;
                    if (Array.isArray(slots)) {
                        this.rightContainer.slots = slots;
                    }

                    this.renderRightContainerHeader();
                    this.renderRightSlots();
                } catch (e) {
                    console.error('[CEF BRIDGE] Gagal parse server:updateRightContainer:', e);
                }
            });

            // 4. Update status kesehatan tubuh
            window.CefBridge.on('server:updateBodyStatus', (hp, armor) => {
                const health = Math.round(parseFloat(hp) || 100);
                this.body.head = health;
                this.body.torso = health;
                this.body.lArm = health;
                this.body.rArm = health;
                this.body.lLeg = health;
                this.body.rLeg = health;
                this.renderBodyStatus();
            });

            // 5. Tutup inventaris dari server
            window.CefBridge.on('server:closeInventory', () => {
                this.closeInventory(false);
            });
        },

        // =====================================================================
        // Mock Data Generator (Untuk Preview Standalone di Browser)
        // =====================================================================
        loadMockData() {
            this.player.name = 'Rey_Simanjuntak';
            this.player.ucp = 'Dinar123';
            this.player.citizenId = 'KKRP-45287';
            this.player.phone = '555-047-0255';
            this.player.vehicle = 'Sultan (KK-782)';
            this.player.home = 'Shelly Apart, Room 1';
            this.player.weight = 14.25;
            this.player.maxWeight = 50.00;

            // Inisialisasi 20 slot pemain dengan beberapa item roleplay
            const playerSlots = Array.from({ length: this.MAX_PLAYER_SLOTS }, (_, i) => ({
                slotIndex: i,
                exists: false
            }));

            // Slot 0 (Hotbar 1): Fries (seperti di referensi)
            playerSlots[0] = {
                slotIndex: 0,
                exists: true,
                name: 'French Fries',
                quantity: 4,
                weight: 0.25,
                quality: 100,
                model: 2769,
                desc: 'Kentang goreng renyah bumbu keju.'
            };

            // Slot 1 (Hotbar 2): Smartphone
            playerSlots[1] = {
                slotIndex: 1,
                exists: true,
                name: 'Smartphone',
                quantity: 1,
                weight: 0.30,
                quality: 100,
                model: 18873,
                desc: 'Ponsel pintar untuk telepon dan pesan.'
            };

            // Slot 2 (Hotbar 3): Radio
            playerSlots[2] = {
                slotIndex: 2,
                exists: true,
                name: 'Radio',
                quantity: 1,
                weight: 0.30,
                quality: 100,
                model: 19942,
                desc: 'Radio HT komunikasi frekuensi tim.'
            };

            // Slot 3 (Hotbar 4): Air Mineral
            playerSlots[3] = {
                slotIndex: 3,
                exists: true,
                name: 'Air Mineral',
                quantity: 6,
                weight: 0.15,
                quality: 100,
                model: 19570,
                desc: 'Air pegunungan segar pelepas dahaga.'
            };

            // Slot 4 (Hotbar 5): Medkit
            playerSlots[4] = {
                slotIndex: 4,
                exists: true,
                name: 'Medkit',
                quantity: 2,
                weight: 1.50,
                quality: 100,
                model: 11738,
                desc: 'Kotak P3K medis darurat.'
            };

            // Slot 5+: Bahan Material, Makanan, Peluru
            playerSlots[5] = {
                slotIndex: 5,
                exists: true,
                name: 'Ammo 9x19mm',
                quantity: 50,
                weight: 0.10,
                quality: 100,
                model: 322,
                desc: 'Peluru standar kaliber 9mm.'
            };

            playerSlots[6] = {
                slotIndex: 6,
                exists: true,
                name: 'Cangkul',
                quantity: 1,
                weight: 2.00,
                quality: 85,
                model: 2228,
                desc: 'Alat berkebun dan bercocok tanam.'
            };

            playerSlots[7] = {
                slotIndex: 7,
                exists: true,
                name: 'Besi',
                quantity: 12,
                weight: 1.00,
                quality: 100,
                model: 19809,
                desc: 'Batang logam besi murni.'
            };

            this.player.slots = playerSlots;

            // Mock Data Kontainer Kanan (Ground Mode default)
            this.loadMockRightContainer('ground');

            // Mock Nearby Players untuk dialog Beri
            this.nearbyPlayers = [
                { id: 14, name: 'Budi_Santoso' },
                { id: 28, name: 'Siti_Aminah' },
                { id: 45, name: 'Andi_Kurniawan' }
            ];
        },

        /**
         * Load data kontainer sekunder berdasarkan mode
         */
        loadMockRightContainer(mode) {
            this.rightContainer.mode = mode;
            const rightSlots = Array.from({ length: this.MAX_RIGHT_SLOTS }, (_, i) => ({
                slotIndex: i,
                exists: false
            }));

            if (mode === 'ground') {
                this.rightContainer.title = 'Ground (Sekitar)';
                this.rightContainer.subtitle = 'ITEM DI TANAH TERDEKAT';
                this.rightContainer.weight = 3.50;
                this.rightContainer.maxWeight = 100.00;

                rightSlots[0] = {
                    slotIndex: 0,
                    exists: true,
                    name: 'Kayu Potong',
                    quantity: 5,
                    weight: 0.50,
                    quality: 100,
                    desc: 'Batang kayu hasil tebang yang tergeletak.'
                };
                rightSlots[1] = {
                    slotIndex: 1,
                    exists: true,
                    name: 'Jerigen',
                    quantity: 1,
                    weight: 2.50,
                    quality: 90,
                    desc: 'Jerigen bensin cadangan.'
                };
            } else if (mode === 'trunk') {
                this.rightContainer.title = 'Bagasi (Sultan)';
                this.rightContainer.subtitle = 'PENYIMPANAN TRUNK KENDARAAN';
                this.rightContainer.weight = 28.50;
                this.rightContainer.maxWeight = 75.00;

                rightSlots[0] = {
                    slotIndex: 0,
                    exists: true,
                    name: 'Toolkit',
                    quantity: 1,
                    weight: 5.00,
                    quality: 100,
                    desc: 'Set perkakas mekanik perbaikan mobil.'
                };
                rightSlots[1] = {
                    slotIndex: 1,
                    exists: true,
                    name: 'Ban Baru',
                    quantity: 2,
                    weight: 8.00,
                    quality: 100,
                    desc: 'Ban radial baru untuk pergantian roda.'
                };
                rightSlots[2] = {
                    slotIndex: 2,
                    exists: true,
                    name: 'Perban',
                    quantity: 10,
                    weight: 0.20,
                    quality: 100,
                    desc: 'Perban medis gulung steril.'
                };
            } else if (mode === 'shop') {
                this.rightContainer.title = '24/7 Supermarket';
                this.rightContainer.subtitle = 'KATALOG BELANJA TOKO KOTA';
                this.rightContainer.weight = 0.00;
                this.rightContainer.maxWeight = 0.00;

                rightSlots[0] = {
                    slotIndex: 0,
                    exists: true,
                    name: 'French Fries',
                    quantity: 99,
                    weight: 0.25,
                    price: 15,
                    quality: 100,
                    desc: 'Beli kentang goreng renyah lezat.'
                };
                rightSlots[1] = {
                    slotIndex: 1,
                    exists: true,
                    name: 'Burger',
                    quantity: 99,
                    weight: 0.35,
                    price: 25,
                    quality: 100,
                    desc: 'Burger daging sapi empuk.'
                };
                rightSlots[2] = {
                    slotIndex: 2,
                    exists: true,
                    name: 'Air Mineral',
                    quantity: 99,
                    weight: 0.15,
                    price: 10,
                    quality: 100,
                    desc: 'Air minum botol segar.'
                };
                rightSlots[3] = {
                    slotIndex: 3,
                    exists: true,
                    name: 'Smartphone',
                    quantity: 99,
                    weight: 0.30,
                    price: 350,
                    quality: 100,
                    desc: 'Ponsel komunikasi 4G LTE.'
                };
                rightSlots[4] = {
                    slotIndex: 4,
                    exists: true,
                    name: 'Radio',
                    quantity: 99,
                    weight: 0.30,
                    price: 150,
                    quality: 100,
                    desc: 'Handy Talky frekuensi walkie.'
                };
            } else if (mode === 'safe') {
                this.rightContainer.title = 'Brankas Rumah';
                this.rightContainer.subtitle = 'PENYIMPANAN AMAN KODE PIN';
                this.rightContainer.weight = 12.00;
                this.rightContainer.maxWeight = 150.00;

                rightSlots[0] = {
                    slotIndex: 0,
                    exists: true,
                    name: 'Emas',
                    quantity: 15,
                    weight: 0.50,
                    quality: 100,
                    desc: 'Emas batangan murni 24 karat.'
                };
                rightSlots[1] = {
                    slotIndex: 1,
                    exists: true,
                    name: 'Berlian',
                    quantity: 3,
                    weight: 0.10,
                    quality: 100,
                    desc: 'Permata intan berkilau bernilai tinggi.'
                };
            }

            this.rightContainer.slots = rightSlots;
        },

        /**
         * Ganti mode kontainer kanan (Sekitar / Bagasi / Toko / Brankas)
         */
        switchRightContainerMode(mode) {
            const tabs = this.dom.containerTabs.querySelectorAll('.tab-btn');
            tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));

            this.loadMockRightContainer(mode);
            this.renderRightContainerHeader();
            this.renderRightSlots();

            // Notifikasi ke server jika di dalam game
            if (window.CefBridge && window.CefBridge.isAvailable()) {
                window.CefBridge.emit('cef_onSwitchContainerMode', mode);
            }
        },

        // =====================================================================
        // RENDER FUNCTIONS
        // =====================================================================
        renderAll() {
            this.renderPlayerStats();
            this.renderBodyStatus();
            this.renderPlayerSlots();
            this.renderRightContainerHeader();
            this.renderRightSlots();
        },

        renderPlayerStats() {
            // Live Capacity
            const curr = parseFloat(this.player.weight || 0).toFixed(2);
            const max = parseFloat(this.player.maxWeight || 50).toFixed(2);
            if (this.dom.playerWeightVal) this.dom.playerWeightVal.textContent = curr;
            if (this.dom.playerWeightMax) this.dom.playerWeightMax.textContent = `${max} KG`;

            const pct = Math.min(100, Math.max(0, (curr / max) * 100));
            if (this.dom.playerWeightBar) this.dom.playerWeightBar.style.width = `${pct}%`;

            // Personal Information (Hanya ID Karakter dan No. HP)
            if (this.dom.infoCitizenId) this.dom.infoCitizenId.textContent = this.player.citizenId || 'N/A';
            if (this.dom.infoPhone) this.dom.infoPhone.textContent = this.player.phone || 'N/A';
        },

        renderBodyStatus() {
            this.dom.valHead.textContent = `${this.body.head || 100}%`;
            this.dom.valTorso.textContent = `${this.body.torso || 100}%`;
            this.dom.valLArm.textContent = `${this.body.lArm || 100}%`;
            this.dom.valRArm.textContent = `${this.body.rArm || 100}%`;
            this.dom.valLLeg.textContent = `${this.body.lLeg || 100}%`;
            this.dom.valRLeg.textContent = `${this.body.rLeg || 100}%`;

            const isInjured = (this.body.head < 90 || this.body.torso < 90 || this.body.lArm < 90 || this.body.rArm < 90 || this.body.lLeg < 90 || this.body.rLeg < 90);
            this.dom.overallBodyStatus.textContent = isInjured ? 'CEDERA' : 'OPTIMAL';
            this.dom.overallBodyStatus.className = `status-pill ${isInjured ? 'status-injured' : 'status-healthy'}`;
        },

        /**
         * Render slot pemain (Hotbar slot 0-4 dan Main inventory slot 5-19)
         */
        renderPlayerSlots() {
            this.dom.hotbarSlotsContainer.innerHTML = '';
            this.dom.playerSlotsContainer.innerHTML = '';

            let filledCount = 0;
            const slots = this.player.slots || [];

            slots.forEach((item, index) => {
                const isHotbar = index < 5;
                const hasItem = item && item.exists;
                if (hasItem) filledCount++;

                // Filter search
                if (this.playerSearchQuery) {
                    if (!hasItem) return;
                    if (!item.name.toLowerCase().includes(this.playerSearchQuery)) return;
                }

                const slotEl = this.createSlotElement({
                    source: 'player',
                    slotIndex: index,
                    item: hasItem ? item : null,
                    hotkeyNumber: isHotbar ? (index + 1) : null
                });

                if (isHotbar) {
                    this.dom.hotbarSlotsContainer.appendChild(slotEl);
                } else {
                    this.dom.playerSlotsContainer.appendChild(slotEl);
                }
            });

            this.dom.playerFilledSlots.textContent = filledCount;
            this.dom.playerTotalSlots.textContent = this.MAX_PLAYER_SLOTS;
        },

        /**
         * Render header dan stats kontainer kanan
         */
        renderRightContainerHeader() {
            this.dom.rightContainerTitle.textContent = this.rightContainer.title || 'Ground (Sekitar)';
            this.dom.rightContainerSubtitle.textContent = this.rightContainer.subtitle || 'ITEM SEKITAR';
            this.dom.rightContainerModeTag.textContent = (this.rightContainer.mode || 'ground').toUpperCase();

            // Sembunyikan capacity bar jika mode Shop
            const isShop = this.rightContainer.mode === 'shop';
            const capacityBlock = document.getElementById('rightCapacityBlock');
            if (capacityBlock) {
                capacityBlock.style.display = isShop ? 'none' : 'flex';
            }

            if (!isShop) {
                const curr = parseFloat(this.rightContainer.weight || 0).toFixed(2);
                const max = parseFloat(this.rightContainer.maxWeight || 100).toFixed(2);
                this.dom.rightWeightVal.textContent = curr;
                this.dom.rightWeightMax.textContent = `${max} KG`;
                const pct = Math.min(100, Math.max(0, (curr / max) * 100));
                this.dom.rightWeightBar.style.width = `${pct}%`;
            }

            // Ganti label tombol Take All jika di Toko
            this.dom.btnTakeAll.style.display = isShop ? 'none' : 'block';
        },

        /**
         * Render slot di kontainer kanan
         */
        renderRightSlots() {
            this.dom.rightSlotsContainer.innerHTML = '';
            let filledCount = 0;
            const slots = this.rightContainer.slots || [];

            slots.forEach((item, index) => {
                const hasItem = item && item.exists;
                if (hasItem) filledCount++;

                // Filter search
                if (this.rightSearchQuery) {
                    if (!hasItem) return;
                    if (!item.name.toLowerCase().includes(this.rightSearchQuery)) return;
                }

                const slotEl = this.createSlotElement({
                    source: 'right',
                    slotIndex: index,
                    item: hasItem ? item : null,
                    isShop: this.rightContainer.mode === 'shop'
                });

                this.dom.rightSlotsContainer.appendChild(slotEl);
            });

            this.dom.rightFilledSlots.textContent = filledCount;
            this.dom.rightTotalSlots.textContent = this.MAX_RIGHT_SLOTS;
        },

        /**
         * Helper pembuatan elemen HTML slot
         */
        createSlotElement({ source, slotIndex, item, hotkeyNumber, isShop }) {
            const slot = document.createElement('div');
            slot.className = `inv-slot ${item ? 'has-item' : 'empty'}`;
            slot.dataset.source = source;
            slot.dataset.slotIndex = slotIndex;

            // Highlight jika sedang dipilih di context popup
            if (this.selectedItem && this.selectedItem.source === source && this.selectedItem.slotIndex === slotIndex) {
                slot.classList.add('active-selected');
            }

            // Badge Hotkey (1 - 5)
            if (hotkeyNumber) {
                const badge = document.createElement('span');
                badge.className = 'slot-hotkey-badge';
                badge.textContent = hotkeyNumber;
                slot.appendChild(badge);
            }

            if (item) {
                // Quantity Badge (Top Right)
                const qtyBadge = document.createElement('span');
                qtyBadge.className = 'slot-qty-badge';
                qtyBadge.textContent = `x${item.quantity}`;
                slot.appendChild(qtyBadge);

                // Icon Item (FiveM PNG Image dengan fallback)
                const iconWrap = document.createElement('div');
                iconWrap.className = 'slot-icon-wrap';

                const img = document.createElement('img');
                img.className = 'slot-item-img';
                img.alt = item.name;
                img.src = getItemImage(item.name);
                img.draggable = false;
                img.onerror = function () {
                    this.onerror = null;
                    this.src = 'img/items/default.png';
                };
                iconWrap.appendChild(img);
                slot.appendChild(iconWrap);

                // Nama Item
                const title = document.createElement('span');
                title.className = 'slot-title';
                title.textContent = item.name;
                title.title = item.name;
                slot.appendChild(title);

                // Bottom Meta: Weight atau Price
                if (isShop && item.price !== undefined) {
                    const priceTag = document.createElement('span');
                    priceTag.className = 'slot-price-tag';
                    priceTag.textContent = `$${item.price}`;
                    slot.appendChild(priceTag);
                } else {
                    const weightBadge = document.createElement('span');
                    weightBadge.className = 'slot-weight-badge';
                    const totalItemWeight = ((item.weight || 0) * (item.quantity || 1)).toFixed(2);
                    weightBadge.textContent = `${totalItemWeight} kg`;
                    slot.appendChild(weightBadge);
                }

                // Durability / Quality Line
                const duraLine = document.createElement('div');
                duraLine.className = 'slot-durability-line';
                const duraFill = document.createElement('div');
                duraFill.className = 'slot-durability-fill';
                duraFill.style.width = `${item.quality || 100}%`;
                duraLine.appendChild(duraFill);
                slot.appendChild(duraLine);

                // Drag and Drop Attributes
                slot.draggable = true;
                slot.addEventListener('dragstart', (e) => this.onDragStart(e, source, slotIndex, item));
                slot.addEventListener('dragend', (e) => this.onDragEnd(e));
            }

            // Drag over events
            slot.addEventListener('dragover', (e) => this.onDragOver(e));
            slot.addEventListener('dragleave', (e) => this.onDragLeave(e));
            slot.addEventListener('drop', (e) => this.onDrop(e, source, slotIndex));

            // Click Handler
            slot.addEventListener('click', (e) => {
                SoundFx.play('click');
                if (item) {
                    this.openContextMenu(e, source, slotIndex, item);
                } else {
                    this.closeContextMenu();
                }
            });

            // Hover Sound
            slot.addEventListener('mouseenter', () => {
                if (item) SoundFx.play('hover');
            });

            return slot;
        },

        // =====================================================================
        // CONTEXT MENU / FLOATING ACTION POPUP
        // =====================================================================
        openContextMenu(e, source, slotIndex, item) {
            this.selectedItem = { source, slotIndex, item };

            // Update UI elements in popup
            this.dom.ctxItemName.textContent = item.name;
            this.dom.ctxItemCategory.textContent = getItemCategory(item.name);
            this.dom.ctxItemWeight.textContent = `${(item.weight || 0.25).toFixed(2)} KG`;
            this.dom.ctxItemQuality.textContent = `${item.quality || 100}%`;
            if (this.dom.ctxItemImg) {
                this.dom.ctxItemImg.src = getItemImage(item.name);
                this.dom.ctxItemImg.onerror = function () {
                    this.onerror = null;
                    this.src = 'img/items/default.png';
                };
            }

            // Reset amount stepper
            this.dom.ctxAmountInput.value = 1;
            this.dom.ctxAmountInput.max = item.quantity;

            // Sesuaikan label tombol transfer berdasarkan sumber item
            const isFromPlayer = source === 'player';
            const isShop = this.rightContainer.mode === 'shop';

            if (isFromPlayer) {
                this.dom.ctxBtnUse.style.display = 'flex';
                this.dom.ctxBtnGive.style.display = 'flex';
                this.dom.ctxBtnDrop.style.display = 'flex';
                this.dom.ctxBtnTransfer.style.display = 'flex';

                let targetName = 'Kontainer';
                if (this.rightContainer.mode === 'trunk') targetName = 'Bagasi';
                else if (this.rightContainer.mode === 'ground') targetName = 'Sekitar';
                else if (this.rightContainer.mode === 'safe') targetName = 'Brankas';
                else if (this.rightContainer.mode === 'shop') targetName = 'Jual ke Toko';

                this.dom.ctxTransferLabel.textContent = `Pindah ke ${targetName}`;
            } else {
                // Item berasal dari kontainer kanan
                this.dom.ctxBtnUse.style.display = 'none';
                this.dom.ctxBtnGive.style.display = 'none';
                this.dom.ctxBtnDrop.style.display = 'none';
                this.dom.ctxBtnTransfer.style.display = 'flex';

                if (isShop) {
                    this.dom.ctxTransferLabel.textContent = `Beli Item ($${(item.price || 10) * 1})`;
                } else {
                    this.dom.ctxTransferLabel.textContent = 'Ambil ke Kantung';
                }
            }

            // Posisi Context Menu mengambang tepat di dekat slot yang diklik
            const rect = e.currentTarget.getBoundingClientRect();
            const popup = this.dom.itemContextPopup;
            popup.style.display = 'block';

            // Kalkulasi koordinat agar tidak terpotong layar
            const popupWidth = 270;
            const popupHeight = 220;
            let left = rect.right + 12;
            let top = rect.top;

            if (left + popupWidth > window.innerWidth - 10) {
                left = rect.left - popupWidth - 12;
            }
            if (top + popupHeight > window.innerHeight - 10) {
                top = window.innerHeight - popupHeight - 15;
            }

            popup.style.left = `${Math.max(10, left)}px`;
            popup.style.top = `${Math.max(10, top)}px`;

            // Render ulang border aktif pada slot terpilih
            this.renderPlayerSlots();
            this.renderRightSlots();
        },

        closeContextMenu() {
            this.dom.itemContextPopup.style.display = 'none';
            this.selectedItem = null;
            this.renderPlayerSlots();
            this.renderRightSlots();
        },

        // =====================================================================
        // INVENTORY ACTIONS: USE, GIVE, TRANSFER, DROP
        // =====================================================================
        executeAction(actionType) {
            if (!this.selectedItem) return;
            const { source, slotIndex, item } = this.selectedItem;
            const amount = parseInt(this.dom.ctxAmountInput.value, 10) || 1;

            if (actionType === 'use') {
                SoundFx.play('use');
                this.showToast(`Menggunakan 1x ${item.name}`, 'toast-success');

                // Kirim event ke server Pawn
                if (window.CefBridge && window.CefBridge.isAvailable()) {
                    window.CefBridge.emit('cef_onInventoryUseItem', slotIndex, item.name, 1);
                } else {
                    // Mock local behavior
                    item.quantity -= 1;
                    if (item.quantity <= 0) item.exists = false;
                    this.renderPlayerSlots();
                    this.renderPlayerStats();
                }
                this.closeContextMenu();
            } else if (actionType === 'transfer') {
                this.transferItem(source, slotIndex, amount);
                this.closeContextMenu();
            } else if (actionType === 'drop') {
                SoundFx.play('move');
                this.showToast(`Membuang ${amount}x ${item.name}`, 'toast-error');

                if (window.CefBridge && window.CefBridge.isAvailable()) {
                    window.CefBridge.emit('cef_onInventoryDropItem', slotIndex, item.name, amount);
                } else {
                    // Pindahkan ke ground di mock
                    this.moveItemBetweenContainers('player', slotIndex, 'right', -1, amount);
                }
                this.closeContextMenu();
            }
        },

        /**
         * Pindahkan item antara player inventory dan kontainer kanan
         */
        transferItem(source, slotIndex, amount) {
            const targetSource = source === 'player' ? 'right' : 'player';
            const sourceContainer = source === 'player' ? this.player.slots : this.rightContainer.slots;
            const targetContainer = source === 'player' ? this.rightContainer.slots : this.player.slots;
            const item = sourceContainer[slotIndex];
            if (!item || !item.exists) return;

            SoundFx.play('move');

            if (window.CefBridge && window.CefBridge.isAvailable()) {
                if (source === 'right' && this.rightContainer.mode === 'shop') {
                    window.CefBridge.emit('cef_onInventoryBuyShopItem', slotIndex, item.name, amount);
                } else {
                    window.CefBridge.emit('cef_onInventoryMoveItem', source, slotIndex, targetSource, -1, amount);
                }
            } else {
                // Mock execution
                if (source === 'right' && this.rightContainer.mode === 'shop') {
                    this.showToast(`Membeli ${amount}x ${item.name} seharga $${(item.price || 10) * amount}`, 'toast-success');
                    this.addOrStackItem(this.player.slots, item, amount);
                } else {
                    this.moveItemBetweenContainers(source, slotIndex, targetSource, -1, amount);
                }
                this.renderAll();
            }
        },

        /**
         * Tombol Ambil Semua (Take All) dari kontainer kanan
         */
        executeTakeAll() {
            SoundFx.play('move');
            if (window.CefBridge && window.CefBridge.isAvailable()) {
                window.CefBridge.emit('cef_onInventoryTakeAll');
            } else {
                let movedAny = false;
                this.rightContainer.slots.forEach((item, idx) => {
                    if (item && item.exists) {
                        this.addOrStackItem(this.player.slots, item, item.quantity);
                        item.exists = false;
                        movedAny = true;
                    }
                });
                if (movedAny) {
                    this.showToast('Semua item berhasil diambil ke kantung!', 'toast-success');
                    this.renderAll();
                } else {
                    this.showToast('Tidak ada item yang dapat diambil!', 'toast-error');
                }
            }
        },

        // =====================================================================
        // MODAL BERI ITEM KE PEMAIN LAIN
        // =====================================================================
        openGiveModal() {
            if (!this.selectedItem) return;
            const { item } = this.selectedItem;

            this.dom.giveModalItemInfo.innerHTML = `Memberikan: <strong>${item.name}</strong>`;
            this.dom.giveAmountInput.value = this.dom.ctxAmountInput.value || 1;
            this.dom.giveAmountInput.max = item.quantity;

            // Render opsi pemain terdekat
            this.dom.giveTargetSelect.innerHTML = '';
            if (this.nearbyPlayers.length === 0) {
                const opt = document.createElement('option');
                opt.value = '-1';
                opt.textContent = 'Tidak ada pemain terdekat!';
                this.dom.giveTargetSelect.appendChild(opt);
            } else {
                this.nearbyPlayers.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = `[ID: ${p.id}] ${p.name}`;
                    this.dom.giveTargetSelect.appendChild(opt);
                });
            }

            this.lastSelectedItem = { ...this.selectedItem };
            this.closeContextMenu();
            this.dom.giveModal.style.display = 'flex';
            SoundFx.play('click');
        },

        closeGiveModal() {
            this.dom.giveModal.style.display = 'none';
        },

        confirmGiveItem() {
            const targetId = parseInt(this.dom.giveTargetSelect.value, 10);
            const amount = parseInt(this.dom.giveAmountInput.value, 10) || 1;

            if (targetId === -1 || isNaN(targetId)) {
                this.showToast('Pilih pemain terdekat terlebih dahulu!', 'toast-error');
                SoundFx.play('error');
                return;
            }

            if (!this.selectedItem && !this.lastSelectedItem) {
                this.closeGiveModal();
                return;
            }

            const item = this.selectedItem ? this.selectedItem.item : this.lastSelectedItem.item;
            const slotIndex = this.selectedItem ? this.selectedItem.slotIndex : this.lastSelectedItem.slotIndex;

            SoundFx.play('move');
            this.showToast(`Memberikan ${amount}x ${item.name} ke ID ${targetId}`, 'toast-success');

            if (window.CefBridge && window.CefBridge.isAvailable()) {
                window.CefBridge.emit('cef_onInventoryGiveItem', slotIndex, item.name, targetId, amount);
            } else {
                item.quantity -= amount;
                if (item.quantity <= 0) item.exists = false;
                this.renderAll();
            }

            this.closeGiveModal();
        },

        // =====================================================================
        // DRAG AND DROP HANDLERS
        // =====================================================================
        onDragStart(e, source, slotIndex, item) {
            this.draggedItem = { source, slotIndex, item };
            e.currentTarget.classList.add('dragging');
            e.dataTransfer.setData('text/plain', JSON.stringify({ source, slotIndex }));
            e.dataTransfer.effectAllowed = 'move';
            SoundFx.play('hover');
        },

        onDragEnd(e) {
            e.currentTarget.classList.remove('dragging');
            document.querySelectorAll('.inv-slot').forEach(s => s.classList.remove('drag-over'));
            this.draggedItem = null;
        },

        onDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const slot = e.currentTarget.closest('.inv-slot');
            if (slot) slot.classList.add('drag-over');
        },

        onDragLeave(e) {
            const slot = e.currentTarget.closest('.inv-slot');
            if (slot) slot.classList.remove('drag-over');
        },

        onDrop(e, targetSource, targetSlotIndex) {
            e.preventDefault();
            const slot = e.currentTarget.closest('.inv-slot');
            if (slot) slot.classList.remove('drag-over');

            if (!this.draggedItem) return;
            const { source, slotIndex, item } = this.draggedItem;

            // Jika dijatuhkan pada slot yang sama persis
            if (source === targetSource && slotIndex === targetSlotIndex) return;

            SoundFx.play('move');

            // Emit ke server jika di game
            if (window.CefBridge && window.CefBridge.isAvailable()) {
                window.CefBridge.emit('cef_onInventoryMoveItem', source, slotIndex, targetSource, targetSlotIndex, item.quantity);
            } else {
                // Mock perpindahan slot
                this.moveItemBetweenContainers(source, slotIndex, targetSource, targetSlotIndex, item.quantity);
                this.renderAll();
            }
        },

        moveItemBetweenContainers(srcContainerName, srcSlot, targetContainerName, targetSlot, amount) {
            const srcArr = srcContainerName === 'player' ? this.player.slots : this.rightContainer.slots;
            const tgtArr = targetContainerName === 'player' ? this.player.slots : this.rightContainer.slots;

            const item = srcArr[srcSlot];
            if (!item || !item.exists) return;

            // Cari target slot kosong jika targetSlot bernilai -1
            let destSlot = targetSlot;
            if (destSlot === -1 || destSlot === undefined) {
                destSlot = tgtArr.findIndex(s => !s.exists);
                if (destSlot === -1) {
                    this.showToast('Kontainer tujuan sudah penuh!', 'toast-error');
                    SoundFx.play('error');
                    return;
                }
            }

            const targetExisting = tgtArr[destSlot];

            // Jika item sama -> stack
            if (targetExisting && targetExisting.exists && targetExisting.name === item.name) {
                targetExisting.quantity += amount;
                item.quantity -= amount;
                if (item.quantity <= 0) item.exists = false;
            } else if (!targetExisting || !targetExisting.exists) {
                // Pindah ke slot kosong
                tgtArr[destSlot] = {
                    ...item,
                    slotIndex: destSlot,
                    quantity: amount,
                    exists: true
                };
                item.quantity -= amount;
                if (item.quantity <= 0) item.exists = false;
            } else {
                // Swap slot jika kontainer sama
                if (srcContainerName === targetContainerName) {
                    const temp = { ...srcArr[srcSlot] };
                    srcArr[srcSlot] = { ...tgtArr[destSlot], slotIndex: srcSlot };
                    tgtArr[destSlot] = { ...temp, slotIndex: destSlot };
                } else {
                    this.showToast('Slot tujuan sudah terisi!', 'toast-error');
                    SoundFx.play('error');
                }
            }
        },

        addOrStackItem(slotsArr, item, amount) {
            // Coba stack ke item sejenis
            const existing = slotsArr.find(s => s && s.exists && s.name === item.name);
            if (existing) {
                existing.quantity += amount;
                return true;
            }
            // Cari slot kosong
            const freeIndex = slotsArr.findIndex(s => !s || !s.exists);
            if (freeIndex !== -1) {
                slotsArr[freeIndex] = {
                    ...item,
                    slotIndex: freeIndex,
                    quantity: amount,
                    exists: true
                };
                return true;
            }
            return false;
        },

        /**
         * Penggunaan Cepat dari Hotbar Slot (1 - 5)
         */
        useHotbarSlot(slotIndex) {
            const slot = this.player.slots[slotIndex];
            if (!slot || !slot.exists) {
                SoundFx.play('error');
                this.showToast(`Slot Hotbar ${slotIndex + 1} kosong!`, 'toast-error');
                return;
            }

            SoundFx.play('use');
            this.showToast(`[Hotbar ${slotIndex + 1}] Menggunakan ${slot.name}`, 'toast-success');

            if (window.CefBridge && window.CefBridge.isAvailable()) {
                window.CefBridge.emit('cef_onInventoryUseItem', slotIndex, slot.name, 1);
            } else {
                slot.quantity -= 1;
                if (slot.quantity <= 0) slot.exists = false;
                this.renderPlayerSlots();
                this.renderPlayerStats();
            }
        },

        /**
         * Tutup antarmuka Inventory
         */
        closeInventory(notifyServer = true) {
            SoundFx.play('click');
            const root = document.getElementById('inventoryRoot');
            if (root) root.style.display = 'none';

            if (notifyServer && window.CefBridge && window.CefBridge.isAvailable()) {
                window.CefBridge.emit('cef_onInventoryClose');
                window.CefBridge.setFocus(false);
            } else {
                this.showToast('Inventory Ditutup. (Tekan I untuk buka kembali)', 'toast-success');
                setTimeout(() => {
                    if (root) root.style.display = 'grid';
                }, 1500);
            }
        },

        /**
         * Toast notification manager
         */
        showToast(message, type = 'toast-success') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;

            this.dom.toastContainer.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(50px)';
                toast.style.transition = 'all 0.25s ease';
                setTimeout(() => toast.remove(), 250);
            }, 3000);
        }
    };

    // Auto-boot saat DOM ready atau langsung jika document sudah ready
    function startApp() {
        if (!window.InventoryAppInitialized) {
            window.InventoryAppInitialized = true;
            InventoryApp.init();
            window.InventoryApp = InventoryApp;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
})();
