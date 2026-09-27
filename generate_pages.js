import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LINKS = [
    ['index.html#about', 'Bio'],
    ['cartoons.html', 'Cartoons'],
    ['murals.html', 'Murals'],
    ['books.html', 'Books'],
    ['prints.html', 'Prints'],
    ['#contact', 'Contact'],
];

const SOCIAL = `
                <a href="https://www.instagram.com/sabaaneh/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://x.com/sabaaneh" target="_blank" rel="noopener" aria-label="X"><i class="fab fa-x-twitter"></i></a>
                <a href="https://www.facebook.com/msabaaneh" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>`;

const NAV = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="navbar">
        <div class="container nav-container">
            <a href="index.html" class="logo-link">
                <img src="./public/Logo-White.png" alt="Mohammad Sabaaneh home" class="logo" width="436" height="241">
            </a>
            <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="menu">
                <span class="nav-toggle-text">Menu</span>
                <span class="burger" aria-hidden="true"><span></span><span></span></span>
            </button>
        </div>
    </header>
    <div class="menu" id="menu">
        <nav class="menu-links container" aria-label="Main">
            ${LINKS.map(([href, label], i) => `<a href="${href}"><span class="num">0${i + 1}</span>${label}</a>`).join('\n            ')}
        </nav>
        <div class="menu-footer container">
            <a href="mailto:sabaaneh@gmail.com" class="menu-mail">sabaaneh@gmail.com</a>
            <div class="social-links">${SOCIAL}
            </div>
        </div>
    </div>`;

const FOOTER = `
    <footer class="footer" id="contact">
        <div class="container footer-grid">
            <div>
                <p class="eyebrow">Get in touch</p>
                <a href="mailto:sabaaneh@gmail.com" class="footer-mail">sabaaneh@gmail.com</a>
            </div>
            <div class="social-links">${SOCIAL}
            </div>
        </div>
        <div class="container footer-bottom">
            <p>&copy; 2026 Mohammad Sabaaneh. All rights reserved.</p>
            <p>Powered by <a href="https://el7mz.com" target="_blank" rel="noopener" class="credit">el7mz.com</a></p>
        </div>
    </footer>`;

// Folder name -> [title, subtitle, English cover file]
const BOOKS = {
    'Welcome to hell': ['Welcome to Hell', 'From the West Bank to Gaza', 'Welcome to Hell front cover.webp'],
    '30 second from Gaza': ['30 Seconds from Gaza', 'Diary of Genocide', '30 Seconds from Gaza front cover.webp'],
    'Power Born of Dream': ['Power Born of Dreams', 'My Story is Palestine', 'Power Born of Dreams Galley-1.webp'],
    'Palestine White and Black': ['White and Black', 'Political Cartoons from Palestine', 'White and Black front cover.webp'],
};

const HEAD = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Mohammad Sabaaneh</title>
    <link rel="icon" href="./public/fav.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="./style.css">
</head>
<body>`;

const CLOSE = `
    <script type="module" src="./main.js"></script>
</body>
</html>`;

async function getWebpFiles(dir) {
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        return items.filter(f => f.isFile() && f.name.endsWith('.webp')).map(f => f.name).sort();
    } catch { return []; }
}

async function getSubdirs(dir) {
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        return items.filter(f => f.isDirectory()).map(f => f.name).sort();
    } catch { return []; }
}

function pageHeader(eyebrow, title) {
    return `
    <section class="section pb-0">
        <div class="container">
            <p class="eyebrow text-center">${eyebrow}</p>
            <h1 class="section-title text-center">${title}</h1>
        </div>
    </section>`;
}

function gallerySection(title, imagesHtml, extraHtml = '') {
    return `
    <section class="gallery section">
        <div class="container">
            <h2 class="section-title sub">${title}</h2>
            ${extraHtml}
            <div class="gallery-grid masonry">
                ${imagesHtml}
            </div>
        </div>
    </section>`;
}

// ======================= CARTOONS =======================
async function generateCartoons() {
    const basePath = path.join(__dirname, 'public', 'assets', 'Cartoon');
    const years = (await getSubdirs(basePath)).reverse(); // newest first
    let tabs = '';
    let sections = '';
    for (const year of years) {
        const files = await getWebpFiles(path.join(basePath, year));
        if (files.length === 0) continue;
        const imgs = files.map(f => `<img src="./public/assets/Cartoon/${year}/${f}" alt="Cartoon ${year}" loading="lazy">`).join('\n                ');
        tabs += `<button class="tab" data-year="${year}">${year}</button>`;
        sections += `
    <section class="gallery section year-panel" id="y${year}" hidden>
        <div class="container">
            <div class="gallery-grid masonry">
                ${imgs}
            </div>
        </div>
    </section>`;
    }
    sections = `
    <section class="section pb-0">
        <div class="container">
            <p class="eyebrow text-center">2017 – 2024</p>
            <h1 class="section-title text-center">Cartoons</h1>
            <nav class="tabs" aria-label="Year">${tabs}</nav>
        </div>
    </section>` + sections;
    const html = HEAD('Cartoons') + NAV + `<main class="page" id="main">${sections}</main>` + FOOTER + CLOSE;
    await fs.writeFile(path.join(__dirname, 'cartoons.html'), html);
    console.log('Generated cartoons.html');
}

// ======================= MURALS =======================
async function generateMurals() {
    const basePath = path.join(__dirname, 'public', 'assets', 'Mural');
    // Newest first; folders not listed here go at the end
    const ORDER = ['Jerusalem', 'Home', 'Yasser Arafat', 'Vanella', 'Ink'];
    const dirs = (await getSubdirs(basePath)).sort((a, b) =>
        (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
    let sections = '';
    for (const dir of dirs) {
        const files = await getWebpFiles(path.join(basePath, dir));
        if (files.length === 0) continue;
        const imgs = files.map(f => `<img src="./public/assets/Mural/${dir}/${f}" alt="${dir} mural" class="animate-up" loading="lazy">`).join('\n                ');
        // Add video for Home mural
        let extra = '';
        if (dir === 'Home') {
            extra = `<div class="video-container mb"><iframe src="https://www.youtube.com/embed/j62kvrTzHTY" title="Home Mural Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        }
        sections += gallerySection(dir, imgs, extra);
    }
    const html = HEAD('Murals') + NAV + `<main class="page" id="main">${pageHeader('Public walls', 'Murals')}${sections}</main>` + FOOTER + CLOSE;
    await fs.writeFile(path.join(__dirname, 'murals.html'), html);
    console.log('Generated murals.html');
}

// ======================= BOOKS =======================
async function generateBooks() {
    const basePath = path.join(__dirname, 'public', 'assets', 'Books');
    const bookDirs = Object.keys(BOOKS);

    // Books overview page - showing covers linking to individual book pages
    let cardsHtml = '';
    for (const book of bookDirs) {
        const files = await getWebpFiles(path.join(basePath, book));
        const cover = files.includes(BOOKS[book][2]) ? BOOKS[book][2] : files[0];
        const coverImg = cover ? `./public/assets/Books/${book}/${cover}` : '';
        const slug = book.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
        const [title, subtitle] = BOOKS[book];
        cardsHtml += `
                <a href="book-${slug}.html" class="book-card animate-up">
                    <img src="${coverImg}" alt="${title} cover" loading="lazy">
                    <h3>${title}</h3>
                    <p>${subtitle}</p>
                </a>`;
    }

    const booksHtml = HEAD('Books') + NAV + `
    <main class="page" id="main">
        <section class="gallery section">
            <div class="container">
                <p class="eyebrow text-center">Published work</p>
                <h1 class="section-title text-center">Books</h1>
                <div class="book-grid">
                    ${cardsHtml}
                </div>
            </div>
        </section>
    </main>` + FOOTER + CLOSE;

    await fs.writeFile(path.join(__dirname, 'books.html'), booksHtml);
    console.log('Generated books.html');

    // Individual book pages
    for (const book of bookDirs) {
        const slug = book.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
        const files = await getWebpFiles(path.join(basePath, book));
        const pageFiles = await getWebpFiles(path.join(basePath, book, 'Pages'));
        const [title, subtitle] = BOOKS[book];

        files.sort((a, b) => (b === BOOKS[book][2]) - (a === BOOKS[book][2]));
        let coverImgs = files.map(f => `<img src="./public/assets/Books/${book}/${f}" alt="${title} cover" class="animate-up" loading="lazy">`).join('\n                ');

        let pagesImgs = '';
        if (pageFiles.length > 0) {
            pagesImgs = pageFiles.map(f => `<img src="./public/assets/Books/${book}/Pages/${f}" alt="${title} page" class="animate-up" loading="lazy">`).join('\n                ');
        }

        // Add video for Power Born of Dreams
        let videoHtml = '';
        if (book === 'Power Born of Dream') {
            videoHtml = `
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/OIi4wYCErS8" title="Power Born of Dreams" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
        }

        let text = '';
        try {
            text = await fs.readFile(path.join(__dirname, 'content', 'books', `${slug}.html`), 'utf8');
            text = `<section class="section pb-0"><div class="container"><div class="book-text">${text}</div></div></section>`;
        } catch {}

        let sections = text + gallerySection('Covers', coverImgs);
        if (videoHtml) sections += `<section class="section bg-dark"><div class="container"><h2 class="section-title sub text-center">Video</h2>${videoHtml}</div></section>`;
        if (pagesImgs) sections += gallerySection('Pages', pagesImgs);

        const bookHtml = HEAD(title) + NAV + `
    <main class="page" id="main">
        <section class="section pb-0">
            <div class="container">
                <p class="text-center"><a href="books.html" class="back-link">← Back to Books</a></p>
                <h1 class="section-title text-center book-title">${title}</h1>
                <p class="text-center book-subtitle">${subtitle}</p>
            </div>
        </section>
        ${sections}
    </main>` + FOOTER + CLOSE;

        await fs.writeFile(path.join(__dirname, `book-${slug}.html`), bookHtml);
        console.log(`Generated book-${slug}.html`);
    }
}

// ======================= PRINTS =======================
async function generatePrints() {
    const basePath = path.join(__dirname, 'public', 'assets', 'prints');
    const dirs = await getSubdirs(basePath);
    let sections = '';

    // Add download link for sabaaneh high.pdf
    sections += `
    <section class="section pb-0">
        <div class="container text-center">
            <a href="./public/assets/prints/Sabaaneh_High.pdf" download="Sabaaneh_High_Resolution.pdf" class="btn">
                <i class="fas fa-arrow-down"></i> Download High Resolution Portfolio (PDF)
            </a>
        </div>
    </section>`;

    // Sort so Digital comes last
    const sortedDirs = dirs.filter(d => d !== 'Digital');
    const hasDigital = dirs.includes('Digital');
    if (hasDigital) sortedDirs.push('Digital');

    for (const dir of sortedDirs) {
        const files = await getWebpFiles(path.join(basePath, dir));
        if (files.length === 0) continue;
        const imgs = files.map(f => `<img src="./public/assets/prints/${dir}/${f}" alt="${dir}" class="animate-up" loading="lazy">`).join('\n                ');
        sections += gallerySection(dir, imgs);
    }
    const html = HEAD('Prints') + NAV + `<main class="page" id="main">${pageHeader('Printmaking', 'Prints')}${sections}</main>` + FOOTER + CLOSE;
    await fs.writeFile(path.join(__dirname, 'prints.html'), html);
    console.log('Generated prints.html');
}

// ======================= MAIN =======================
// Inject shared nav/footer into the hand-written index.html
async function syncIndex() {
    const file = path.join(__dirname, 'index.html');
    let html = await fs.readFile(file, 'utf8');
    html = html
        .replace(/<!-- NAV -->[\s\S]*<!-- \/NAV -->/, `<!-- NAV -->${NAV}\n<!-- /NAV -->`)
        .replace(/<!-- FOOTER -->[\s\S]*<!-- \/FOOTER -->/, `<!-- FOOTER -->${FOOTER}\n<!-- /FOOTER -->`);
    await fs.writeFile(file, html);
    console.log('Synced index.html');
}

// ======================= 404 =======================
async function generate404() {
    // <base> keeps relative asset paths working at any missing URL depth
    const html = HEAD('Page not found').replace('<head>', '<head>\n    <base href="/">') + NAV + `
    <main class="page" id="main">
        <section class="section">
            <div class="container text-center">
                <p class="eyebrow">Error 404</p>
                <h1 class="section-title">Page not found</h1>
                <a href="index.html" class="btn">Back to home</a>
            </div>
        </section>
    </main>` + FOOTER + CLOSE;
    await fs.writeFile(path.join(__dirname, '404.html'), html);
    console.log('Generated 404.html');
}

async function main() {
    await syncIndex();
    await generate404();
    await generateCartoons();
    await generateMurals();
    await generateBooks();
    await generatePrints();
}

main();
