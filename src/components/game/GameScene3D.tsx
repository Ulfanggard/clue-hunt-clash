import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import ClueObject3D from "./ClueObject3D";

interface GameScene3DProps {
  clues: any[];
  discoveredClues: number[];
  onDiscoverClue: (clueIndex: number) => void;
}

const GameScene3D = ({ clues, discoveredClues, onDiscoverClue }: GameScene3DProps) => {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-noir border border-primary/20">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
        <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        {/* Environment */}
        <Environment preset="night" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Detective Office Setup - Desk */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[6, 0.2, 3]} />
          <meshStandardMaterial color="#2d1810" roughness={0.8} />
        </mesh>

        {/* Clue Objects arranged on and around the desk */}
        {clues.map((clue, index) => {
          const angle = (index / clues.length) * Math.PI * 2;
          const radius = 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1.2;

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

        {/* Walls */}
        <mesh position={[0, 3, -10]} receiveShadow>
          <boxGeometry args={[30, 6, 0.5]} />
          <meshStandardMaterial color="#0f0f1e" />
        </mesh>
        <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[20, 6, 0.5]} />
          <meshStandardMaterial color="#0f0f1e" />
        </mesh>
        <mesh position={[10, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[20, 6, 0.5]} />
          <meshStandardMaterial color="#0f0f1e" />
        </mesh>

        {/* Ambient fog for noir atmosphere */}
        <fog attach="fog" args={["#0a0a0a", 10, 30]} />
      </Canvas>
    </div>
  );
};

export default GameScene3D;
