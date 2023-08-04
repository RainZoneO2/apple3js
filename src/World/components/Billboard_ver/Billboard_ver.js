import { Group } from 'three';

import { createGeometries } from './geometries';
import { createMaterials } from './materials';
import { createMeshes } from './meshes';

class Billboard_ver extends Group {
    constructor() {
        super();

        this.meshes = createMeshes();

        this.add(
            this.meshes.box,
            this.meshes.pole1,
            this.meshes.pole2,
        );
    }
}

export { Billboard_ver }