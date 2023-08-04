import {
    Group,
    MeshStandardMaterial,
    SphereGeometry,
    Mesh,
    MathUtils,
} from 'three';

function createMeshGroup() {
    const group = new Group();

    const geometry = new SphereGeometry(0.25, 16, 16);

    const material = new MeshStandardMaterial({
        color: 'indigo',
    });

    // Create sphere
    const protoSphere = new Mesh(geometry, material);

    // Add sphere to group
    group.add(protoSphere);

    // Loop to create multiple clones of sphere
    for (let i = 0; i < 1; i += 0.001) {
        const sphere = protoSphere.clone();

        // Adjust position of each sphere in a cyclical pattern
        sphere.position.x = Math.cos(2 * Math.PI * i);
        sphere.position.y = Math.sin(2 * Math.PI * i);
        sphere.position.z = -i * 5;

        // Adjust size of each sphere
        sphere.scale.multiplyScalar(0.01 + i);

        // Add each clone sphere to group
        group.add(sphere);
    }
    group.scale.multiplyScalar(2)

    const radiansPerSecond = MathUtils.degToRad(30);
    let i = 0;

    group.tick = (delta) => { 
        // Rotate whole group on z axis
        group.rotation.z -= delta * radiansPerSecond;
    };

    return group;
}

export { createMeshGroup };