import GUI from 'lil-gui'
import CannonDebugger from 'cannon-es-debugger'
import { scene } from './scene.js'
import { world } from './physics.js'

/**
 * Debug tooling. Only wired up in development builds; production gets
 * null gui and a no-op debugger update.
 */
export let gui = null
export let updatePhysicsDebugger = () => {}

if (import.meta.env.DEV) {
    gui = new GUI()

    const debugObject = {}

    gui.add(debugObject, 'physicsDebugger')

    const cannonDebugger = new CannonDebugger(scene, world, {
        onUpdate(body, mesh) {
            mesh.visible = debugObject.physicsDebugger
        },
    })

    updatePhysicsDebugger = () => cannonDebugger.update()
}
