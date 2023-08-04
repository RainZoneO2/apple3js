import * as THREE from 'three/build/three.module.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js'


//A new scene to place things into
const scene = new THREE.Scene();

//Helper axes
scene.add(new THREE.AxesHelper(5))

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

//Set Pixel Ratio so it doesn't look blurry on HiDPI displays
renderer.setPixelRatio(window.devicePixelRatio);

//Adds renderer to HTML document as a <canvas> element
document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom)

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

// Create Box
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
const boxWire = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
//const boxMesh = new THREE.Mesh(boxGeo, boxWire);

boxMesh.rotation.set(40, 0, 40);
scene.add(boxMesh);

// Add Apple model
const loader = new GLTFLoader();

loader.load( '/Apple.glb', function ( gltf ) {
    gltf.scene.scale.set(0.1, 0.1, 0.1);
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

// Create Spheres
const sphereMeshes = [];
const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const sphereMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFEF});

for (let i = 0; i < 4; i++) {
    sphereMeshes[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMeshes[i].position.set(0, 0, 0);
    scene.add(sphereMeshes[i]);
}

// Trig consts for orbital paths
let theta = 0;
const dTheta = 2 * Math.PI / 500;

/**Adds array of PointLight which takes 4 params:
 * Color: Hexadecimal value for color
 * Intensity: Decimal representing intensity
 * Distance: Defines max range light can travel from light towards scene
 * Decay: Amount that the light dims travelling to max distance
 **/
const lights = [];
const lightHelpers = [];

const lightValues = [
    {colour: 0x14D14A, intensity: 80, dist: 12, x: 1, y: 0, z: 8},
    {colour: 0xBE61CF, intensity: 60, dist: 12, x: -2, y: 1, z: -10},
    {colour: 0x00FFFF, intensity: 30, dist: 10, x: 0, y: 10, z: 1},
    {colour: 0x00FF00, intensity: 60, dist: 12, x: 0, y: -10, z: -1},
    {colour: 0x16A7F5, intensity: 60, dist: 12, x: 10, y: 3, z: 0},
    {colour: 0x90F615, intensity: 60, dist: 12, x: -10, y: -1, z: 0},
    {colour: 0xFFFFFF, intensity: 80, dist: 100, x: -12, y: 10, z: -5}
];
for (let i=0; i<7; i++) {
    lights[i] = new THREE.PointLight(
        lightValues[i]['colour'], 
        lightValues[i]['intensity'], 
        lightValues[i]['dist']);
    lights[i].position.set(
        lightValues[i]['x'], 
        lightValues[i]['y'], 
        lightValues[i]['z']);
    scene.add(lights[i]);

    lightHelpers[i] = new THREE.PointLightHelper(lights[i], 0.7);
    scene.add(lightHelpers[i]);
}

//Trackball Controls for Camera
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;
controls.dynamicDampingFactor = 0.10;

const rendering = function() {
    //Creates loop, calls itself every refresh
    requestAnimationFrame(rendering);

    //Constantly rotate box
    //scene.rotation.z -= 0.005;
    //scene.rotation.x -= 0.001;

    //Update trackball controls
    controls.update();

    //Update stats
    stats.update();

    // Increment theta
    theta += dTheta;

    const trigs = [
        {x: Math.cos(theta*1.05), 
         y: Math.sin(theta*1.05), 
         z: Math.cos(theta*1.05), 
         r: 2},
        {x: Math.cos(theta*0.8), 
         y: Math.sin(theta*0.8), 
         z: Math.sin(theta*0.8), 
         r: 2.25},
        {x: Math.cos(theta*1.25), 
         y: Math.cos(theta*1.25), 
         z: Math.sin(theta*1.25), 
         r: 2.5},
        {x: Math.sin(theta*0.6), 
         y: Math.cos(theta*0.6), 
         z: Math.sin(theta*0), 
         r: 2.75}
    ];

    for (let i=0; i<4; i++) {
        sphereMeshes[i].position.x = trigs[i]['r'] * trigs[i]['x'];
        sphereMeshes[i].position.y = trigs[i]['r'] * trigs[i]['y'];
        sphereMeshes[i].position.z = trigs[i]['r'] * trigs[i]['z'];
    };


    //Render scene using camera
    renderer.render(scene, camera);
}

rendering();