import * as THREE from 'three'
import { scene } from './scene.js'
import { gui } from './debug-gui.js'
import { CONFIG } from './config.js'

/**
 * Procedural night sky: a shader dome with an FBM nebula, a tilted
 * milky-way band, and layers of twinkling hash-based stars.
 */
const state = { ...CONFIG.galaxy }

const vertexShader = /* glsl */ `
varying vec3 vDir;

void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uNebulaStrength;
uniform float uStarIntensity;
uniform float uBandStrength;

varying vec3 vDir;

float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(
            mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
            mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x),
            f.y
        ),
        mix(
            mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
            mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x),
            f.y
        ),
        f.z
    );
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.1;
        amplitude *= 0.5;
    }
    return value;
}

float starLayer(vec3 dir, float density, float threshold) {
    vec3 cell = dir * density;
    float h = hash(floor(cell));
    if (h < threshold) return 0.0;
    vec3 f = fract(cell) - 0.5;
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + h * 3.0) + h * 40.0);
    return smoothstep(0.35, 0.0, length(f)) * twinkle;
}

void main() {
    vec3 dir = normalize(vDir);

    // Milky-way band along a tilted great circle
    vec3 bandNormal = normalize(vec3(0.45, 1.0, 0.2));
    float band = pow(1.0 - abs(dot(dir, bandNormal)), 5.0);

    // Nebula clouds, denser inside the band
    float clouds = fbm(dir * 3.0 + vec3(11.0));
    clouds += band * uBandStrength * fbm(dir * 5.0 + vec3(4.7));

    vec3 deepSpace = vec3(0.012, 0.008, 0.03);
    vec3 nebulaPurple = vec3(0.35, 0.12, 0.45);
    vec3 nebulaTeal = vec3(0.08, 0.28, 0.38);

    vec3 color = deepSpace;
    color += nebulaPurple * clouds * uNebulaStrength;
    color += nebulaTeal * pow(clouds, 2.0) * uNebulaStrength * 0.8;

    // Two star scales; brighter inside the band, gentle per-star twinkle
    float stars = starLayer(dir, 60.0, 0.986);
    stars += starLayer(dir, 140.0, 0.992) * 0.6;
    color += vec3(0.9, 0.93, 1.0) * stars * uStarIntensity * (0.7 + band * 0.8);

    // Subtle haze where the dome meets the fog line
    float horizon = smoothstep(0.25, -0.05, dir.y);
    color = mix(color, vec3(0.10, 0.03, 0.13), horizon * 0.55);

    gl_FragColor = vec4(color, 1.0);
}
`

const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uNebulaStrength: { value: state.nebulaStrength },
        uStarIntensity: { value: state.starIntensity },
        uBandStrength: { value: state.bandStrength },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
})

const dome = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 32), material)
dome.renderOrder = -1 // paint behind everything in the opaque pass
scene.add(dome)

export const updateGalaxySky = (elapsedTime) => {
    material.uniforms.uTime.value = elapsedTime
    dome.rotation.y = elapsedTime * state.rotationSpeed
}

if (gui) {
    const folder = gui.addFolder('Galaxy')
    folder.add(material.uniforms.uNebulaStrength, 'value', 0, 2, 0.01).name('nebula')
    folder.add(material.uniforms.uStarIntensity, 'value', 0, 3, 0.01).name('stars')
    folder.add(material.uniforms.uBandStrength, 'value', 0, 2, 0.01).name('band')
    folder.add(state, 'rotationSpeed', 0, 0.02, 0.001)
    folder.close()
}
