const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

// Directory containing images
const inputDir = path.join(__dirname, 'static/memories/textures/to-process')
const outputDir = path.join(__dirname, 'static/memories/textures')

// Directory to move processed files to
const processedDir = path.join(__dirname, 'static/memories/textures/processed')

// Flag passed to script
const conversionType = process.argv[2]

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

// Crop or resize a single image, write it out, and move the original away.
// Throws on failure so the caller can decide how to continue.
async function processFile(file, typeOutputDir) {
    const filePath = path.join(inputDir, file)

    // Only PNG/JPG inputs are handled
    if (!/\.(png|jpg|jpeg)$/i.test(file)) return

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

    const outputPath = path.join(typeOutputDir, `${fileName}.${conversionType}`)

    // Set properties based on flag passed
    if (conversionType === 'avif') {
        transform = transform.avif({ quality: 80 })
    } else {
        transform = transform.webp({ quality: 80 })
    }

    await transform.toFile(outputPath)

    const fileStats = await fs.stat(outputPath)
    const fileSize = fileStats.size

    console.log(
        `Converted ${file} | ${formatFileSize(originalFileSize)} => ${formatFileSize(fileSize)} (Reduced by ${(100 - (fileSize / originalFileSize) * 100).toFixed(2)}%)`,
    )

    // Move original file to processedDir
    const processedFilePath = path.join(processedDir, file)
    await fs.rename(filePath, processedFilePath)

    console.log(`Moved original ${file} to processed directory.`)
}

async function processImages() {
    // Check that flag passed to script is valid before touching the filesystem
    if (conversionType !== 'avif' && conversionType !== 'webp') {
        console.error("ERROR: Please enter 'avif' or 'webp'")
        process.exitCode = 1
        return
    }

    await ensureDir(processedDir)

    // Make sure the output folder for this format exists (fresh clones may not have it)
    const typeOutputDir = path.join(outputDir, conversionType)
    await ensureDir(typeOutputDir)

    let files

    try {
        files = await fs.readdir(inputDir)
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Nothing to process: input directory does not exist.')
            return
        }
        throw error
    }

    // One failed image should not abort the remaining queue
    for (const file of files) {
        try {
            await processFile(file, typeOutputDir)
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message || error)
            process.exitCode = 1
        }
    }
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true })
}

processImages().catch((err) => {
    console.error('Error during conversion:', err)
    process.exitCode = 1
})
