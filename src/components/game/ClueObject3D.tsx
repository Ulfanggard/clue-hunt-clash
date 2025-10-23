import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface ClueObject3DProps {
  clue: any;
  index: number;
  position: [number, number, number];
  isDiscovered: boolean;
  onDiscover: (index: number) => void;
}

const ClueObject3D = ({ clue, index, position, isDiscovered, onDiscover }: ClueObject3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !isDiscovered) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
    }
  });

  const handleClick = () => {
    if (!isDiscovered) {
      onDiscover(index);
    }
  };

  // Different shapes for variety
  const shapes = ['box', 'sphere', 'cone'];
  const shape = shapes[index % shapes.length];

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        {shape === 'box' && <boxGeometry args={[0.6, 0.6, 0.6]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.4, 32, 32]} />}
        {shape === 'cone' && <coneGeometry args={[0.4, 0.8, 32]} />}
        
        <meshStandardMaterial
          color={isDiscovered ? "#FFD700" : hovered ? "#FFA500" : "#666666"}
          emissive={isDiscovered ? "#FFD700" : hovered ? "#FF8C00" : "#000000"}
          emissiveIntensity={isDiscovered ? 0.5 : hovered ? 0.3 : 0}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Floating text label */}
      {(hovered || isDiscovered) && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color={isDiscovered ? "#FFD700" : "#FFFFFF"}
          anchorX="center"
          anchorY="middle"
        >
          {isDiscovered ? clue.title : "?"}
        </Text>
      )}

      {/* Glowing ring for undiscovered clues */}
      {!isDiscovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color="#4169E1" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default ClueObject3D;
