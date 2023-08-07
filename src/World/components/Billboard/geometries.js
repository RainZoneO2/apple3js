import { BoxGeometry, CylinderGeometry } from "three";

function createGeometries(type) {
    /* Fill this with the different parts of billboard
    Two cylinders
    One Rectangular prism
    */
    const pole = new CylinderGeometry(0.08, 0.08, 1, 16);
    
    const boxDimensions = type === 'vertical' ? { width: 1.75, height: 2.5, depth: 0.25 }
                      : type === 'horizontal' ? { width: 2.5, height: 1.5, depth: 0.25 }
                      : null;
    
    const box = new BoxGeometry(boxDimensions.width, boxDimensions.height, boxDimensions.depth);
    
    return {
        pole,
        box,
    };
}

export { createGeometries }