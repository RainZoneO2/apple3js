// Components
import { createCamera } from "./components/camera";
import {
    createAxesHelper,
    createGridHelper,
  } from './systems/helpers.js';
import { createCube } from "./components/cube";
import { createMeshGroup } from "./components/meshGroup";
import { createLights } from "./components/lights";
import { createScene } from './components/scene.js';
import { Billboard } from "./components/Billboard/Billboard.js";
import { loadCharacter } from "./components/Character/character";
import { loadModel } from "./components/Billboard/model";

// Systems
import { createControls } from "./systems/controls";
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js'
import { createStats } from "./systems/stats";

// Module-scoped variables so we can't access them outside module
let camera;
let controls;
let renderer;
let scene;
let loop;
let stats;

class World {
    constructor(container) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        loop = new Loop(camera, scene, renderer);
        stats = createStats();
        container.append(renderer.domElement);
        container.append(stats.domElement);
        controls = createControls(camera, renderer.domElement);

        const {ambientLight, mainLight } = createLights();
        const billboardHor = new Billboard('horizontal', '/cringe.jpg');
        const billboardver = new Billboard('vertical', '/cring.jpg');

        billboardHor.position.set(-1.2, 0, 0);
        billboardver.position.set(1.2, 0, 0);
        //billboardHor.visible = false;
        loop.updatables.push(controls, stats);
        
        const resizer = new Resizer(container, camera, renderer);
        
        scene.add(ambientLight, mainLight, billboardHor, billboardver);
        scene.add(createAxesHelper(), createGridHelper());
        
        // Render on demand
        // controls.addEventListener('change', () => {
        //     this.render();
        // });
    }

    async init() {
        // Load models
        const { apple } = await loadCharacter();
        apple.position.set(0, 1, 0);
        controls.target.copy(apple.position);

        const { billboard } = await loadModel();
        billboard.rotation.set(0, 3, 0);
        //scene.add(billboard);
        
        //scene.add(apple);
    }

    render() {
        renderer.render(scene, camera);
    }

    start() {
        loop.start()
    }

    stop() {
        loop.stop()
    }
}

export { World };