import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NAV = `
    <header class="navbar" style="background: rgba(26, 26, 26, 1);">
        <div class="container nav-container">
            <a href="index.html" class="logo-link">
                <img src="./public/Logo-White.png" alt="Sabaaneh Logo" style="height: 50px;">
            </a>
            <nav class="nav-links">
                <a href="index.html#about">Bio</a>
                <a href="cartoons.html">Cartoons</a>
                <a href="murals.html">Murals</a>
                <a href="books.html">Books</a>
                <a href="prints.html">Prints</a>
            </nav>
        </div>
    </header>`;

const LIGHTBOX = `
    <div id="lightbox" class="lightbox">
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-img" id="lightbox-img" src="">
    </div>`;

const FOOTER = `
    <footer class="footer">
        <div class="container">
            <div class="social-links">
                <a href="https://www.instagram.com/sabaaneh/" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="https://x.com/sabaaneh" target="_blank"><i class="fab fa-twitter"></i></a>
                <a href="https://www.facebook.com/msabaaneh" target="_blank"><i class="fab fa-facebook-f"></i></a>
            </div>
            <p>&copy; 2026 Mohammad Sabaaneh. All rights reserved. Powered by <a href="https://el7mz.com" target="_blank" style="text-decoration: underline; color: #fff;">el7mz.com</a></p>
        </div>
    </footer>`;

const HEAD = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mohammad Sabaaneh - ${title}</title>
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
            <h2 class="section-title text-center" style="font-size: 2rem;">${title}</h2>
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
    let sections = '';
    for (const year of years) {
        const files = await getWebpFiles(path.join(basePath, year));
        if (files.length === 0) continue;
        const imgs = files.map(f => `<img src="./public/assets/Cartoon/${year}/${f}" alt="Cartoon ${year}" class="animate-up" loading="lazy">`).join('\n                ');
        sections += gallerySection(year, imgs);
    }
    const html = HEAD('Cartoons') + NAV + `<div style="margin-top:100px;">${sections}</div>` + LIGHTBOX + FOOTER + CLOSE;
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
        const imgs = files.map(f => `<img src="./public/assets/Mural/${dir}/${f}" alt="${dir}" class="animate-up" loading="lazy">`).join('\n                ');
        // Add video for Home mural
        let extra = '';
        if (dir.trim() === 'Home') {
            extra = `<div class="video-container" style="margin-bottom: 2rem;"><iframe src="https://www.youtube.com/embed/j62kvrTzHTY" title="Home Mural Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        }
        sections += gallerySection(dir.trim(), imgs, extra);
    }
    const html = HEAD('Murals') + NAV + `<div style="margin-top:100px;">${sections}</div>` + LIGHTBOX + FOOTER + CLOSE;
    await fs.writeFile(path.join(__dirname, 'murals.html'), html);
    console.log('Generated murals.html');
}

// ======================= BOOKS =======================
async function generateBooks() {
    const basePath = path.join(__dirname, 'public', 'assets', 'Books');
    const bookDirs = await getSubdirs(basePath);

    // Books overview page - showing covers linking to individual book pages
    let cardsHtml = '';
    for (const book of bookDirs) {
        const files = await getWebpFiles(path.join(basePath, book));
        const coverImg = files.length > 0 ? `./public/assets/Books/${book}/${files[0]}` : '';
        const slug = book.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
        cardsHtml += `
                <a href="book-${slug}.html" class="book-card animate-up">
                    <img src="${coverImg}" alt="${book}" loading="lazy">
                    <h3>${book}</h3>
                </a>`;
    }

    const booksHtml = HEAD('Books') + NAV + `
    <div style="margin-top:100px;">
        <section class="gallery section">
            <div class="container">
                <h2 class="section-title text-center">BOOKS</h2>
                <div class="gallery-grid">
                    ${cardsHtml}
                </div>
            </div>
        </section>
    </div>` + LIGHTBOX + FOOTER + CLOSE;

    await fs.writeFile(path.join(__dirname, 'books.html'), booksHtml);
    console.log('Generated books.html');

    // Individual book pages
    for (const book of bookDirs) {
        const slug = book.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
        const files = await getWebpFiles(path.join(basePath, book));
        const pageFiles = await getWebpFiles(path.join(basePath, book, 'Pages'));

        let coverImgs = files.map(f => `<img src="./public/assets/Books/${book}/${f}" alt="${book}" class="animate-up" loading="lazy">`).join('\n                ');

        let pagesImgs = '';
        if (pageFiles.length > 0) {
            pagesImgs = pageFiles.map(f => `<img src="./public/assets/Books/${book}/Pages/${f}" alt="${book} page" class="animate-up" loading="lazy">`).join('\n                ');
        }

        // Add video for Power Born of Dreams
        let videoHtml = '';
        if (book.trim().includes('Power Born')) {
            videoHtml = `
            <div class="video-container" style="margin: 3rem auto;">
                <iframe src="https://www.youtube.com/embed/OIi4wYCErS8" title="Power Born of Dreams" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
        }

        let sections = gallerySection('Covers', coverImgs);
        if (videoHtml) sections += `<section class="section bg-dark"><div class="container"><h2 class="section-title text-center" style="font-size:2rem;">Video</h2>${videoHtml}</div></section>`;
        if (pagesImgs) sections += gallerySection('Pages', pagesImgs);

        const bookHtml = HEAD(book.trim()) + NAV + `
    <div style="margin-top:100px;">
        <section class="section" style="padding-bottom:0;">
            <div class="container">
                <h2 class="section-title text-center">${book.trim().toUpperCase()}</h2>
                <p class="text-center"><a href="books.html" style="color: var(--accent-color);">← Back to Books</a></p>
            </div>
        </section>
        ${sections}
    </div>` + LIGHTBOX + FOOTER + CLOSE;

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
    <section class="section" style="padding-bottom: 0;">
        <div class="container text-center">
            <a href="./public/assets/prints/Sabaaneh_High.pdf" download="Sabaaneh_High_Resolution.pdf" class="download-btn" style="font-size: 1.1rem;">
                <i class="fas fa-file-pdf"></i> Download High Resolution Portfolio
            </a>
        </div>
    </section>`;

    for (const dir of dirs) {
        const files = await getWebpFiles(path.join(basePath, dir));
        if (files.length === 0) continue;
        const imgs = files.map(f => `<img src="./public/assets/prints/${dir}/${f}" alt="${dir}" class="animate-up" loading="lazy">`).join('\n                ');
        sections += gallerySection(dir, imgs);
    }
    const html = HEAD('Prints') + NAV + `<div style="margin-top:100px;">${sections}</div>` + LIGHTBOX + FOOTER + CLOSE;
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
