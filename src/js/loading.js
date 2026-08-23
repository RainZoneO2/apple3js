/**
 * Shared asset-loading progress. Modules register how many assets they will
 * load and mark them as they settle; UI subscribes for progress updates.
 */
let loadedCount = 0
let totalCount = 0
const listeners = new Set()

const notify = () => {
    const progress = { loaded: loadedCount, total: totalCount }
    listeners.forEach(listener => listener(progress))
}

export const registerAssets = (count) => {
    totalCount += count
    notify()
}

export const markAssetLoaded = () => {
    loadedCount++
    notify()
}

export const onLoadProgress = (listener) => {
    listeners.add(listener)
    listener({ loaded: loadedCount, total: totalCount })
}

export const isLoadComplete = () => totalCount > 0 && loadedCount >= totalCount
