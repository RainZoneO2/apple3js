import { World } from "./World/World";

async function main() {
    const sunContainer = document.querySelector('.sun-background');
    const moonContainer = document.querySelector('.moon-background');
    
    // Synchronous
    const world = new World(sunContainer, moonContainer);

    // Asynchronous
    await world.init();

    //world.render();
    world.start();
}

main().catch((err) => {
    console.error(err);
});