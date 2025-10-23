import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import ClueObject3D from "./ClueObject3D";

interface GameScene3DProps {
  clues: any[];
  discoveredClues: number[];
  onDiscoverClue: (clueIndex: number) => void;
}

const GameScene3D = ({ clues, discoveredClues, onDiscoverClue }: GameScene3DProps) => {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-noir border border-primary/20">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 8, 8]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2.2}
        />
        
        {/* Minecraft-style lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 15, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Sky */}
        <Sky sunPosition={[100, 20, 100]} />

        {/* Grass floor - pixelated texture look */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#7cb342" roughness={1} metalness={0} />
        </mesh>

        {/* Grid pattern on floor for Minecraft feel */}
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh key={`grid-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[i - 20, 0.01, 0]}>
            <planeGeometry args={[0.05, 40]} />
            <meshBasicMaterial color="#6ba839" transparent opacity={0.3} />
          </mesh>
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh key={`grid-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, i - 20]}>
            <planeGeometry args={[40, 0.05]} />
            <meshBasicMaterial color="#6ba839" transparent opacity={0.3} />
          </mesh>
        ))}

        {/* Stone platform/table in center */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 1, 6]} />
          <meshStandardMaterial color="#7d7d7d" roughness={1} metalness={0} />
        </mesh>

        {/* Clue Objects arranged around the platform */}
        {clues.map((clue, index) => {
          const angle = (index / clues.length) * Math.PI * 2;
          const radius = 5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 2;

          return (
            <ClueObject3D
              key={index}
              clue={clue}
              index={index}
              position={[x, y, z]}
              isDiscovered={discoveredClues.includes(index)}
              onDiscover={onDiscoverClue}
            />
          );
        })}

        {/* Minecraft-style trees/decorations */}
        {[[-8, 0, -8], [8, 0, -8], [-8, 0, 8], [8, 0, 8]].map((pos, i) => (
          <group key={`tree-${i}`} position={pos as [number, number, number]}>
            {/* Tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <boxGeometry args={[1, 3, 1]} />
              <meshStandardMaterial color="#8b4513" roughness={1} metalness={0} />
            </mesh>
            {/* Tree leaves - blocky */}
            <mesh position={[0, 4, 0]} castShadow>
              <boxGeometry args={[3, 2, 3]} />
              <meshStandardMaterial color="#228b22" roughness={1} metalness={0} />
            </mesh>
          </group>
        ))}

        {/* Dirt blocks around the edges */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 12;
          const z = Math.sin(angle) * 12;
          return (
            <mesh key={`dirt-${i}`} position={[x, 0.5, z]} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#8b7355" roughness={1} metalness={0} />
            </mesh>
          );
        })}
      </Canvas>
    </div>
  );
};

export default GameScene3D;
