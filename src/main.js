import { World } from "./World/World";

async function main() {
    const container = document.querySelector('#scene-container');
    
    // Synchronous
    const world = new World(container);

    // Asynchronous
    await world.init();

    //world.render();
    world.start();
}

main().catch((err) => {
    console.error(err);
});