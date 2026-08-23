import * as THREE from 'three'
import { gsap } from 'gsap'
import { camera, controls } from './camera.js'

/**
 * Camera flights for deep links and the auto-tour.
 */
const VIEW_DISTANCE = 9
const TOUR_STEP_MS = 6000

const centerPoint = new THREE.Vector3(0, 2, 0)
const toCenter = new THREE.Vector3()
const viewPosition = new THREE.Vector3()

export const flyToPanel = (position) => {
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)

    // Stand back from the panel, on the side facing the scene center
    toCenter.subVectors(centerPoint, position).setY(0).normalize()
    viewPosition.copy(position).addScaledVector(toCenter, VIEW_DISTANCE)
    viewPosition.y = Math.max(viewPosition.y, 4)

    gsap.to(camera.position, {
        x: viewPosition.x,
        y: viewPosition.y,
        z: viewPosition.z,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
    })
    gsap.to(controls.target, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
    })
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
