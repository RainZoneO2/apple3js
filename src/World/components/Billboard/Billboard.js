import { Group } from 'three';

import { createMeshes } from './meshes';

class Billboard extends Group {
    constructor(type, path) {
        super();

        this.meshes = createMeshes(type, path);

        this.add(
            this.meshes.box,
            this.meshes.pole1,
            this.meshes.pole2,
        );
    }
}

export { Billboard }