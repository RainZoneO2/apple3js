import { 
    BoxGeometry, 
    Mesh, 
    MeshStandardMaterial, 
    MathUtils,
    TextureLoader,
} from 'three';

function createMaterial() {
    // Create a texture loader
    const textureLoader = new TextureLoader();

    // Load a texture
    const texture = textureLoader.load(
        'uv-test-bw.png'
    );

    // Create a physically correct 'standard' material
    const material = new MeshStandardMaterial({ 
        map: texture,
    });

    return material;
}


function createCube() {
    const geometry = new BoxGeometry(2, 2, 2);

   
    const material = createMaterial();

    // create a Mesh containing the geometry and material
    const cubeMesh = new Mesh(geometry, material);

    cubeMesh.rotation.set(-0.5, -0.1, 0.8);

    const radiansPerSecond = MathUtils.degToRad(30);

    cubeMesh.tick = (delta) => {
        cubeMesh.rotation.z += radiansPerSecond * delta;
        cubeMesh.rotation.x += radiansPerSecond * delta;
        cubeMesh.rotation.y += radiansPerSecond * delta;
    };

    
    return cubeMesh;
}

export { createCube };