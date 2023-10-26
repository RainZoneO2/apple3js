import { Vec3, World } from "cannon-es";

class Cannon {
    constructor() {
        this.world = new World({
            gravity: new Vec3(0, -1, 0),
        });

        this.bodies = [];
    }

    step() {
        world.addEventListener('postStep', function() {
            for (const object of this.bodies) {
                const v = new Vec3();
                v.set(-object.position.x, -object.position.y, -object.position.z).normalize();
                v.scale(9.8, object.force);
                object.applyLocalForce(v);
                object.force.y += object.mass;
            }
        })
    }

    addBody(object) {
        this.world.addBody(object);
    }
}

export { Cannon };