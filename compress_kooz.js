import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, '..', 'prints', 'Kooz');
const outputDir = path.resolve(__dirname, 'public', 'assets', 'prints', 'Kooz');

async function processKooz() {
    await fs.mkdir(outputDir, { recursive: true });
    const items = await fs.readdir(inputDir, { withFileTypes: true });
    for (const item of items) {
        if (item.isFile() && item.name.match(/\.(tif|tiff)$/i)) {
            const inputPath = path.join(inputDir, item.name);
            const outputPath = path.join(outputDir, `${path.parse(item.name).name}.webp`);
            console.log(`Compressing ${item.name}...`);
            await sharp(inputPath)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
        }
    }
}
processKooz();
