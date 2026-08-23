import * as CANNON from 'cannon-es'

/**
 * Physics world
 */
export const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.81, 0)

// Materials
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0.7,
})

world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// The world is a floating island: a flat disc with an invisible rim so
// nothing (player, letters, thrown apples) can hop off into space.
export const ISLAND_RADIUS = 42

// Disc floor; cannon-es cylinders are Y-aligned, sink it so the top sits at y=0
const floorBody = new CANNON.Body({ mass: 0 })
floorBody.addShape(new CANNON.Cylinder(ISLAND_RADIUS, ISLAND_RADIUS, 2, 24))
floorBody.position.set(0, -1, 0)
world.addBody(floorBody)

// Rim wall: a ring of thin static boxes just outside the walkable radius
const WALL_SEGMENTS = 16
const WALL_HEIGHT = 4
const WALL_THICKNESS = 1

for (let i = 0; i < WALL_SEGMENTS; i++) {
    const angle = (i / WALL_SEGMENTS) * Math.PI * 2
    const chord = 2 * ISLAND_RADIUS * Math.tan(Math.PI / WALL_SEGMENTS)

    const segment = new CANNON.Body({ mass: 0 })
    segment.addShape(
        new CANNON.Box(new CANNON.Vec3(chord / 2 + 0.2, WALL_HEIGHT / 2, WALL_THICKNESS / 2)),
    )
    segment.position.set(
        Math.sin(angle) * ISLAND_RADIUS,
        WALL_HEIGHT / 2,
        Math.cos(angle) * ISLAND_RADIUS,
    )
    segment.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle)
    world.addBody(segment)
}

// Camera collider follows the camera each frame. Kinematic so it ignores
// gravity/forces but still pushes dynamic bodies and reports contacts.
export const cameraBody = new CANNON.Body({
    type: CANNON.Body.KINEMATIC,
    position: new CANNON.Vec3(0, 5, 0),
    shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)),
})
world.addBody(cameraBody)

// Meshes synced from physics bodies every frame
export const objectsToUpdate = []

export const moveCameraCollider = (camera) => {
    // Set the body position directly
    cameraBody.position.copy(camera.position)

    // Keep velocity zero to avoid unintended movements
    cameraBody.velocity.set(0, 0, 0)
    cameraBody.angularVelocity.set(0, 0, 0)
}

export const stepWorld = (deltaTime) => {
    world.step(1 / 60, deltaTime, 3)
}

export const syncMeshes = () => {
    objectsToUpdate.forEach((obj) => {
        obj.mesh.position.copy(obj.body.position)
        obj.mesh.quaternion.copy(obj.body.quaternion)
    })
}
