import * as THREE from '../node_modules/three/build/three.module.js';
import { TrackballControls } from '../node_modules/three/examples/jsm/controls/TrackballControls.js';
import Stats from 'three/examples/jsm/libs/stats.module'


//A new scene to place things into
const scene = new THREE.Scene();
//scene.add(new THREE.AxesHelper(5))

/** A perspective camera that takes 4 params
 * FOV: Number (in degrees) that represents vertical FOV
 * Aspect Ratio: Ratio between width and height (width / height)
 * Near Clipping Plane: Boundary plane closest to camera (anything closer isnt rendered)
 * Far Clipping Plane: Boundary plane furthest from camera (anything further won't be rendered)
 **/
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.6, 1200);
camera.position.z = 5;

//WebGL renderer, params are optional
const renderer = new THREE.WebGLRenderer({antialias: true});

//Statistics of app
const stats = new Stats()

//Sets color of scene background, 2nd param is alpha
renderer.setClearColor("#233143");

//Size of our app in relation to screen
renderer.setSize(window.innerWidth, window.innerHeight);

//Adds renderer to HTML document as a <canvas> element
document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom)

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

// Create Box
const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
const boxWire = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
//const boxMesh = new THREE.Mesh(boxGeo, boxWire);
boxMesh.rotation.set(40, 0, 40);

scene.add(boxMesh);

/**Adds array of PointLight which takes 4 params:
 * Color: Hexadecimal value for color
 * Intensity: Decimal representing intensity
 * Distance: Defines max range light can travel from light towards scene
 * Decay: Amount that the light dims travelling to max distance
 **/
const lights = [];
const lightValues = [
    {colour: 0x14D14A, intensity: 80, dist: 12, x: 1, y: 0, z: 8},
    {colour: 0xBE61CF, intensity: 60, dist: 12, x: -2, y: 1, z: -10},
    {colour: 0x00FFFF, intensity: 30, dist: 10, x: 0, y: 10, z: 1},
    {colour: 0x00FF00, intensity: 60, dist: 12, x: 0, y: -10, z: -1},
    {colour: 0x16A7F5, intensity: 60, dist: 12, x: 10, y: 3, z: 0},
    {colour: 0x90F615, intensity: 60, dist: 12, x: -10, y: -1, z: 0}
];
for (let i=0; i<6; i++) {
    lights[i] = new THREE.PointLight(
        lightValues[i]['colour'], 
        lightValues[i]['intensity'], 
        lightValues[i]['dist']);
    lights[i].position.set(
        lightValues[i]['x'], 
        lightValues[i]['y'], 
        lightValues[i]['z']);
    scene.add(lights[i]);
}

//Trackball Controls for Camera
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;
controls.dynamicDampingFactor = 0.10;

const rendering = function() {
    //Creates loop, calls itself every refresh
    requestAnimationFrame(rendering);

    //Constantly rotate box
    scene.rotation.z -= 0.005;
    scene.rotation.x -= 0.001;

    //Update trackball controls
    controls.update();

    //Update stats
    stats.update();

    //Render scene using camera
    renderer.render(scene, camera);
}

rendering();