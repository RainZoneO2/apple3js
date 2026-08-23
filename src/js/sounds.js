import { audioLoader } from './loaders.js'
import * as THREE from 'three'
import { registerAssets, markAssetLoaded } from './loading.js'
import { CONFIG } from './config.js'

const audioListener = new THREE.AudioListener()

export const audioSource = new THREE.Audio(audioListener)

const BASE_VOLUME = CONFIG.audio.volume
let muted = false

// Browsers block audio until the user interacts with the page, so playback is
// deferred until the start screen button is clicked.
let startRequested = false

// Tracks cycle in order; buffers are cached after first load
const TRACKS = ['/sounds/the_love_cycle.mp3', '/sounds/the_love_cycle_guitar.mp3']
let currentTrackIndex = 0
const bufferCache = new Map()

const tryPlayAudio = () => {
    if (!startRequested || !audioSource.buffer) return
    if (audioListener.context.state === 'suspended') audioListener.context.resume()
    audioSource.play()
}

registerAssets(1)
audioLoader.load(
    TRACKS[0],
    function (buffer) {
        audioSource.setBuffer(buffer)
        audioSource.setLoop(true)
        audioSource.setVolume(BASE_VOLUME)
        bufferCache.set(TRACKS[0], buffer)
        markAssetLoaded()
        tryPlayAudio()
    },
    undefined,
    function (error) {
        console.error('Failed to load music:', error)
        markAssetLoaded()
    }
)

export const requestAudioStart = () => {
    startRequested = true
    tryPlayAudio()
}

export const attachAudioListener = (camera) => {
    camera.add(audioListener)
}

export const toggleMute = () => {
    muted = !muted
    audioSource.setVolume(muted ? 0 : BASE_VOLUME)
    return muted
}

const applyTrack = (buffer) => {
    const wasPlaying = audioSource.isPlaying
    if (wasPlaying) audioSource.stop()
    audioSource.setBuffer(buffer)
    if (wasPlaying && startRequested) audioSource.play()
}

export const nextTrack = async () => {
    currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length
    const url = TRACKS[currentTrackIndex]

    if (bufferCache.has(url)) {
        applyTrack(bufferCache.get(url))
        return
    }

    try {
        const buffer = await audioLoader.loadAsync(url)
        bufferCache.set(url, buffer)
        applyTrack(buffer)
    } catch (error) {
        console.error(`Failed to load track ${url}:`, error)
    }
}
