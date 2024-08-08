import EventEmitter from "./EventEmitter"

export default class Sizes extends EventEmitter{
    constructor() {
        super()
        
        // Setup
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        console.log(`Sizes Init | Width: ${this.width}, Height: ${this.height}, Pixel Ratio: ${this.pixelRatio}`)

        // Resize event
        window.addEventListener('resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)
        
            this.trigger('resize') 
        })
    
    }
}