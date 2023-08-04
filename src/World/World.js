// Components
import { createCamera } from "./components/camera";
import {
    createAxesHelper,
    createGridHelper,
  } from './components/helpers.js';
import { createCube } from "./components/cube";
import { createMeshGroup } from "./components/meshGroup";
import { createLights } from "./components/lights";
import { createScene } from './components/scene.js';
import { Billboard_hor } from "./components/Billboard_hor/Billboard_hor.js";
import { Billboard_ver } from "./components/Billboard_ver/Billboard_ver.js";
import { loadCharacter } from "./components/Character/character";

// Systems
import { createControls } from "./systems/controls";
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js'

// Module-scoped variables so we can't access them outside module
let camera;
let controls;
let renderer;
let scene;
let loop;


class World {
    constructor(container) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        loop = new Loop(camera, scene, renderer);
        container.append(renderer.domElement);
        controls = createControls(camera, renderer.domElement);

        const {ambientLight, mainLight } = createLights();
        const billboardHor = new Billboard_hor();
        const billboardVer = new Billboard_ver();
        //const cube = createCube();
        //const meshGroup = createMeshGroup();
        //cube.visible = false;
        //loop.updatables.push(meshGroup, controls);
        billboardHor.position.set(-5, 0, 1);
        //scene.add(cube, ambientLight, mainLight, meshGroup);

        loop.updatables.push(controls);
        scene.add(ambientLight, mainLight, billboardHor, billboardVer);

        const resizer = new Resizer(container, camera, renderer);

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