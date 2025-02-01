const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(process.cwd(), 'public/assets/letters');
const tempDir = path.join(process.cwd(), 'public/assets/letters/temp');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

async function resizeImages() {
    try {
        const files = fs.readdirSync(inputDir);

        for (const file of files) {
            if (file.toLowerCase().endsWith('.png')) {
                const inputPath = path.join(inputDir, file);
                const tempPath = path.join(tempDir, file);

                await sharp(inputPath)
                    .resize(256, 256)
                    .toFile(tempPath);

                // Replace original with resized version
                fs.unlinkSync(inputPath);
                fs.renameSync(tempPath, inputPath);

                console.log(`Resized ${file}`);
            }
        }

        // Clean up temp directory
        fs.rmdirSync(tempDir);

        console.log('All images have been resized!');
    } catch (error) {
        console.error('Error resizing images:', error);
    }
}

resizeImages();