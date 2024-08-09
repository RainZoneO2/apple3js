const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

// Directory containing images
const inputDir = path.join(__dirname, 'static/memories/textures/to-process')
const outputDir = path.join(__dirname, 'static/memories/textures')

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

// Converts and crops, resizes images
async function processImages() {
    // Read files in input directory
    const files = await fs.readdir(inputDir)

    for (const file of files) {
        const filePath = path.join(inputDir, file)

        // Check if file is a PNG or JPG
        if (/\.(png|jpg|jpeg)$/i.test(file)) {
            // Get file name without the extension
            const fileName = path.parse(file).name

            // Get original file size
            const originalStats = await fs.stat(filePath)
            const originalFileSize = originalStats.size

            // Convert to AVIF and resize to 1000x1000
            const avifOutputPath = path.join(`${outputDir}/avif`, `${fileName}.avif`)
            await sharp(filePath)
                .resize(1000, 1000, { fit: 'contain' })
                .avif({ quality: 80 })
                .toFile(avifOutputPath)
                .catch(err => console.error(`Error converting ${file} to AVIF:`, err))

            // Get AVIF file size
            const avifStats = await fs.stat(avifOutputPath)
            const avifFileSize = avifStats.size

            console.log(`${file} to AVIF | ${formatFileSize(originalFileSize)} => ${formatFileSize(avifFileSize)} (Reduced by ${(100 - (avifFileSize / originalFileSize * 100)).toFixed(2)}%)`)
        }
    }
}

processImages().catch(err => console.error('Error during conversion:', err))