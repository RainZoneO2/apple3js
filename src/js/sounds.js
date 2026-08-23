import { audioLoader } from './loaders.js'
import * as THREE from 'three'
import { registerAssets, markAssetLoaded } from './loading.js'
import { CONFIG } from './config.js'

const audioListener = new THREE.AudioListener()

export const attachAudioListener = (camera) => {
    camera.add(audioListener)
}

/**
 * Dual-source instrument crossfade.
 *
 * Both arrangements are 1:42 and identical in length. They are played by two
 * sources started in the same tick, so they loop in perfect lockstep forever.
 * The guitar source sits silent until a memory card opens, then a gain ramp
 * swaps the audible arrangement mid-song - same timeline, different
 * instruments. Closing the card swaps back.
 */
const MAIN_TRACK = '/sounds/the_love_cycle.mp3'
const GUITAR_TRACK = '/sounds/the_love_cycle_guitar.mp3'

const FADE_SECONDS = 1.5
const MUTE_FADE_SECONDS = 0.2

registerAssets(2)

const mainAudio = new THREE.Audio(audioListener)
const guitarAudio = new THREE.Audio(audioListener)

// Master volume, driven by the settings slider (CONFIG holds the default)
let masterVolume = THREE.MathUtils.clamp(CONFIG.audio.volume, 0, 1)

// Mix roles: how much of each arrangement is audible (0..1)
let mainLevel = 1
let guitarLevel = 0
let startRequested = false
let playbackStarted = false
let muted = false

const buffers = {}

const onBuffer = (key) => (buffer) => {
    buffers[key] = buffer
    markAssetLoaded()
    tryStartPlayback()
}

const onError = (key) => (error) => {
    console.error(`Failed to load ${key} track:`, error)
    markAssetLoaded()
}

audioLoader.load(MAIN_TRACK, onBuffer('main'), undefined, onError('main'))
audioLoader.load(GUITAR_TRACK, onBuffer('guitar'), undefined, onError('guitar'))

const volumeFor = (trackLevel) => (muted ? 0 : masterVolume * trackLevel)

const rampGain = (audio, target, seconds) => {
    const now = audioListener.context.currentTime
    const param = audio.gain.gain
    param.cancelScheduledValues(now)
    param.setValueAtTime(param.value, now)
    param.linearRampToValueAtTime(target, now + seconds)
}

const refreshMix = (seconds = FADE_SECONDS) => {
    rampGain(mainAudio, volumeFor(mainLevel), seconds)
    rampGain(guitarAudio, volumeFor(guitarLevel), seconds)
}

const tryStartPlayback = () => {
    if (!startRequested || playbackStarted || !buffers.main || !buffers.guitar) return

    if (audioListener.context.state === 'suspended') audioListener.context.resume()

    mainAudio.setBuffer(buffers.main)
    guitarAudio.setBuffer(buffers.guitar)

    // Identical lengths mean both sources loop at the same instant forever,
    // preserving the lockstep the crossfade relies on.
    mainAudio.setLoop(true)
    guitarAudio.setLoop(true)

    // THREE.Audio gains start at 0; set the initial mix directly so both
    // sources can be launched in the same tick and stay in lockstep.
    mainAudio.setVolume(volumeFor(mainLevel))
    guitarAudio.setVolume(volumeFor(guitarLevel))
    mainAudio.play()
    guitarAudio.play()

    playbackStarted = true
}

export const requestAudioStart = () => {
    startRequested = true
    tryStartPlayback()
}

// Called when a memory card opens/closes
export const setMemoryDucked = (ducked) => {
    const nextMainLevel = ducked ? 0 : 1
    if (mainLevel === nextMainLevel) return

    mainLevel = nextMainLevel
    // The guitar sits a touch under the base mix so opening a card feels
    // like a softer arrangement rather than a louder one.
    guitarLevel = ducked ? CONFIG.audio.guitarDuckLevel : 0

    if (playbackStarted) refreshMix(FADE_SECONDS)
}

export const setVolume = (value) => {
    masterVolume = THREE.MathUtils.clamp(value, 0, 1)
    if (playbackStarted) refreshMix(0.12)
}

export const toggleMute = () => {
    muted = !muted
    if (playbackStarted) refreshMix(MUTE_FADE_SECONDS)
    return muted
}
