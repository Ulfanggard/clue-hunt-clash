import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MinecraftNPCProps {
  position: [number, number, number];
  skinColor?: string;
  shirtColor?: string;
  pantsColor?: string;
}

const MinecraftNPC = ({ 
  position, 
  skinColor = "#f4a460",
  shirtColor = "#4169E1",
  pantsColor = "#2F4F4F"
}: MinecraftNPCProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const armTime = useRef(0);

  useFrame((state) => {
    if (groupRef.current) {
      // Idle rotation animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    
    if (headRef.current) {
      // Head bobbing
      headRef.current.position.y = 2.4 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }

    armTime.current = state.clock.elapsedTime;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={skinColor} roughness={1} metalness={0} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshStandardMaterial color={shirtColor} roughness={1} metalness={0} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[-0.6, 1.4, 0]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color={shirtColor} roughness={1} metalness={0} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[0.6, 1.4, 0]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color={shirtColor} roughness={1} metalness={0} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[-0.2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color={pantsColor} roughness={1} metalness={0} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[0.2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color={pantsColor} roughness={1} metalness={0} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 2.5, 0.41]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 2.5, 0.41]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export default MinecraftNPC;
