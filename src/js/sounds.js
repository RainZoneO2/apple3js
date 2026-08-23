import { audioLoader } from "./loaders.js"
import * as THREE from "three"

const audioListener = new THREE.AudioListener()

export const audioSource = new THREE.Audio( audioListener )

// Browsers block audio until the user interacts with the page, so playback is
// deferred until the start screen button is clicked.
let startRequested = false

const tryPlayAudio = () => {
    if (!startRequested || !audioSource.buffer) return
    if (audioListener.context.state === 'suspended') audioListener.context.resume()
    audioSource.play()
}

audioLoader.load('/sounds/the_love_cycle.mp3', function(buffer) {
    audioSource.setBuffer(buffer)
    audioSource.setLoop(true)
    audioSource.setVolume(0.5)
    tryPlayAudio()
})

export const requestAudioStart = () => {
    startRequested = true
    tryPlayAudio()
}

export const attachAudioListener = (camera) => {
    camera.add( audioListener )
}
