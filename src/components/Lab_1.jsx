import { extend, Canvas } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import GUI from 'lil-gui';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Extender OrbitControls para usarlo con React Three Fiber
extend({ OrbitControls });

const Lab1 = () => {
    const mountRef = useRef(null);
    const [barriersVisible, setBarriersVisible] = useState(true); // Para controlar la visibilidad de las barreras
    const [gui, setGui] = useState(null); // GUI para manejar las barreras

    useEffect(() => {
        if (!mountRef.current) return;

        /**
         * Scene Setup
         */
        const scene = new THREE.Scene();
        const textureLoader = new THREE.TextureLoader();
        const environmentMapTexture = textureLoader.load(
            ['/static/textures/environmentMaps/0/px.png', '/static/textures/environmentMaps/0/nx.png', '/static/textures/environmentMaps/0/py.png', '/static/textures/environmentMaps/0/ny.png', '/static/textures/environmentMaps/0/pz.png', '/static/textures/environmentMaps/0/nz.png']
        );

        /**
         * Camera and Renderer
         */
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(-3, 3, 3);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        /**
         * Controls
         */
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        /**
         * Physics Setup (Cannon.js)
         */
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);

        const defaultMaterial = new CANNON.Material('default');
        const defaultContactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            { friction: 0.1, restitution: 0.6 }
        );
        world.addContactMaterial(defaultContactMaterial);
        world.defaultContactMaterial = defaultContactMaterial;

        // Piso
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0 });
        floorBody.addShape(floorShape);
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
        world.addBody(floorBody);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshStandardMaterial({
                color: '#777777',
                metalness: 0.3,
                roughness: 0.4,
                envMap: environmentMapTexture,
                envMapIntensity: 0.5
            })
        );
        floor.rotation.x = -Math.PI * 0.5;
        scene.add(floor);

        /**
         * Player Cube
         */
        const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 'red' });
        const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.position.set(0, 1, 0);
        scene.add(playerMesh);

        const playerShape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25));
        const playerBody = new CANNON.Body({
            mass: 1,  
            position: new CANNON.Vec3(0, 1, 0),
            shape: playerShape,
            material: defaultMaterial
        });
        world.addBody(playerBody);

        /**
         * Barrera invisible
         */
        const createInvisibleBarrier = (width, height, depth, position) => {
            // Barrera invisible en Three.js
            const invisibleMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0,  // Hacerla invisible
            });
            const barrier = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), invisibleMaterial);
            barrier.position.copy(position);
            scene.add(barrier);

            // Cuerpo de la barrera en Cannon.js
            const barrierShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
            const barrierBody = new CANNON.Body({
                mass: 0,  // Estática
                position: new CANNON.Vec3(position.x, position.y, position.z),
                shape: barrierShape,
                material: defaultMaterial
            });
            world.addBody(barrierBody);
        };

        // Crear barreras invisibles
        createInvisibleBarrier(2, 2, 0.1, { x: 5, y: 1, z: 0 });
        createInvisibleBarrier(2, 2, 0.1, { x: -5, y: 1, z: 0 });
        createInvisibleBarrier(2, 2, 0.1, { x: 0, y: 1, z: 5 });
        createInvisibleBarrier(2, 2, 0.1, { x: 0, y: 1, z: -5 });

        /**
         * UI with lil-gui
         */
        const gui = new GUI();
        setGui(gui);
        const debugObject = {
            toggleBarriers: () => {
                // Alternar visibilidad de las barreras
                barriersVisible ? setBarriersVisible(false) : setBarriersVisible(true);
            }
        };
        gui.add(debugObject, 'toggleBarriers').name('Toggle Barriers');

        // Desactivar las barreras visibles
        const barriers = scene.children.filter(child => child instanceof THREE.Mesh && child.material.opacity === 0);

        /**
         * Animación y update
         */
        const clock = new THREE.Clock();
        let oldElapsedTime = 0;
        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            const deltaTime = elapsedTime - oldElapsedTime;
            oldElapsedTime = elapsedTime;
            world.step(1 / 60, deltaTime, 3);

            // Actualizar las barreras según la visibilidad
            barriers.forEach(barrier => {
                barrier.visible = barriersVisible;
            });

            // Actualizar el cubo del jugador
            playerMesh.position.copy(playerBody.position);
            playerMesh.quaternion.copy(playerBody.quaternion);

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        tick();

        return () => {
            gui.destroy();
            window.removeEventListener('resize', handleResize);
        };

    }, [barriersVisible]);

    return (
        <div ref={mountRef}></div>
    );
};

export default Lab1;
