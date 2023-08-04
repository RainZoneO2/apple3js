import {
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
} from "three";

function createLights() {
    //const ambientLight = new AmbientLight('white', 2);
    const ambientLight = new HemisphereLight(
        'white', // bright sky color
        'darkslategrey', // dim ground color
        5, // intensity
      );

    // Creates a directional light
    const mainLight = new DirectionalLight('white', 8);

    // Moves the light up, right, and towards camera
    mainLight.position.set(0, 0, 10);

    return { ambientLight, mainLight };
}

export { createLights };