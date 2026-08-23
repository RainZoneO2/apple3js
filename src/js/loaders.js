import * as THREE from "three"

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        console.log('loaded')
    },
    // Progress
    () => {
        console.log('progress')
    }
)

export const textureLoader = new THREE.TextureLoader(loadingManager)
export const audioLoader = new THREE.AudioLoader()
