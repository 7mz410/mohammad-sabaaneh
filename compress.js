import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, 'public', 'assets');
const DIRS_TO_PROCESS = ['Bio', 'Books', 'Cartoon', 'Mural ', 'prints'];

async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function processImages() {
    await ensureDir(OUTPUT_DIR);
    
    for (const dirName of DIRS_TO_PROCESS) {
        const sourcePath = path.join(ROOT_DIR, dirName);
        const outDirPath = path.join(OUTPUT_DIR, dirName.trim());
        await ensureDir(outDirPath);

        try {
            const items = await fs.readdir(sourcePath, { withFileTypes: true });
            
            for (const item of items) {
                if (item.isDirectory()) {
                    // process 1 level deep for Cartoon folder which has years
                    const subDir = path.join(sourcePath, item.name);
                    const subFiles = await fs.readdir(subDir, { withFileTypes: true });
                    const subOutDirPath = path.join(outDirPath, item.name);
                    await ensureDir(subOutDirPath);

                    for (const subFile of subFiles) {
                        if (subFile.isFile() && subFile.name.match(/\.(png|jpg|jpeg|cr2)$/i)) {
                            await compressImage(path.join(subDir, subFile.name), path.join(subOutDirPath, `${path.parse(subFile.name).name}.webp`));
                        }
                    }
                } else if (item.isFile() && item.name.match(/\.(png|jpg|jpeg|cr2)$/i)) {
                    await compressImage(path.join(sourcePath, item.name), path.join(outDirPath, `${path.parse(item.name).name}.webp`));
                }
            }
        } catch (err) {
            console.error(`Error processing directory ${dirName}:`, err);
        }
    }
}

async function compressImage(inputPath, outputPath) {
    console.log(`Compressing ${inputPath} to ${outputPath}...`);
    try {
        // sharp doesn't fully support RAW (.cr2) out of the box without libraw, 
        // but we'll try or use fallback. Since we have sips on mac, if sharp fails, we might need sips.
        await sharp(inputPath)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath);
        console.log(`Successfully compressed to ${outputPath}`);
    } catch (err) {
        console.error(`Error compressing ${inputPath}:`, err);
    }
}

processImages().then(() => console.log('Done'));
