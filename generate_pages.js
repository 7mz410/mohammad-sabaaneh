import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
    { title: 'Cartoons', file: 'cartoons.html', sourceDirs: ['Cartoon/2024'] },
    { title: 'Murals', file: 'murals.html', sourceDirs: ['Mural/Yasser Arafat '] },
    { title: 'Books', file: 'books.html', sourceDirs: ['Books/30 second from Gaza'] },
    { title: 'Prints', file: 'prints.html', sourceDirs: ['prints/Kooz', 'prints/Big prints'] }
];

const template = (title, imagesHtml) => `<!DOCTYPE html>
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
<body>
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
    </header>

    <section class="gallery section" style="margin-top: 100px;">
        <div class="container">
            <h2 class="section-title text-center">${title.toUpperCase()}</h2>
            <div class="gallery-grid">
                ${imagesHtml}
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Mohammad Sabaaneh. All rights reserved. Powered by el7mz.com</p>
        </div>
    </footer>
    <script type="module" src="./main.js"></script>
</body>
</html>`;

async function generate() {
    for (const page of pages) {
        let imagesHtml = '';
        for (const dir of page.sourceDirs) {
            const fullPath = path.join(__dirname, 'public', 'assets', dir);
            try {
                const files = await fs.readdir(fullPath);
                for (const file of files) {
                    if (file.endsWith('.webp')) {
                        imagesHtml += `<img src="./public/assets/${dir}/${file}" alt="${page.title} image" class="animate-up">\n                `;
                    }
                }
            } catch (err) {
                console.error(`Error reading ${fullPath}:`, err.message);
            }
        }
        await fs.writeFile(path.join(__dirname, page.file), template(page.title, imagesHtml));
        console.log(`Generated ${page.file}`);
    }
}

generate();
