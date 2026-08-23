import * as THREE from "three"
import GUI from "lil-gui"
import CannonDebugger from "cannon-es-debugger"
import { scene } from "./scene.js"
import { world } from "./physics.js"

/**
 * Debug UI. Created unconditionally for now; gated behind DEV in a follow-up.
 */
export const gui = new GUI()

export const debugObject = {}

debugObject.reset = () => {
  console.log('Dispose')
}
gui.add(debugObject, 'reset')

debugObject.physicsDebugger = false
gui.add(debugObject, 'physicsDebugger')

const cannonDebugger = new CannonDebugger(scene, world, {
    onUpdate(body, mesh) {
        if (debugObject.physicsDebugger)
            mesh.visible = true
        else if (!debugObject.physicsDebugger) {
            mesh.visible = false
        }
    }
})

export const updatePhysicsDebugger = () => {
    cannonDebugger.update()
}
