import { 
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


function createSphere() {
    const geometry = new SphereGeometry(1);
    const material = createMaterial();

    // create a Mesh containing the geometry and material
    const sphereMesh = new Mesh(geometry, material);

    const radiansPerSecond = MathUtils.degToRad(30);

    


    sphereMesh.tick = (delta) => {
        sphereMesh.position.copy();
        sphereMesh.quaternion.copy();
    };
    
    return sphereMesh;
}

export { createSphere };