const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

// Directory containing images
const inputDir = path.join(__dirname, 'static/memories/textures/to-process')
const outputDir = path.join(__dirname, 'static/memories/textures')

// Directory to move processed files to
const processedDir = path.join(__dirname, 'static/memories/textures/processed')

// Make sure processed directory exists
async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true })
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err
        }
    }
}

// Flag passed to script
const conversionType = process.argv[2]

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

// Converts and crops, resizes images
async function processImages() {

    await ensureDir(processedDir)

    // Check that flag passed to script is valid
    if (conversionType !== 'avif' && conversionType !== 'webp') {
        return 'ERROR: Please enter \'avif\' or \'webp\'' 
    }

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

            // Load the image to get dimensions
            const image = sharp(filePath)
            const metadata = await image.metadata()

            // Determine whether to crop or resize
            let transform = image

            if (metadata.width > 1000 && metadata.height > 1000 && metadata.width !== metadata.height) {
                const cropOptions = {
                    left: Math.floor((metadata.width - 1000) / 2),
                    top: Math.floor((metadata.height - 1000) / 2),
                    width: 1000,
                    height: 1000,
                }
                transform = transform.extract(cropOptions)
            } else {
                // Resize image to fit within 1000x1000
                transform = transform.resize(1000, 1000, { fit: 'cover' })
            }


            let outputPath = ''

            // Set properties based on flag passed
            if (conversionType === 'avif') {
                outputPath = path.join(`${outputDir}/avif`, `${fileName}.avif`)
                transform = transform.avif({ quality: 80 })
            } else {
                outputPath = path.join(`${outputDir}/webp`, `${fileName}.webp`)
                transform = transform.webp({ quality: 80 })
            }

            await transform
                .toFile(outputPath)
                .catch(err => console.error(`Error converting ${file}:`, err))

            // Get file size
            const fileStats = await fs.stat(outputPath)
            const fileSize = fileStats.size

            console.log(`Converted ${file} | ${formatFileSize(originalFileSize)} => ${formatFileSize(fileSize)} (Reduced by ${(100 - (fileSize / originalFileSize * 100)).toFixed(2)}%)`)
        
            // Move original file to processedDir
            const processedFilePath = path.join(processedDir, file)
            await fs.rename(filePath, processedFilePath)
                .catch(err => console.error(`Error moving ${file}:`, err))

            console.log(`Moved original ${file} to procesed directory.`)
        }
    }
}

processImages().catch(err => console.error('Error during conversion:', err))