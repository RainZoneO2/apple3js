import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { scene } from './scene.js'
import { camera } from './camera.js'
import { world, objectsToUpdate } from './physics.js'
import { gui } from './debug-gui.js'

/**
 * Throwable apples: press F / Space to toss one along the camera's view.
 * Oldest apples are recycled once the cap is reached.
 */
const MAX_APPLES = 25
const THROW_SPEED = 9

// Procedural low-poly apple (the GLB models were removed during cleanup)
const appleGeometry = new THREE.SphereGeometry(0.35, 16, 12)
appleGeometry.scale(1, 0.88, 1)
const stemGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.22, 6)

const appleMaterial = new THREE.MeshStandardMaterial({ color: '#c0392b', roughness: 0.5 })
const stemMaterial = new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9 })

const apples = []
const throwDirection = new THREE.Vector3()

const createAppleMesh = () => {
    const group = new THREE.Group()
    const body = new THREE.Mesh(appleGeometry, appleMaterial)
    body.castShadow = true
    const stem = new THREE.Mesh(stemGeometry, stemMaterial)
    stem.position.y = 0.33
    stem.rotation.z = 0.15
    group.add(body, stem)
    return group
}

export const throwApple = () => {
    const mesh = createAppleMesh()
    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(0.34),
        angularDamping: 0.1,
    })

    // Spawn a little in front of the camera and toss along the view direction
    camera.getWorldDirection(throwDirection)
    const spawn = camera.position.clone().addScaledVector(throwDirection, 1.8)

    mesh.position.copy(spawn)
    body.position.set(spawn.x, spawn.y, spawn.z)
    body.velocity.set(
        throwDirection.x * THROW_SPEED,
        throwDirection.y * THROW_SPEED + 2.5,
        throwDirection.z * THROW_SPEED
    )
    body.angularVelocity.set(
        Math.random() * 4 - 2,
        Math.random() * 4 - 2,
        Math.random() * 4 - 2
    )

    scene.add(mesh)
    world.addBody(body)
    objectsToUpdate.push({ mesh, body })
    apples.push({ mesh, body })

    while (apples.length > MAX_APPLES) recycleOldest()
}

const recycleOldest = () => {
    const oldest = apples.shift()
    scene.remove(oldest.mesh)
    world.removeBody(oldest.body)
    const index = objectsToUpdate.findIndex((entry) => entry.body === oldest.body)
    if (index !== -1) objectsToUpdate.splice(index, 1)
}

if (gui) {
    const appleFolder = gui.addFolder('Apples')
    appleFolder.add({ throw: throwApple }, 'throw')
    appleFolder.close()
}
