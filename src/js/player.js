import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { scene } from './scene.js'
import { world, objectsToUpdate } from './physics.js'
import { createAppleMesh } from './apples.js'
import { camera } from './camera.js'
import { gui } from './debug-gui.js'
import { CONFIG } from './config.js'

/**
 * The player IS an apple. WASD steers it around the island, SPACE hops like
 * a bunny. Movement eases the body's horizontal velocity; the physics
 * tumble handles the rolling look, and a squash-and-stretch overlay sells
 * the hops and landings.
 */
const settings = { ...CONFIG.player }

const PLAYER_RADIUS = settings.radius

const playerMesh = createAppleMesh(PLAYER_RADIUS)
scene.add(playerMesh)

// Group 2 so the ground-check ray can mask out the player's own collider
const playerBody = new CANNON.Body({
    mass: 2,
    shape: new CANNON.Sphere(PLAYER_RADIUS),
    position: new CANNON.Vec3(0, 2.5, 9),
    linearDamping: 0.35,
    angularDamping: 0.3,
})
playerBody.collisionFilterGroup = 2
// A sleeping body ignores velocity writes - input would silently stop working
// whenever the apple rested for a moment. Keep it awake forever.
playerBody.allowSleep = false
world.addBody(playerBody)
objectsToUpdate.push({ mesh: playerMesh, body: playerBody })

/**
 * Input
 */
const keys = { forward: false, back: false, left: false, right: false }
let hopQueuedAt = -Infinity

const setKey = (code, down) => {
    switch (code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.forward = down
            break
        case 'KeyS':
        case 'ArrowDown':
            keys.back = down
            break
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = down
            break
        case 'KeyD':
        case 'ArrowRight':
            keys.right = down
            break
    }
}

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!event.repeat) hopQueuedAt = performance.now()
        event.preventDefault()
        return
    }
    setKey(event.code, true)
})

window.addEventListener('keyup', (event) => {
    setKey(event.code, false)
})

/**
 * Grounded check: short downward ray that ignores group 2 (the player)
 */
const rayFrom = new CANNON.Vec3()
const rayTo = new CANNON.Vec3()
const rayResult = new CANNON.RaycastResult()

const isGrounded = () => {
    rayFrom.copy(playerBody.position)
    rayTo.set(
        playerBody.position.x,
        playerBody.position.y - (PLAYER_RADIUS + 0.3),
        playerBody.position.z,
    )
    rayResult.reset()
    world.raycastClosest(rayFrom, rayTo, { collisionFilterMask: ~2 }, rayResult)
    return rayResult.hasHit
}

/**
 * Per-frame update
 */
const HOP_BUFFER_MS = 140
const GROUND_BLEND = 12 // how fast horizontal velocity approaches the wish velocity
const AIR_BLEND = 3

const forwardAxis = new THREE.Vector3()
const rightAxis = new THREE.Vector3()
const wishDir = new THREE.Vector3()
const upVector = new THREE.Vector3(0, 1, 0)

export const updatePlayer = (deltaTime) => {
    // Camera-relative move axes (yaw only)
    camera.getWorldDirection(forwardAxis)
    forwardAxis.y = 0
    if (forwardAxis.lengthSq() < 1e-6) forwardAxis.set(0, 0, -1)
    forwardAxis.normalize()
    rightAxis.crossVectors(forwardAxis, upVector)

    wishDir.set(0, 0, 0)
    if (keys.forward) wishDir.add(forwardAxis)
    if (keys.back) wishDir.sub(forwardAxis)
    if (keys.right) wishDir.add(rightAxis)
    if (keys.left) wishDir.sub(rightAxis)
    if (wishDir.lengthSq() > 0) wishDir.normalize().multiplyScalar(settings.moveSpeed)

    const grounded = isGrounded()
    const velocity = playerBody.velocity

    // Ease current horizontal velocity toward the wish velocity
    const blend = Math.min(1, deltaTime * (grounded ? GROUND_BLEND : AIR_BLEND))
    velocity.x += (wishDir.x - velocity.x) * blend
    velocity.z += (wishDir.z - velocity.z) * blend

    // Hop with a small input buffer so presses just before landing still count
    if (performance.now() - hopQueuedAt < HOP_BUFFER_MS && grounded) {
        velocity.y = settings.hopSpeed
        hopQueuedAt = -Infinity
    }

    // Safety net: nothing should get past the island rim, but just in case
    if (playerBody.position.y < -25) teleportPlayer(0, 9)
}

export const getPlayerPosition = (() => {
    const position = new THREE.Vector3()
    return () => position.copy(playerBody.position)
})()

export const teleportPlayer = (x, z, y = 2.5) => {
    playerBody.position.set(x, y, z)
    playerBody.velocity.set(0, 0, 0)
    playerBody.angularVelocity.set(0, 0, 0)
    playerBody.wakeUp()
}

if (gui) {
    const folder = gui.addFolder('Player')
    folder.add(settings, 'moveSpeed', 2, 14, 0.5)
    folder.add(settings, 'hopSpeed', 3, 12, 0.25)
    folder.close()
}
