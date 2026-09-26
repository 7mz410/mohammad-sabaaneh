import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NAV = `
    <header class="navbar">
        <div class="container nav-container">
            <a href="index.html" class="logo-link">
                <img src="./public/Logo-White.png" alt="Mohammad Sabaaneh" class="logo">
            </a>
            <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><i class="fas fa-bars"></i></button>
            <nav class="nav-links">
                <a href="index.html#about">Bio</a>
                <a href="cartoons.html">Cartoons</a>
                <a href="murals.html">Murals</a>
                <a href="books.html">Books</a>
                <a href="prints.html">Prints</a>
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </header>`;

const FOOTER = `
    <footer class="footer" id="contact">
        <div class="container">
            <div class="social-links">
                <a href="https://www.instagram.com/sabaaneh/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://x.com/sabaaneh" target="_blank" rel="noopener" aria-label="X"><i class="fab fa-x-twitter"></i></a>
                <a href="https://www.facebook.com/msabaaneh" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="mailto:sabaaneh@gmail.com" aria-label="Email"><i class="fas fa-envelope"></i></a>
            </div>
            <p class="footer-email"><a href="mailto:sabaaneh@gmail.com"><i class="fas fa-envelope"></i> sabaaneh@gmail.com</a></p>
            <p>&copy; 2026 Mohammad Sabaaneh. All rights reserved. Powered by <a href="https://el7mz.com" target="_blank" rel="noopener" class="credit">el7mz.com</a></p>
        </div>
    </footer>`;

// Folder name -> display title
const BOOKS = {
    'Welcome to hell': ['Welcome to Hell', 'From the West Bank to Gaza'],
    '30 second from Gaza': ['30 Seconds from Gaza', 'Diary of Genocide'],
    'Power Born of Dream': ['Power Born of Dreams', 'My Story is Palestine'],
    'Palestine White and Black': ['White and Black', 'Political Cartoons from Palestine'],
};

const HEAD = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Mohammad Sabaaneh</title>
    <link rel="icon" href="./public/fav.png" type="image/png">
    <link rel="stylesheet" href="./style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>`;

const CLOSE = `
    <script type="module" src="./main.js"></script>
</body>
</html>`;

async function getWebpFiles(dir) {
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        return items.filter(f => f.isFile() && f.name.endsWith('.webp')).map(f => f.name);
    } catch { return []; }
}

async function getSubdirs(dir) {
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        return items.filter(f => f.isDirectory()).map(f => f.name).sort();
    } catch { return []; }
}

function gallerySection(title, imagesHtml, extraHtml = '') {
    return `
    <section class="gallery section">
        <div class="container">
            <h2 class="section-title sub text-center">${title}</h2>
            ${extraHtml}
            <div class="gallery-grid">
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
            <div class="gallery-grid">
                ${imgs}
            </div>
        </div>
    </section>`;
    }
    sections = `
    <section class="section pb-0">
        <div class="container">
            <h1 class="section-title text-center">CARTOONS</h1>
            <nav class="tabs" aria-label="Year">${tabs}</nav>
        </div>
    </section>` + sections;
    const html = HEAD('Cartoons') + NAV + `<main class="page">${sections}</main>` + FOOTER + CLOSE;
    await fs.writeFile(path.join(__dirname, 'cartoons.html'), html);
    console.log('Generated cartoons.html');
}

// ======================= MURALS =======================
async function generateMurals() {
    const basePath = path.join(__dirname, 'public', 'assets', 'Mural');
    const dirs = await getSubdirs(basePath);
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
    const html = HEAD('Murals') + NAV + `<main class="page">${sections}</main>` + FOOTER + CLOSE;
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
        const cover = files.find(f => /front cover/i.test(f)) || files[0];
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
    <main class="page">
        <section class="gallery section">
            <div class="container">
                <h2 class="section-title text-center">BOOKS</h2>
                <div class="gallery-grid">
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
    <main class="page">
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
            <a href="./public/assets/prints/Sabaaneh_High.pdf" download="Sabaaneh_High_Resolution.pdf" class="download-btn">
                <i class="fas fa-file-pdf"></i> Download High Resolution Portfolio
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
    const html = HEAD('Prints') + NAV + `<main class="page">${sections}</main>` + FOOTER + CLOSE;
    await fs.writeFile(path.join(__dirname, 'prints.html'), html);
    console.log('Generated prints.html');
}

// ======================= MAIN =======================
async function main() {
    await generateCartoons();
    await generateMurals();
    await generateBooks();
    await generatePrints();
}

main();
