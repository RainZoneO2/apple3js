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
import { Billboard } from "./components/Billboard/Billboard";

// Systems
import { createControls } from "./systems/controls";
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js'

// Module-scoped variables so we can't access them outside module
let camera;
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

        const controls = createControls(camera, renderer.domElement);
        const {ambientLight, mainLight } = createLights();
        const billboard = new Billboard();
        //const cube = createCube();
        //const meshGroup = createMeshGroup();
        //cube.visible = false;
        //loop.updatables.push(meshGroup, controls);
        //scene.add(cube, ambientLight, mainLight, meshGroup);

        loop.updatables(controls, billboard);
        scene.add(ambientLight, mainLight, billboard);

        const resizer = new Resizer(container, camera, renderer);

        scene.add(createAxesHelper(), createGridHelper());
        
        // Render on demand
        // controls.addEventListener('change', () => {
        //     this.render();
        // });
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