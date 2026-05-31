import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
    { title: 'Cartoons', file: 'cartoons.html', baseDir: 'Cartoon' },
    { title: 'Murals', file: 'murals.html', baseDir: 'Mural' },
    { title: 'Books', file: 'books.html', baseDir: 'Books' },
    { title: 'Prints', file: 'prints.html', baseDir: 'prints' }
];

const template = (title, sectionsHtml) => `<!DOCTYPE html>
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

    <div style="margin-top: 100px;">
        ${sectionsHtml}
    </div>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Mohammad Sabaaneh. All rights reserved. Powered by el7mz.com</p>
        </div>
    </footer>
    <script type="module" src="./main.js"></script>
</body>
</html>`;

async function getDirectories(source) {
    try {
        const items = await fs.readdir(source, { withFileTypes: true });
        return items.filter(item => item.isDirectory()).map(item => item.name);
    } catch {
        return [];
    }
}

async function generate() {
    for (const page of pages) {
        let sectionsHtml = '';
        const basePath = path.join(__dirname, 'public', 'assets', page.baseDir.trim());
        const subDirs = await getDirectories(basePath);

        // Sort directories alphabetically (or numerically for years)
        subDirs.sort();

        // Also check if there are files directly in the baseDir (e.g. prints/)
        try {
            const files = await fs.readdir(basePath, { withFileTypes: true });
            const directFiles = files.filter(f => f.isFile() && f.name.endsWith('.webp'));
            if (directFiles.length > 0) {
                let imagesHtml = '';
                for (const file of directFiles) {
                    imagesHtml += `<img src="./public/assets/${page.baseDir.trim()}/${file.name}" alt="${page.title} image" class="animate-up" loading="lazy">\n                `;
                }
                sectionsHtml += `
    <section class="gallery section">
        <div class="container">
            <h2 class="section-title text-center" style="font-size: 2rem;">Others</h2>
            <div class="gallery-grid">
                ${imagesHtml}
            </div>
        </div>
    </section>`;
            }
        } catch (e) {
            console.error(e);
        }

        for (const dir of subDirs) {
            let imagesHtml = '';
            const fullPath = path.join(basePath, dir);
            try {
                const files = await fs.readdir(fullPath);
                // only webp
                const webpFiles = files.filter(f => f.endsWith('.webp'));
                if (webpFiles.length === 0) continue;

                for (const file of webpFiles) {
                    imagesHtml += `<img src="./public/assets/${page.baseDir.trim()}/${dir}/${file}" alt="${dir} image" class="animate-up" loading="lazy">\n                `;
                }
                sectionsHtml += `
    <section class="gallery section">
        <div class="container">
            <h2 class="section-title text-center" style="font-size: 2rem;">${dir}</h2>
            <div class="gallery-grid">
                ${imagesHtml}
            </div>
        </div>
    </section>`;
            } catch (err) {
                console.error(`Error reading ${fullPath}:`, err.message);
            }
        }

        await fs.writeFile(path.join(__dirname, page.file), template(page.title, sectionsHtml));
        console.log(`Generated ${page.file}`);
    }
}

generate();
