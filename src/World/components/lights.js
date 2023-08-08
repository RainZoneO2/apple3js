import {
    AmbientLight,
    Color,
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
    const sunLight = new DirectionalLight('white', 3.5);

    // Moves the light up, right, and towards camera
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.right = 10;

    const moonLight = new DirectionalLight(new Color("#77ccff").convertSRGBToLinear(), 0);

    moonLight.position.set(-10, 20, 10);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 512;
    moonLight.shadow.mapSize.height = 512;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 100;
    moonLight.shadow.camera.left = -10;
    moonLight.shadow.camera.bottom = -10;
    moonLight.shadow.camera.top = 10;
    moonLight.shadow.camera.right = 10;

    return { ambientLight, sunLight, moonLight };
}

export { createLights };