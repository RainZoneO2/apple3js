import * as CANNON from "cannon-es"
import * as THREE from "three"

/**
 * Physics world
 */
export const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.81, 0)

// Materials
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7
  }
)

world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(- 1, 0, 0), 
  Math.PI * 0.5
)

world.addBody(floorBody)

// Camera collider body follows the camera each frame
export const cameraBody = new CANNON.Body({
    position: new CANNON.Vec3(0, 5, 0),
    shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)),
    linearDamping: 0,
    angularDamping: 0,

    mass: 0.1
})
world.addBody(cameraBody)

// Meshes synced from physics bodies every frame
export const objectsToUpdate = []

export const moveCameraCollider = (camera) => {
    // Set the body position directly
    cameraBody.position.copy(camera.position);

    // Optional: Set velocity to zero to avoid unintended movements
    cameraBody.velocity.set(0, 0, 0);
    cameraBody.angularVelocity.set(0, 0, 0);
}

export const stepWorld = (deltaTime) => {
    world.step(1 / 60, deltaTime, 3)
}

export const syncMeshes = () => {
    objectsToUpdate.forEach(obj => {
        obj.mesh.position.copy(obj.body.position)
        obj.mesh.quaternion.copy(obj.body.quaternion)
    })
}
