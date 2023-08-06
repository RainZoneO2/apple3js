import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setupModel } from './setupModel';

async function loadModel() {
    const loader = new GLTFLoader();

    const [billboardData] = await Promise.all([
        loader.loadAsync('models/billboard.glb'),
    ]);
    

    console.log("Billboard:", billboardData);

    const billboard = setupModel(billboardData);

    return { 
        billboard
    }
}

export { loadModel };