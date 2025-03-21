import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as CANNON from "cannon-es";
import React, { useEffect, useRef, useState } from "react";
import { TextureLoader } from "three";

const Lab2 = () => {
  const [velocidad, setVelocidad] = useState(5);
  const [friccion, setFriccion] = useState(0.1);
  const worldRef = useRef(new CANNON.World());
  const boxRef = useRef();
  const boxBodyRef = useRef();
  const [keys, setKeys] = useState({});

  // Cargar las texturas para cada figura (asegúrate de tener estos archivos en /assets)
  const cubeTexture = useLoader(TextureLoader, "/assets/texture1.jpg");
  const sphereTexture = useLoader(TextureLoader, "/assets/texture2.jpg");
  const coneTexture = useLoader(TextureLoader, "/assets/alpha.png");
  const esfeRef = useRef();
  //Controla rotacion de la esfera
  const [rotation, setRotation] = useState(0.01);
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      if (esfeRef.current) {
        esfeRef.current.rotation.x += rotation;
        esfeRef.current.rotation.y += rotation;
        console.log("useEffect:", rotation);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [rotation]);

  const handleClick = () => {
    setRotation(rotation === 0.01 ? 0.09 : 0.01);
    console.log("Click:", rotation);
  };

  useEffect(() => {
    const world = worldRef.current;
    world.gravity.set(0, -9.82, 0);

    const defaultMaterial = new CANNON.Material("default");
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: friccion,
        restitution: 0.6,
      }
    );
    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;

    const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    const boxBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: boxShape,
    });
    world.addBody(boxBody);
    boxBodyRef.current = boxBody;

    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    world.addBody(floorBody);

    const handleKeyDown = (event) => {
      setKeys((keys) => ({ ...keys, [event.key]: true }));
    };

    const handleKeyUp = (event) => {
      setKeys((keys) => ({ ...keys, [event.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      world.clear();
    };
  }, [friccion]);

  useFrame(() => {
    const world = worldRef.current;
    world.step(1 / 60);

    const boxBody = boxBodyRef.current;
    if (boxBody) {
      const force = new CANNON.Vec3();
      const speed = velocidad;

      if (keys["ArrowUp"]) {
        force.z = -speed;
      }
      if (keys["ArrowDown"]) {
        force.z = speed;
      }
      if (keys["ArrowLeft"]) {
        force.x = -speed;
      }
      if (keys["ArrowRight"]) {
        force.x = speed;
      }

      boxBody.applyForce(force, boxBody.position);

      if (boxRef.current) {
        boxRef.current.position.copy(boxBody.position);
        boxRef.current.quaternion.copy(boxBody.quaternion);
      }
    }
  });

  return (
    <>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>

        <mesh ref={boxRef} position={[0, 3, 0]} castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial map={cubeTexture} />
        </mesh>

        {/* Esfera con textura */}
        <mesh
          ref={esfeRef}
          position={[0, 2, 0]}
          castShadow
          onPointerDown={handleClick} // Asegura que el clic sea detectado
        >
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial map={sphereTexture} />
        </mesh>

        {/* Cono con textura */}
        <mesh position={[4, 1, 0]} castShadow>
          <coneGeometry args={[1, 3, 32]} />
          <meshStandardMaterial map={coneTexture} />
        </mesh>
      </Canvas>
      <div>
        <label>
          Velocidad:
          <input
            type="number"
            value={velocidad}
            onChange={(e) => setVelocidad(Number(e.target.value))}
          />
        </label>
        <label>
          Fricción:
          <input
            type="number"
            value={friccion}
            onChange={(e) => setFriccion(Number(e.target.value))}
          />
        </label>
      </div>
    </>
  );
};

export default Lab2;
