import { BoxGeometry, CylinderGeometry } from "three";

function createGeometries() {
    /* Fill this with the different parts of billboard
    Two cylinders
    One Rectangular prism
    */
    const pole = new CylinderGeometry(0.08, 0.08, 1, 16);
    const box = new BoxGeometry(1.75, 2.5, 0.25);


    return {
        pole,
        box,
    };
}

export { createGeometries }