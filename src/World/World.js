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
import { CameraHelper } from "three";


// Libraries
import anime from "animejs";

import { PhyWorld } from "./PhyWorld";

// Module-scoped variables so we can't access them outside module
let camera;
let controls;
let renderer;
let scene;
let loop;
let stats;

let phyWorld;

class World {
    constructor(sunContainer, moonContainer) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        loop = new Loop(camera, scene, renderer);
        stats = createStats();

        phyWorld = new PhyWorld(scene);
        phyWorld.test();
        document.body.appendChild(renderer.domElement);
        document.body.appendChild(stats.domElement);

        //sunContainer.append(renderer.domElement);
        //sunContainer.append(stats.domElement);

        controls = createControls(camera, renderer.domElement);

        const {ambientLight, sunLight, moonLight } = createLights();
        const billboardHor = new Billboard('horizontal', '/rain.webm');
        const billboardver = new Billboard('vertical', '/cring.jpg');

        billboardHor.position.set(-1.2, 0, 0);
        billboardver.position.set(1.2, 0, 0);
        //billboardHor.visible = false;
        loop.updatables.push(controls, stats, phyWorld);
        
        let daytime = true;
        let animating = false;
        window.addEventListener("keypress", (e) => {
            if (e.key != 'j') return;
            
            if (animating) return;

            let anim;
            if (!daytime) {
                anim = [1, 0];
            } else if (daytime) {
                anim = [0, 1];
            } else {
                return;
            }

            animating = true;

            let obj = {t: 0} ;
            anime({
                targets: obj,
                t: anim,
                complete: () => {
                    animating = false;
                    daytime = !daytime;
                },
                update: () => {
                    sunLight.intensity = 3.5 * ( 1 - obj.t);
                    moonLight.intensity = 3.5 * obj.t;

                    sunLight.position.setY(20 * (1 - obj.t));
                    moonLight.position.setY(20 * obj.t);

                    sunContainer.style.opacity = 1 - obj.t;
                    moonContainer.style.opacity = obj.t;
                },
                easing: 'easeInOutSine',
                duration: 500,
            });
        });

        const resizer = new Resizer(sunContainer, camera, renderer);
        
        scene.add(ambientLight, sunLight);
        scene.add(billboardHor, billboardver);
        scene.add(createAxesHelper(), createGridHelper());
        


        //const helper = new CameraHelper( moonLight.shadow.helper );
        //scene.add(helper);
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
        phyWorld.tick();
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