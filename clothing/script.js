/**
 * KKRP - UI Toko Baju Simpel (Kotak Panah Kiri / Kanan)
 * Selaras dengan alur textdraw lama: Pakaian, Topi, Kacamata, Aksesoris, Tas/Koper
 */
(function () {
    'use strict';

    const CATEGORIES = [
        { id: 0, name: 'Pakaian', price: 150, maxIndex: 150 },
        { id: 1, name: 'Topi / Helm', price: 100, maxIndex: 119 },
        { id: 2, name: 'Kacamata', price: 75, maxIndex: 32 },
        { id: 3, name: 'Aksesoris', price: 120, maxIndex: 85 },
        { id: 4, name: 'Tas / Koper', price: 200, maxIndex: 9 }
    ];

    const state = {
        isOpen: true,
        catIndex: 0,
        itemIndex: 0,
        maxIndex: CATEGORIES[0].maxIndex,
        price: CATEGORIES[0].price
    };

    const el = {
        panel: document.getElementById('clothingPanel'),
        catName: document.getElementById('catName'),
        catCounter: document.getElementById('catCounter'),
        itemLabel: document.getElementById('itemLabel'),
        itemCounter: document.getElementById('itemCounter'),
        itemPrice: document.getElementById('itemPrice'),
        btnCatPrev: document.getElementById('btnCatPrev'),
        btnCatNext: document.getElementById('btnCatNext'),
        btnItemPrev: document.getElementById('btnItemPrev'),
        btnItemNext: document.getElementById('btnItemNext'),
        btnBuyItem: document.getElementById('btnBuyItem'),
        btnCancelShop: document.getElementById('btnCancelShop'),
        btnCloseShop: document.getElementById('btnCloseShop')
    };

    function render() {
        const cat = CATEGORIES[state.catIndex] || CATEGORIES[0];
        el.catName.textContent = cat.name;
        el.catCounter.textContent = `${state.catIndex + 1} / ${CATEGORIES.length}`;
        el.itemLabel.textContent = `${cat.name} #${state.itemIndex + 1}`;
        el.itemCounter.textContent = `${state.itemIndex} / ${state.maxIndex}`;
        el.itemPrice.textContent = `$${Number(state.price).toLocaleString('en-US')}`;
    }

    function emitEvent(name, ...args) {
        if (window.CefBridge && typeof window.CefBridge.emit === 'function') {
            window.CefBridge.emit(name, ...args);
        } else if (window.cef && typeof window.cef.emit === 'function') {
            window.cef.emit(name, ...args);
        }
    }

    function changeCategory(delta) {
        const len = CATEGORIES.length;
        state.catIndex = (state.catIndex + delta + len) % len;
        const cat = CATEGORIES[state.catIndex];
        state.itemIndex = 0;
        state.maxIndex = cat.maxIndex;
        state.price = cat.price;
        render();
        emitEvent('cef_onClothesSelectCategory', cat.id);
    }

    function changeItem(delta) {
        if (delta < 0) {
            state.itemIndex = state.itemIndex > 0 ? state.itemIndex - 1 : state.maxIndex;
            render();
            emitEvent('cef_onClothesPrev', CATEGORIES[state.catIndex].id, state.itemIndex);
        } else {
            state.itemIndex = state.itemIndex < state.maxIndex ? state.itemIndex + 1 : 0;
            render();
            emitEvent('cef_onClothesNext', CATEGORIES[state.catIndex].id, state.itemIndex);
        }
    }

    function buyCurrentItem() {
        const cat = CATEGORIES[state.catIndex];
        emitEvent('cef_onClothesBuy', cat.id, state.itemIndex);
    }

    function closeShop(notify = true) {
        state.isOpen = false;
        el.panel?.classList.add('is-hidden');
        if (window.CefBridge) {
            window.CefBridge.setFocus(false);
        }
        if (notify) {
            emitEvent('cef_onClothesClose');
        }
    }

    function openShop(payload = {}) {
        state.isOpen = true;
        if (typeof payload.categoryId === 'number') {
            const idx = CATEGORIES.findIndex(c => c.id === payload.categoryId);
            if (idx !== -1) state.catIndex = idx;
        }
        state.itemIndex = Number(payload.itemIndex) || 0;
        state.maxIndex = Number(payload.maxIndex ?? CATEGORIES[state.catIndex].maxIndex);
        state.price = Number(payload.price ?? CATEGORIES[state.catIndex].price);
        el.panel?.classList.remove('is-hidden');
        if (window.CefBridge) {
            window.CefBridge.setFocus(true);
        }
        render();
    }

    el.btnCatPrev?.addEventListener('click', () => changeCategory(-1));
    el.btnCatNext?.addEventListener('click', () => changeCategory(1));
    el.btnItemPrev?.addEventListener('click', () => changeItem(-1));
    el.btnItemNext?.addEventListener('click', () => changeItem(1));
    el.btnBuyItem?.addEventListener('click', buyCurrentItem);
    el.btnCancelShop?.addEventListener('click', () => closeShop(true));
    el.btnCloseShop?.addEventListener('click', () => closeShop(true));

    window.addEventListener('keydown', (e) => {
        if (!state.isOpen) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closeShop(true);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            changeItem(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            changeItem(1);
        }
    });

    if (window.CefBridge) {
        window.CefBridge.on('cef:openClothesShop', (raw) => {
            try {
                const data = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
                openShop(data);
            } catch (e) {
                openShop({});
            }
        });
        window.CefBridge.on('cef:updateClothesShop', (raw) => {
            try {
                const data = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
                openShop(data);
            } catch (e) {}
        });
        window.CefBridge.on('cef:closeClothesShop', () => closeShop(false));
    }

    render();
})();
