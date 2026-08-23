import * as THREE from 'three'
import { scene } from './scene.js'
import { CONFIG } from './config.js'

/**
 * The orchard: low-poly apple trees ringing the memory grove, instanced
 * grass tufts, and fireflies hugging the ground. Purely decorative - no
 * colliders, so hopping under a canopy never blocks the player.
 */
const state = { ...CONFIG.orchard }

// Seeded RNG so the layout is identical on every visit
const mulberry32 = (seed) => () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const rng = mulberry32(20260823)

/**
 * Trees
 */
const trunkGeometry = new THREE.CylinderGeometry(0.16, 0.3, 2.4, 7)
trunkGeometry.translate(0, 1.2, 0)
const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#4a3122', roughness: 1 })

const canopyGeometry = new THREE.IcosahedronGeometry(1, 1)
const canopyMaterial = new THREE.MeshStandardMaterial({
    color: '#274a33',
    roughness: 0.95,
    flatShading: true,
})

const fruitGeometry = new THREE.SphereGeometry(0.16, 10, 8)
const fruitMaterial = new THREE.MeshStandardMaterial({
    color: '#c0392b',
    emissive: '#a83226',
    emissiveIntensity: 0.55,
    roughness: 0.6,
})

// Toggled by the graphics-quality setting (trees only cast shadows on High)
const shadowMeshes = []

export const setOrchardShadows = (enabled) => {
    shadowMeshes.forEach((mesh) => {
        mesh.castShadow = enabled
    })
}

const createTree = () => {
    const tree = new THREE.Group()

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.castShadow = true
    shadowMeshes.push(trunk)
    tree.add(trunk)

    const canopy = new THREE.Group()
    for (let i = 0; i < 3; i++) {
        const blob = new THREE.Mesh(canopyGeometry, canopyMaterial)
        blob.position.set((rng() - 0.5) * 1.4, 2.5 + rng() * 1.1, (rng() - 0.5) * 1.4)
        blob.scale.setScalar(1.1 + rng() * 0.7)
        blob.castShadow = true
        shadowMeshes.push(blob)
        canopy.add(blob)
    }

    const fruitCount = 4 + Math.floor(rng() * 3)
    for (let i = 0; i < fruitCount; i++) {
        const fruit = new THREE.Mesh(fruitGeometry, fruitMaterial)
        const angle = rng() * Math.PI * 2
        fruit.position.set(
            Math.sin(angle) * (1.2 + rng() * 0.5),
            2.4 + rng() * 1.4,
            Math.cos(angle) * (1.2 + rng() * 0.5),
        )
        canopy.add(fruit)
    }

    tree.add(canopy)
    tree.scale.setScalar(1.6 + rng() * 1.4)
    return tree
}

{
    const placed = []
    let attempts = 0

    while (placed.length < state.treeCount && attempts < state.treeCount * 12) {
        attempts++
        const angle = rng() * Math.PI * 2
        const radius = state.treeRadiusMin + rng() * (state.treeRadiusMax - state.treeRadiusMin)
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        // Keep canopies from overlapping each other
        if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < 7)) continue

        const tree = createTree()
        tree.position.set(x, 0, z)
        tree.rotation.y = rng() * Math.PI * 2
        scene.add(tree)
        placed.push({ x, z })
    }
}

/**
 * Grass: one instanced mesh of scattered blades across the island
 */
{
    const GRASS_COUNT = 700
    const bladeGeometry = new THREE.ConeGeometry(0.05, 0.55, 4)
    bladeGeometry.translate(0, 0.27, 0)
    const grassMaterial = new THREE.MeshStandardMaterial({ color: '#31503a', roughness: 1 })

    const grass = new THREE.InstancedMesh(bladeGeometry, grassMaterial, GRASS_COUNT)
    const matrix = new THREE.Matrix4()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const scaleVector = new THREE.Vector3()

    for (let i = 0; i < GRASS_COUNT; i++) {
        const angle = rng() * Math.PI * 2
        // Uniform disc sampling; thin out inside the greeting-text circle
        const radius = Math.sqrt(rng()) * 38
        if (radius < 9 && rng() < 0.75) {
            matrix.makeScale(0, 0, 0) // hide the blade under the floor
        } else {
            euler.set((rng() - 0.5) * 0.35, rng() * Math.PI * 2, (rng() - 0.5) * 0.35)
            quaternion.setFromEuler(euler)
            scaleVector.setScalar(0.7 + rng() * 1.3)
            matrix.compose(
                new THREE.Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius),
                quaternion,
                scaleVector,
            )
        }
        grass.setMatrixAt(i, matrix)
    }
    grass.instanceMatrix.needsUpdate = true
    scene.add(grass)
}

/**
 * Fireflies: warm drifting points that hug the meadow
 */
const FIREFLY_COUNT = 90
const fireflyBase = []
let fireflyGeometry

{
    fireflyGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(FIREFLY_COUNT * 3)

    for (let i = 0; i < FIREFLY_COUNT; i++) {
        const angle = rng() * Math.PI * 2
        const radius = 5 + Math.sqrt(rng()) * 31
        const base = {
            x: Math.sin(angle) * radius,
            y: 0.6 + rng() * 3.2,
            z: Math.cos(angle) * radius,
            phase: rng() * Math.PI * 2,
            drift: 0.15 + rng() * 0.35,
        }
        fireflyBase.push(base)
        positions[i * 3] = base.x
        positions[i * 3 + 1] = base.y
        positions[i * 3 + 2] = base.z
    }

    fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const fireflyMaterial = new THREE.PointsMaterial({
        color: '#ffc078',
        size: 0.22,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    })

    scene.add(new THREE.Points(fireflyGeometry, fireflyMaterial))
}

export const updateOrchard = (elapsedTime) => {
    const positions = fireflyGeometry.attributes.position

    for (let i = 0; i < FIREFLY_COUNT; i++) {
        const base = fireflyBase[i]
        positions.setX(i, base.x + Math.sin(elapsedTime * base.drift + base.phase) * 0.8)
        positions.setY(i, base.y + Math.sin(elapsedTime * 0.9 + base.phase * 2) * 0.45)
        positions.setZ(i, base.z + Math.cos(elapsedTime * base.drift * 0.8 + base.phase) * 0.8)
    }
    positions.needsUpdate = true
}
