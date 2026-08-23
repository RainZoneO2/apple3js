import * as THREE from "three"
import { gsap } from 'gsap'

// Shared scene instance used across all modules
const scene = new THREE.Scene()

// Fullscreen black quad shown while assets load; faded out via uAlpha
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main() 
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,

})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
overlay.renderOrder = 2
scene.add(overlay)

const revealScene = () => {
    gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
}

export { scene, overlay, overlayMaterial, revealScene }
