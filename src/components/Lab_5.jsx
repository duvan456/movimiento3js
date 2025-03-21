import React, { useEffect, useRef } from "react";


const Lab_5 = () => {
    const canvasRef = useRef();

    useEffect(() => {
        if (!canvasRef.current) return; // Asegurar que el canvas existe antes de usarlo

       
        // Función de animación
        const animate = () => {
            requestAnimationFrame(animate);
            //cube.rotation.x += 0.01;
            //cube.rotation.y += 0.01;
            //renderer.render(scene, camera);
        };

        animate();

        // ✅ Cleanup al desmontar el componente
        return () => {
           // renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} />;
};

export default Lab_5;
