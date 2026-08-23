const fs = require('fs')
const path = require('path')

const staticDir = path.join(__dirname, 'static')
const manifestFile = path.join(staticDir, 'manifest.json')

// The manifest only lists gallery textures; every other asset is referenced directly
const manifestSourceDirs = ['memories/textures/avif', 'memories/textures/webp']

// Recursive function to get all image files
function getImageFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir)
    files.forEach((file) => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            // Recursively scan subdirectories
            getImageFiles(filePath, fileList)
        } else if (/\.(jpg|jpeg|png|avif|webp)$/.test(file)) {
            // Collect paths relative to staticDir (URL-friendly forward slashes)
            fileList.push(path.relative(staticDir, filePath).replace(/\\/g, '/'))
        }
    })
    return fileList
}

try {
    const imageFiles = manifestSourceDirs.flatMap((sourceDir) => {
        const absoluteDir = path.join(staticDir, sourceDir)
        return fs.existsSync(absoluteDir) ? getImageFiles(absoluteDir) : []
    })

    fs.writeFileSync(manifestFile, JSON.stringify(imageFiles, null, 2), 'utf-8')
    console.log(`Manifest file created: ${manifestFile} (${imageFiles.length} entries)`)
} catch (error) {
    console.error('Error generating manifest', error)
    process.exitCode = 1
}
