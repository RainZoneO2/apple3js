import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { scene } from './scene.js'
import { world, objectsToUpdate } from './physics.js'
import { directionalLight } from './environment.js'

const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const text = 'HAPPY BIRTHDAY , ZHANYM'

        // Material
        const textMaterial = new THREE.MeshNormalMaterial()

        // Letters cast onto the floor
        const castShadows = true

        let offsetX = 0
        let totalWidth = 0

        for (let i = 0; i < text.length; i++) {
            const letter = text[i]
            if (letter.trim() === '') {
                offsetX += 0.2
                continue
            }

            const letterGeometry = new TextGeometry(letter, {
                font: font,
                size: 0.5,
                depth: 0.2,
                curveSegments: 6,
                bevelEnabled: true,
                bevelSize: 0.02,
                bevelThickness: 0.03,
                bevelOffset: 0,
                bevelSegments: 4,
            })

            letterGeometry.center()
            letterGeometry.computeBoundingBox()
            const letterBoundingBox = letterGeometry.boundingBox

            const letterWidth = letterBoundingBox.max.x - letterBoundingBox.min.x
            const letterHeight = letterBoundingBox.max.y - letterBoundingBox.min.y
            const letterDepth = letterBoundingBox.max.z - letterBoundingBox.min.z

            totalWidth += letterWidth + 0.08

            const letterMesh = new THREE.Mesh(letterGeometry, textMaterial)
            letterMesh.castShadow = castShadows
            letterMesh.position.x = offsetX
            letterMesh.position.y = letterHeight / 2 + 0.5
            scene.add(letterMesh)

            const shape = new CANNON.Box(
                new CANNON.Vec3(letterWidth / 2, letterHeight / 2, letterDepth / 2),
            )
            const body = new CANNON.Body({
                mass: 1,
            })

            body.addShape(shape)
            body.position.set(letterMesh.position.x, letterMesh.position.y, 0)
            world.addBody(body)

            objectsToUpdate.push({
                mesh: letterMesh,
                body: body,
            })

            offsetX += letterWidth + 0.08
        }

        const centerOffsetX = -totalWidth / 2
        objectsToUpdate.forEach((obj) => {
            obj.mesh.position.x += centerOffsetX
            obj.body.position.x += centerOffsetX
        })

        // Widen the shadow frustum to cover the full greeting row
        const shadowCamera = directionalLight.shadow.camera
        const halfExtent = Math.max(totalWidth / 2 + 1, 7)
        shadowCamera.left = -halfExtent
        shadowCamera.right = halfExtent
        shadowCamera.top = halfExtent * 0.6
        shadowCamera.bottom = -halfExtent * 0.6
        shadowCamera.updateProjectionMatrix()
    },
    undefined,
    (error) => {
        console.error('An error occurred: ', error)
    },
)
