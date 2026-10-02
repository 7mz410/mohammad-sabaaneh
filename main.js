// Scroll-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.hero .animate-up, .hero .animate-fade')
    .forEach(el => setTimeout(() => el.classList.add('visible'), 100));
document.querySelectorAll('.animate-up:not(.hero *), .animate-fade:not(.hero *)')
    .forEach(el => observer.observe(el));

// Navbar shrink on scroll
const navbar = document.querySelector('.navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Fullscreen menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
const setMenu = (open) => {
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('.nav-toggle-text').textContent = open ? 'Close' : 'Menu';
    if (open) menu.querySelector('a').focus();
};
toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); }
});
const page = location.pathname.split('/').pop() || 'index.html';
menu.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === page) a.setAttribute('aria-current', 'page');
});

// Cartoon year tabs (#2019 in the URL opens that year)
const tabs = [...document.querySelectorAll('.tab')];
if (tabs.length) {
    const select = (year) => {
        tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.year === year));
        document.querySelectorAll('.year-panel').forEach(p => { p.hidden = p.id !== 'y' + year; });
    };
    tabs.forEach(t => t.addEventListener('click', () => {
        select(t.dataset.year);
        history.replaceState(null, '', '#' + t.dataset.year);
    }));
    const fromHash = location.hash.slice(1);
    select(tabs.some(t => t.dataset.year === fromHash) ? fromHash : tabs[0].dataset.year);
}

// Lightbox with prev/next, keyboard and swipe (navigates within the clicked gallery)
const allImages = [...document.querySelectorAll('.gallery-grid img')];
let images = [];
if (allImages.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `
        <button class="lb-btn lb-close" aria-label="Close"><i class="fas fa-xmark"></i></button>
        <button class="lb-btn lb-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
        <img class="lightbox-img" alt="">
        <button class="lb-btn lb-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
        <span class="lb-count"></span>`;
    document.body.append(box);
    const img = box.querySelector('img');
    const count = box.querySelector('.lb-count');
    let i = 0;

    const show = (n) => {
        i = (n + images.length) % images.length;
        img.src = images[i].src;
        img.alt = images[i].alt;
        count.textContent = `${i + 1} / ${images.length}`;
    };
    const open = (n) => { show(n); box.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { box.classList.remove('active'); document.body.style.overflow = ''; };

    allImages.forEach(el => el.addEventListener('click', () => {
        images = [...el.closest('.gallery-grid').querySelectorAll('img')];
        open(images.indexOf(el));
    }));
    box.querySelector('.lb-close').onclick = close;
    box.querySelector('.lb-prev').onclick = () => show(i - 1);
    box.querySelector('.lb-next').onclick = () => show(i + 1);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
        if (!box.classList.contains('active')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(i - 1);
        if (e.key === 'ArrowRight') show(i + 1);
    });

    let startX = 0;
    box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
    });
}

// Featured news carousel: auto-advances, pauses on hover/focus
const featured = document.querySelector('.featured');
if (featured) {
    const tabs = [...featured.querySelectorAll('.featured-tab')];
    const slides = featured.querySelectorAll('.featured-slide');
    const imgs = featured.querySelectorAll('.featured-img');
    const delay = 7000;
    let current = 0, timer;
    const show = (i) => {
        current = (i + tabs.length) % tabs.length;
        tabs.forEach((t, n) => t.setAttribute('aria-selected', n === current));
        slides.forEach((s, n) => { s.hidden = n !== current; s.classList.toggle('active', n === current); });
        imgs.forEach((img, n) => img.classList.toggle('active', n === current));
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const play = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show(current + 1), delay); };
    tabs.forEach((t, i) => t.addEventListener('click', () => { show(i); play(); }));
    featured.addEventListener('mouseenter', () => { clearInterval(timer); featured.classList.add('paused'); });
    featured.addEventListener('mouseleave', () => { featured.classList.remove('paused'); play(); });
    featured.addEventListener('focusin', () => { clearInterval(timer); featured.classList.add('paused'); });
    featured.addEventListener('focusout', () => { featured.classList.remove('paused'); play(); });
    play();
}

// Close enquire menus on outside click or Escape
document.addEventListener('click', (e) => {
    document.querySelectorAll('details.enquire[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('details.enquire[open]').forEach(d => { d.open = false; });
});

// World map: zoom/pan via viewBox, tooltip per place (pin) or per country
const worldmap = document.querySelector('.worldmap');
if (worldmap) {
    const svg = worldmap.querySelector('svg');
    const tip = worldmap.querySelector('.map-tip');
    const countries = [...svg.querySelectorAll('.map-country')];
    const chips = [...document.querySelectorAll('.map-chip')];
    const regionBtns = [...worldmap.querySelectorAll('[data-region]')];
    const full = svg.getAttribute('viewBox').split(' ').map(Number);
    const regions = JSON.parse(svg.dataset.regions);
    const small = matchMedia('(max-width: 700px)');
    const canHover = matchMedia('(hover: hover)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let vb = [...full];

    // Pins and strokes keep their on-screen size at any zoom
    const pinBase = [...svg.querySelectorAll('.map-pin, .map-pulse')].map(c => [c, +c.getAttribute('r')]);
    const apply = () => {
        svg.setAttribute('viewBox', vb.map(v => v.toFixed(2)).join(' '));
        const k = full[2] / vb[2];
        pinBase.forEach(([c, r]) => c.setAttribute("r", (r / Math.pow(k, 0.75)).toFixed(2)));
        svg.style.setProperty('--k', k);
    };
    const clamp = (b) => {
        const w = Math.min(Math.max(b[2], full[2] / 12), full[2]);
        const h = w * full[3] / full[2];
        const x = Math.min(Math.max(b[0], full[0]), full[0] + full[2] - w);
        const y = Math.min(Math.max(b[1], full[1]), full[1] + full[3] - h);
        return [x, y, w, h];
    };
    let anim;
    const animateTo = (target) => {
        target = clamp(target);
        cancelAnimationFrame(anim);
        if (reduced) { vb = target; return apply(); }
        const from = [...vb], t0 = performance.now();
        const step = (t) => {
            const p = Math.min((t - t0) / 600, 1), e = 1 - Math.pow(1 - p, 3);
            vb = from.map((v, i) => v + (target[i] - v) * e);
            apply();
            if (p < 1) anim = requestAnimationFrame(step);
        };
        anim = requestAnimationFrame(step);
    };
    // Fit a rect (keeping the map's aspect ratio) with some padding
    const fitRect = ([x, y, w, h], pad = 0.15) => {
        const ar = full[2] / full[3];
        let W = w * (1 + pad * 2), H = h * (1 + pad * 2);
        if (W / H > ar) H = W / ar; else W = H * ar;
        return [x + w / 2 - W / 2, y + h / 2 - H / 2, W, H];
    };
    const zoomAt = (factor, cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2, animate = true) => {
        const w = vb[2] / factor, h = vb[3] / factor;
        const next = [cx - (cx - vb[0]) / factor, cy - (cy - vb[1]) / factor, w, h];
        animate ? animateTo(next) : (vb = clamp(next), apply());
    };
    const toSvg = (e) => {
        const r = svg.getBoundingClientRect();
        return [vb[0] + (e.clientX - r.left) / r.width * vb[2], vb[1] + (e.clientY - r.top) / r.height * vb[3]];
    };
    const setRegion = (name) => {
        regionBtns.forEach(b => b.classList.toggle('is-active', b.dataset.region === name));
        hide();
        animateTo(name === 'world' ? (small.matches ? fitRect(regions.world || full, 0) : full) : fitRect(regions[name]));
    };
    // Phones start on the area that has pins
    const pinsBox = () => {
        const pts = pinBase.filter(([c]) => c.classList.contains('map-pin')).map(([c]) => [+c.getAttribute('cx'), +c.getAttribute('cy')]);
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
    };
    regions.world = pinsBox();
    const start = () => { vb = small.matches ? clamp(fitRect(regions.world, 0.08)) : [...full]; apply(); };
    start();
    small.addEventListener('change', start);
    regionBtns.forEach(b => b.addEventListener('click', () => setRegion(b.dataset.region)));
    worldmap.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => { hide(); zoomAt(b.dataset.zoom === 'in' ? 2 : 0.5); }));

    // Ctrl/⌘ + wheel or trackpad pinch zooms; plain wheel keeps scrolling the page
    svg.addEventListener('wheel', (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        hide();
        const [cx, cy] = toSvg(e);
        zoomAt(Math.exp(-e.deltaY * 0.01), cx, cy, false);
    }, { passive: false });
    svg.addEventListener('dblclick', (e) => { const [cx, cy] = toSvg(e); zoomAt(2, cx, cy); });

    // Drag to pan, two fingers to pinch
    const pointers = new Map();
    let last = null, pinchDist = 0, moved = false;
    svg.addEventListener('pointerdown', (e) => {
        pointers.set(e.pointerId, e);
        moved = false;
        if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
        last = e;
    });
    svg.addEventListener('pointermove', (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, e);
        const r = svg.getBoundingClientRect();
        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
            const mid = toSvg({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 });
            if (pinchDist) zoomAt(d / pinchDist, mid[0], mid[1], false);
            pinchDist = d; moved = true;
            return;
        }
        if (!last || vb[2] >= full[2] - 0.5) return; // no panning at full world view
        const dx = (e.clientX - last.clientX) / r.width * vb[2], dy = (e.clientY - last.clientY) / r.height * vb[3];
        if (Math.abs(e.clientX - last.clientX) + Math.abs(e.clientY - last.clientY) > 2) { moved = true; svg.classList.add('is-dragging'); hide(); }
        vb = clamp([vb[0] - dx, vb[1] - dy, vb[2], vb[3]]);
        apply();
        last = e;
    });
    const end = (e) => { pointers.delete(e.pointerId); if (!pointers.size) { last = null; pinchDist = 0; svg.classList.remove('is-dragging'); } };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.style.touchAction = 'pan-y';

    // Tooltip
    let current = null;
    const render = (title, groups) => {
        tip.innerHTML = '';
        const h = document.createElement('h3'); h.textContent = title; tip.append(h);
        groups.forEach(([place, items]) => {
            if (place) { const p = document.createElement('p'); p.className = 'map-tip-place'; p.textContent = place; tip.append(p); }
            const ul = document.createElement('ul');
            items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
            tip.append(ul);
        });
    };
    const show = (el) => {
        if (current === el) return;
        current = el;
        const country = el.closest('.map-country');
        countries.forEach(c => c.classList.toggle('is-active', c === country));
        svg.querySelectorAll('.map-point').forEach(p => p.classList.toggle('is-active', p === el));
        chips.forEach(c => c.classList.toggle('is-active', c.dataset.name === country.dataset.name));
        const points = [...country.querySelectorAll('.map-point')];
        if (el.classList.contains('map-point')) {
            const multi = points.length > 1;
            render(multi ? el.dataset.place : country.dataset.name, [[multi ? country.dataset.name : '', JSON.parse(el.dataset.items)]]);
        } else {
            render(country.dataset.name, points.map(p => [points.length > 1 ? p.dataset.place : '', JSON.parse(p.dataset.items)]));
        }
        tip.hidden = false;
        if (small.matches) return; // phones: tooltip sits under the map (CSS)
        const anchor = (el.querySelector('.map-pin') || points[0].querySelector('.map-pin')).getBoundingClientRect();
        const box = worldmap.getBoundingClientRect();
        const half = tip.offsetWidth / 2;
        tip.style.left = `${Math.min(Math.max(anchor.left + anchor.width / 2 - box.left, half), box.width - half)}px`;
        tip.style.top = `${anchor.top - box.top}px`;
        tip.style.transform = anchor.top - tip.offsetHeight - 20 < 0 ? 'translate(-50%, 18px)' : '';
    };
    const hide = () => {
        current = null;
        tip.hidden = true;
        countries.forEach(c => c.classList.remove('is-active'));
        svg.querySelectorAll('.map-point.is-active').forEach(p => p.classList.remove('is-active'));
        chips.forEach(c => c.classList.remove('is-active'));
    };
    const target = (e) => e.target.closest('.map-point') || e.target.closest('.map-country');
    svg.addEventListener('mouseover', (e) => { if (canHover.matches && !pointers.size && target(e)) show(target(e)); });
    svg.addEventListener('mouseleave', () => { if (!pointers.size) hide(); });
    svg.addEventListener('click', (e) => { e.stopPropagation(); if (moved) return; const t = target(e); t ? show(t) : hide(); });
    svg.addEventListener('focusin', (e) => { if (e.target.closest('.map-point')) show(e.target.closest('.map-point')); });
    svg.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.map-point')) { e.preventDefault(); show(e.target.closest('.map-point')); } });
    chips.forEach(chip => {
        const c = countries.find(c => c.dataset.name === chip.dataset.name);
        chip.addEventListener('mouseenter', () => { if (canHover.matches) show(c); });
        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            current = null;
            // Zoom to the country's pins, then show its list
            const pts = [...c.querySelectorAll('.map-pin')].map(p => [+p.getAttribute('cx'), +p.getAttribute('cy')]);
            const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
            const w = Math.max(Math.max(...xs) - Math.min(...xs), 40), h = Math.max(Math.max(...ys) - Math.min(...ys), 25);
            regionBtns.forEach(b => b.classList.remove('is-active'));
            animateTo(fitRect([(Math.min(...xs) + Math.max(...xs)) / 2 - w / 2, (Math.min(...ys) + Math.max(...ys)) / 2 - h / 2, w, h], 0.6));
            setTimeout(() => show(c), reduced ? 0 : 620);
        });
    });
    document.querySelector('.map-chips').addEventListener('mouseleave', hide);
    document.addEventListener('click', hide);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}
