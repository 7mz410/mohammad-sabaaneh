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

// World map: tooltip with a country's activities on hover, focus or tap
const worldmap = document.querySelector('.worldmap');
if (worldmap) {
    const tip = worldmap.querySelector('.map-tip');
    const countries = [...worldmap.querySelectorAll('.map-country')];
    const chips = [...document.querySelectorAll('.map-chip')];
    let current = null;
    const small = matchMedia('(max-width: 700px)');
    // On phones, crop the map to the area around the pins so they stay tappable
    const svg = worldmap.querySelector('svg');
    const fullBox = svg.getAttribute('viewBox');
    const fit = () => {
        if (!small.matches) return svg.setAttribute('viewBox', fullBox);
        const pins = [...svg.querySelectorAll('.map-pin')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]);
        const xs = pins.map(p => p[0]), ys = pins.map(p => p[1]), pad = 30;
        const x = Math.min(...xs) - pad, y = Math.min(...ys) - pad;
        svg.setAttribute('viewBox', `${x} ${y} ${Math.max(...xs) - x + pad} ${Math.max(...ys) - y + pad}`);
    };
    fit();
    small.addEventListener('change', fit);
    const show = (g) => {
        if (current === g) return;
        current = g;
        countries.forEach(c => c.classList.toggle('is-active', c === g));
        chips.forEach(c => c.classList.toggle('is-active', c.dataset.name === g.dataset.name));
        const items = JSON.parse(g.dataset.items);
        tip.innerHTML = `<h3></h3><ul>${items.map(() => '<li></li>').join('')}</ul>`;
        tip.querySelector('h3').textContent = g.dataset.name;
        tip.querySelectorAll('li').forEach((li, i) => { li.textContent = items[i]; });
        tip.hidden = false;
        if (small.matches) return; // phones: tooltip sits under the map (CSS)
        // Anchor above the pin, kept inside the map horizontally
        const pin = g.querySelector('.map-pin').getBoundingClientRect();
        const box = worldmap.getBoundingClientRect();
        tip.hidden = false;
        const half = tip.offsetWidth / 2;
        const x = Math.min(Math.max(pin.left + pin.width / 2 - box.left, half), box.width - half);
        let y = pin.top - box.top;
        tip.style.transform = y - tip.offsetHeight - 14 < -box.top ? 'translate(-50%, 18px)' : '';
        tip.style.left = `${x}px`;
        tip.style.top = `${y}px`;
    };
    const hide = () => {
        current = null;
        tip.hidden = true;
        countries.forEach(c => c.classList.remove('is-active'));
        chips.forEach(c => c.classList.remove('is-active'));
    };
    countries.forEach(g => {
        g.addEventListener('mouseenter', () => show(g));
        g.addEventListener('focus', () => show(g));
        g.addEventListener('click', (e) => { e.stopPropagation(); show(g); });
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(g); } });
    });
    chips.forEach(chip => {
        const g = countries.find(c => c.dataset.name === chip.dataset.name);
        chip.addEventListener('mouseenter', () => show(g));
        chip.addEventListener('click', (e) => { e.stopPropagation(); show(g); });
    });
    worldmap.querySelector('svg').addEventListener('mouseleave', hide);
    document.querySelector('.map-chips').addEventListener('mouseleave', hide);
    document.addEventListener('click', hide);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}
