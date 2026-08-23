import * as THREE from 'three'
import { setCameraYaw } from './camera.js'
import { teleportPlayer } from './player.js'

/**
 * Deep links and the auto-tour: move the apple next to a panel and aim the
 * follow camera so it frames apple + panel from the center-facing side.
 */
const STANDOFF = 5
const TOUR_STEP_MS = 6000

const centerPoint = new THREE.Vector3(0, 2, 0)
const toCenter = new THREE.Vector3()
const standPoint = new THREE.Vector3()

export const flyToPanel = (position) => {
    toCenter.subVectors(centerPoint, position).setY(0).normalize()
    standPoint.copy(position).addScaledVector(toCenter, STANDOFF)

    teleportPlayer(standPoint.x, standPoint.z)
    // Rig offset points away from the panel so both stay in frame
    setCameraYaw(Math.atan2(standPoint.x - position.x, standPoint.z - position.z))
}

/**
 * Auto-tour: glide between memories in a loop until stopped.
 */
let tourTimer = null
let tourIndex = 0

const stepTour = (count, visitPanel) => {
    if (count === 0) return
    tourIndex = tourIndex % count
    flyToPanel(visitPanel.position(tourIndex))
    visitPanel.show(tourIndex)
    tourIndex++
}

export const startTour = (count, position, show) => {
    if (tourTimer) return
    const visitPanel = { position, show }
    stepTour(count, visitPanel)
    tourTimer = setInterval(() => stepTour(count, visitPanel), TOUR_STEP_MS)
}

export const stopTour = () => {
    if (!tourTimer) return
    clearInterval(tourTimer)
    tourTimer = null
}

export const isTourActive = () => tourTimer !== null
