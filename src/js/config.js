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

    audio: {
        volume: 0.5,
    },

    theme: {
        toneMappingExposure: 1.1,
        fogColor: '#871769',
        fogDensity: 0.035,
        floorColor: '#324c8c',
        ambientIntensity: 2.1,
        directionalIntensity: 1.6,
    },

    sky: {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.1,
        mieDirectionalG: 0.95,
        elevation: 15,
        azimuth: 180,
    },
}
