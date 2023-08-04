import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setupModel } from './setupModel';

async function loadCharacter() {
    const loader = new GLTFLoader();

    const appleData = await loader.loadAsync('low-poly-apple.glb');

    console.log("Apple:", appleData);

    const apple = setupModel(appleData);

    return { apple }
}

export { loadCharacter };