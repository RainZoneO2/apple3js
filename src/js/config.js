/**
 * Central content & theme configuration.
 * Tweak these values to personalize the gallery without touching module code.
 */
export const CONFIG = {
    // Page/start-screen title
    title: 'apple3js',

    // Greeting rendered as physics letters on the floor
    greetingText: 'HAPPY BIRTHDAY, ZHANYM',

    gallery: {
        // Manifest prefix that identifies gallery textures
        folderPrefix: 'memories/textures/webp/',
        manifestUrl: '/manifest.json',
        planeSize: 6,
        planeSpacing: 3.5,
        panelHeight: 4,
        // Card expands when the camera comes this close to a panel...
        proximityEnter: 4.5,
        // ...and collapses only after leaving this larger radius (hysteresis)
        proximityExit: 5.5,
    },

    player: {
        radius: 0.55,
        moveSpeed: 7,
        hopSpeed: 7.5,
    },

    audio: {
        volume: 0.5,
        // Level of the guitar arrangement while a memory card is open (0..1
        // of the master volume); slightly below full so the swap reads soft
        guitarDuckLevel: 0.85,
    },

    theme: {
        toneMappingExposure: 1.25,
        fogColor: '#150a20',
        fogDensity: 0.02,
        floorColor: '#324c8c',
        ambientIntensity: 0.7,
        directionalColor: '#8fa3ff',
        directionalIntensity: 0.6,
    },

    galaxy: {
        nebulaStrength: 1.0,
        starIntensity: 1.1,
        bandStrength: 0.9,
        rotationSpeed: 0.004,
    },
}
