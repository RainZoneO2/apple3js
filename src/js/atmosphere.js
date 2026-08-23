import * as THREE from 'three'
import { scene } from './scene.js'

/**
 * Floating dust motes drifting through the gallery air
 */
const PARTICLE_COUNT = 300
const AREA = { x: 80, y: 16, z: 80 }

const positions = new Float32Array(PARTICLE_COUNT * 3)
for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * AREA.x
    positions[i * 3 + 1] = Math.random() * AREA.y + 0.5
    positions[i * 3 + 2] = (Math.random() - 0.5) * AREA.z
}

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const material = new THREE.PointsMaterial({
    size: 0.12,
    color: '#ffd9a0',
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
})

const particles = new THREE.Points(geometry, material)
scene.add(particles)

export const updateAtmosphere = (elapsedTime) => {
    particles.rotation.y = elapsedTime * 0.01
    particles.position.y = Math.sin(elapsedTime * 0.35) * 0.25
}
