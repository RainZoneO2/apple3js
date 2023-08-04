import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function createControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas);
    
    /**
     * Damping and auto-rotation requires
     * controls to be updated each frame
     */
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.minDistance = 5;
    controls.maxDistance = 20;


    controls.tick = () => controls.update();

    return controls;
}



export { createControls };