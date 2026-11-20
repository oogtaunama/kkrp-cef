/**
 * KKRP FiveM / open.mp Radial Menu (N-Key)
 * Dark Glassmorphism + Warm Orange Accents (#ff9e44, #ff7a18)
 */
(function() {
  'use strict';

  // SVG dimensions & geometry
  const SVG_CENTER = 0; // viewBox is -250 to 250
  const INNER_RADIUS = 78;
  const OUTER_RADIUS = 210;
  const ICON_RADIUS = 145; // distance from center for icon/text

  // State
  let currentMenuStack = []; // for submenus
  let activeItems = [];
  let hoveredIndex = -1;

  // Icons SVG definitions
  const ICONS = {
    citizen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    vehicle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    faction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    emotes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    inventory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    id_card: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><line x1="14" y1="9" x2="18" y2="9"/><line x1="14" y1="13" x2="18" y2="13"/></svg>`,
    cuff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
    engine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    door: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/><circle cx="9" cy="12" r="1"/></svg>`,
    trunk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    dispatch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    mdt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    give: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    wave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
    sit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z"/><line x1="5" y1="18" x2="5" y2="21"/><line x1="19" y1="18" x2="19" y2="21"/></svg>`,
    crossarms: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    dance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`
  };

  // Default Full Hierarchy Menu Data
  const DEFAULT_MENU = [
    {
      id: 'citizen',
      title: 'Warga / Diri',
      icon: ICONS.citizen,
      submenu: [
        { id: 'id_show', title: 'Tunjukkan KTP', icon: ICONS.id_card, action: 'citizen_show_id' },
        { id: 'give_cash', title: 'Beri Uang', icon: ICONS.give, action: 'citizen_give_cash' },
        { id: 'carry_person', title: 'Gendong / Bopong', icon: ICONS.citizen, action: 'citizen_carry' },
        { id: 'cuff_person', title: 'Ikat / Borgol', icon: ICONS.cuff, action: 'citizen_cuff' }
      ]
    },
    {
      id: 'vehicle',
      title: 'Kendaraan',
      icon: ICONS.vehicle,
      submenu: [
        { id: 'veh_engine', title: 'Mesin (On/Off)', icon: ICONS.engine, action: 'veh_toggle_engine' },
        { id: 'veh_lock', title: 'Kunci / Buka', icon: ICONS.lock, action: 'veh_toggle_lock' },
        { id: 'veh_trunk', title: 'Bagasi', icon: ICONS.trunk, action: 'veh_toggle_trunk' },
        { id: 'veh_door', title: 'Pintu Depan', icon: ICONS.door, action: 'veh_toggle_doors' }
      ]
    },
    {
      id: 'faction',
      title: 'Fraksi',
      icon: ICONS.faction,
      submenu: [
        { id: 'fac_mdt', title: 'Buka MDT', icon: ICONS.mdt, action: 'faction_open_mdt' },
        { id: 'fac_dispatch', title: 'Buka Dispatch', icon: ICONS.dispatch, action: 'faction_open_dispatch' },
        { id: 'fac_radar', title: 'Radar ALPR', icon: ICONS.vehicle, action: 'faction_open_alpr' },
        { id: 'fac_cuff', title: 'Borgol Tersangka', icon: ICONS.cuff, action: 'faction_cuff' }
      ]
    },
    {
      id: 'emotes',
      title: 'Animasi',
      icon: ICONS.emotes,
      submenu: [
        { id: 'emo_wave', title: 'Melambai', icon: ICONS.wave, action: 'anim_wave' },
        { id: 'emo_cross', title: 'Lipat Tangan', icon: ICONS.crossarms, action: 'anim_crossarms' },
        { id: 'emo_sit', title: 'Duduk', icon: ICONS.sit, action: 'anim_sit' },
        { id: 'emo_dance', title: 'Menari', icon: ICONS.dance, action: 'anim_dance' }
      ]
    },
    {
      id: 'inventory',
      title: 'Tas Ransel',
      icon: ICONS.inventory,
      action: 'open_inventory'
    },
    {
      id: 'phone',
      title: 'Ponsel',
      icon: ICONS.phone,
      action: 'open_phone'
    }
  ];

  // DOM elements
  const slicesGroup = document.getElementById('slicesGroup');
  const itemsOverlay = document.getElementById('itemsOverlay');
  const centerTitle = document.getElementById('centerTitle');
  const centerSub = document.getElementById('centerSub');
  const btnCenterBack = document.getElementById('btnCenterBack');

  /**
   * Helper: Convert polar coordinates to Cartesian
   */
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  /**
   * Helper: Create SVG arc path between two radii and angles
   */
  function describeArc(x, y, innerRadius, outerRadius, startAngle, endAngle) {
    const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);

    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", startOuter.x, startOuter.y,
      "A", outerRadius, outerRadius, 0, arcSweep, 0, endOuter.x, endOuter.y,
      "L", endInner.x, endInner.y,
      "A", innerRadius, innerRadius, 0, arcSweep, 1, startInner.x, startInner.y,
      "Z"
    ].join(" ");
  }

  /**
   * Render active menu items onto the circular canvas
   */
  function renderMenu(items, title = "MENU UTAMA", subtitle = "Arahkan Kursor") {
    activeItems = items;
    hoveredIndex = -1;
    slicesGroup.innerHTML = '';
    itemsOverlay.innerHTML = '';

    centerTitle.textContent = title;
    centerSub.textContent = subtitle;

    // Show/hide back button
    if (currentMenuStack.length > 0) {
      btnCenterBack.style.display = 'flex';
    } else {
      btnCenterBack.style.display = 'none';
    }

    const count = items.length;
    if (count === 0) return;

    const angleStep = 360 / count;
    // Small separation gap between slices
    const gapAngle = count > 1 ? 1.5 : 0;

    items.forEach((item, index) => {
      const startAngle = (index * angleStep) + (gapAngle / 2);
      const endAngle = ((index + 1) * angleStep) - (gapAngle / 2);
      const midAngle = (startAngle + endAngle) / 2;

      // 1. Create SVG Path for slice
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = describeArc(SVG_CENTER, SVG_CENTER, INNER_RADIUS, OUTER_RADIUS, startAngle, endAngle);
      path.setAttribute('d', d);
      path.setAttribute('class', 'radial-slice');
      path.setAttribute('data-index', index);

      // SVG mouse events
      path.addEventListener('mouseenter', () => setHoveredItem(index));
      path.addEventListener('mouseleave', () => setHoveredItem(-1));
      path.addEventListener('click', () => selectItem(index));

      slicesGroup.appendChild(path);

      // 2. Create HTML Overlay Node (Icon & Label)
      // Viewport container is 520x520; center is (260, 260)
      const cartesian = polarToCartesian(260, 260, ICON_RADIUS, midAngle);
      const node = document.createElement('div');
      node.className = 'radial-item-node';
      node.id = `nodeItem_${index}`;
      node.style.left = `${cartesian.x}px`;
      node.style.top = `${cartesian.y}px`;

      const hasSub = item.submenu && item.submenu.length > 0;
      node.innerHTML = `
        <div class="item-icon">${item.icon || ICONS.citizen}</div>
        <div class="item-title">${item.title}</div>
        ${hasSub ? '<div class="item-has-sub">&rsaquo;&rsaquo; SUB</div>' : ''}
      `;

      itemsOverlay.appendChild(node);
    });
  }

  /**
   * Highlight hovered item
   */
  function setHoveredItem(index) {
    hoveredIndex = index;
    const slices = slicesGroup.querySelectorAll('.radial-slice');
    const nodes = itemsOverlay.querySelectorAll('.radial-item-node');

    slices.forEach((s, idx) => {
      if (idx === index) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    nodes.forEach((n, idx) => {
      if (idx === index) {
        n.classList.add('hovered');
      } else {
        n.classList.remove('hovered');
      }
    });

    if (index >= 0 && activeItems[index]) {
      centerTitle.textContent = activeItems[index].title;
      centerSub.textContent = activeItems[index].submenu ? "Klik untuk Sub-Menu" : "Klik untuk Pilih";
    } else {
      const parent = currentMenuStack[currentMenuStack.length - 1];
      centerTitle.textContent = parent ? parent.title : "MENU UTAMA";
      centerSub.textContent = "Arahkan Kursor";
    }
  }

  /**
   * Select item action or navigate submenu
   */
  function selectItem(index) {
    if (index < 0 || index >= activeItems.length) return;
    const item = activeItems[index];

    if (item.submenu && item.submenu.length > 0) {
      // Push current menu to stack
      currentMenuStack.push({
        title: centerTitle.textContent,
        items: activeItems
      });
      renderMenu(item.submenu, item.title, "Pilih Aksi Sub-Menu");
    } else {
      // Execute leaf action
      executeAction(item);
    }
  }

  /**
   * Back button to previous submenu level
   */
  function goBack() {
    if (currentMenuStack.length > 0) {
      const prev = currentMenuStack.pop();
      renderMenu(prev.items, prev.title, "Arahkan Kursor");
    }
  }

  btnCenterBack.addEventListener('click', (e) => {
    e.stopPropagation();
    goBack();
  });

  /**
   * Execute Action Callback to FiveM / open.mp CEF
   */
  function executeAction(item) {
    const actionPayload = {
      id: item.id,
      action: item.action || item.id,
      title: item.title
    };

    // Close UI after selection
    closeRadial();

    // Send to FiveM NUI
    if (window.GetParentResourceName) {
      fetch(`https://${window.GetParentResourceName()}/radialSelect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(actionPayload)
      }).catch(() => {});
    }

    // Send to open.mp / SA-MP CEF
    if (window.cef && typeof window.cef.emit === 'function') {
      window.cef.emit('cef_onRadialSelect', JSON.stringify(actionPayload));
    }
  }

  /**
   * Close radial menu
   */
  function closeRadial() {
    // Reset state
    currentMenuStack = [];
    hoveredIndex = -1;

    // Send close event
    if (window.GetParentResourceName) {
      fetch(`https://${window.GetParentResourceName()}/radialClose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
      }).catch(() => {});
    }

    if (window.cef && typeof window.cef.emit === 'function') {
      window.cef.emit('cef_onRadialClose', '');
    }
  }

  // Keybindings (N or ESC to close / confirm)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.code === 'Escape') {
      if (currentMenuStack.length > 0) {
        goBack();
      } else {
        closeRadial();
      }
    } else if (e.key === 'n' || e.key === 'N' || e.code === 'KeyN') {
      // If hovering an item, select it on key press/release
      if (hoveredIndex >= 0) {
        selectItem(hoveredIndex);
      } else {
        closeRadial();
      }
    }
  });

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (currentMenuStack.length > 0) {
      goBack();
    } else {
      closeRadial();
    }
  });

  // Listeners for external open/set menu calls from game client
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data) return;

    if (data.action === 'openRadial') {
      currentMenuStack = [];
      const menuData = data.menu || DEFAULT_MENU;
      renderMenu(menuData, data.title || "MENU UTAMA");
    } else if (data.action === 'closeRadial') {
      closeRadial();
    }
  });

  // Open.mp CEF event handler
  if (window.cef && typeof window.cef.on === 'function') {
    window.cef.on('cef_openRadial', (payloadStr) => {
      try {
        const payload = JSON.parse(payloadStr || '{}');
        currentMenuStack = [];
        renderMenu(payload.menu || DEFAULT_MENU, payload.title || "MENU UTAMA");
      } catch (e) {
        renderMenu(DEFAULT_MENU, "MENU UTAMA");
      }
    });

    window.cef.on('cef_closeRadial', () => {
      closeRadial();
    });
  }

  // Initial render with default menu
  renderMenu(DEFAULT_MENU, "MENU UTAMA");

})();
