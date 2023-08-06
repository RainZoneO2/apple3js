import { Group } from 'three';

import { createMeshes } from './meshes';

class Billboard extends Group {
    constructor(type, imagePath) {
        super();

        this.meshes = createMeshes(type, imagePath);

        this.add(
            this.meshes.box,
            this.meshes.pole1,
            this.meshes.pole2,
        );
    }
}

export { Billboard }