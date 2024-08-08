import Experience from "../Experience"
import Environment from './Environment'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.environment = new Environment()
            this.loaded = true
        })
    }

    update() {
        if (this.loaded) {
            // Update here
        }
    }
}