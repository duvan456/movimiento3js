import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Lab1 from "../components/Lab_1";

const Laboratorio1 = () => {
  return (
    <Canvas
    >
      <Lab1 />
    </Canvas>
  );
};

export default Laboratorio1;
