import { Group } from 'three';

import { createGeometries } from './geometries';
import { createMaterials } from './materials';
import { createMeshes } from './meshes';

class Billboard extends Group {
    constructor() {
        super();

        this.meshes = createMeshes();
    }
}

export { Billboard }