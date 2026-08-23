import * as THREE from "three"

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager()

export const textureLoader = new THREE.TextureLoader(loadingManager)
export const audioLoader = new THREE.AudioLoader()
