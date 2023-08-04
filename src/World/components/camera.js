import { 
    PerspectiveCamera, 
    MathUtils 
} from "three";

function createCamera() {
    const camera = new PerspectiveCamera(
        75, // FOV: Number (in degrees) that represents vertical FOV
        1, // Aspect Ratio: Ratio between width and height (width / height)
        0.6, // Near Clipping Plane: Boundary plane closest to camera (anything closer isnt rendered)
        1200, // Far Clipping Plane: Boundary plane furthest from camera (anything further won't be rendered)
    );

    camera.position.set(0, 0, 10);
    

    camera.tick = (delta) => {
        // Camera animation goes here
    };

    return camera;
}

export { createCamera };