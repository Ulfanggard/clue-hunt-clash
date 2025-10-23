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
      // Subtle bobbing animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2;
      // Slow rotation
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    if (!isDiscovered) {
      onDiscover(index);
    }
  };

  // Minecraft block colors
  const blockColors = [
    "#FFD700", // Gold block
    "#4169E1", // Diamond block  
    "#DC143C", // Redstone block
    "#32CD32", // Emerald block
    "#FF8C00", // Orange block
    "#8B4513", // Brown block
  ];
  
  const blockColor = blockColors[index % blockColors.length];

  return (
    <group position={position}>
      {/* Main block - always cubic for Minecraft style */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={isDiscovered ? blockColor : "#666666"}
          roughness={1}
          metalness={0}
          emissive={hovered ? blockColor : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Pixelated text label */}
      {(hovered || isDiscovered) && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.4}
          color={isDiscovered ? blockColor : "#FFFFFF"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {isDiscovered ? clue.title : "???"}
        </Text>
      )}

      {/* Glowing particles for undiscovered clues */}
      {!isDiscovered && (
        <>
          {Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / 4) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.8,
                  0,
                  Math.sin(angle) * 0.8,
                ]}
              >
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color="#FFFF00" transparent opacity={0.6} />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};

export default ClueObject3D;
