const fs = require('fs')
const path = require('path')

const staticDir = path.join(__dirname, 'static')
const manifestFile = path.join(staticDir, 'manifest.json')

// Recursive function to get all image files
function getImageFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            // Recursively scan subdirectories
            getImageFiles(filePath, fileList)
        } else if (/\.(jpg|jpeg|png|avif|webp)$/.test(file)) {
            // Collect image files
            fileList.push(path.relative(staticDir, filePath).replace(/\\/g, '/')) // Store relative paths
        }
    })
    return fileList
}

try {
    const imageFiles = getImageFiles(staticDir)
    fs.writeFileSync(manifestFile, JSON.stringify(imageFiles, null, 2), 'utf-8')
    console.log('Manifest file created:', manifestFile)
} catch (error) {
    console.error('Error generating manifest', error)
}
