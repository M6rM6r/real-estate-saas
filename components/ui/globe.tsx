'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface GlobeConfig {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: { lat: number; lng: number };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

interface Position {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
}

interface WorldProps {
  data: Position[];
  globeConfig: GlobeConfig;
}

function GlobeComponent({ data, globeConfig }: WorldProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create sphere geometry for globe
    const geometry = new THREE.SphereGeometry(100, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: globeConfig.globeColor || '#062056',
      emissive: globeConfig.emissive || '#062056',
      emissiveIntensity: globeConfig.emissiveIntensity || 0.1,
      shininess: (globeConfig.shininess || 0.9) * 100,
      wireframe: false,
    });

    const sphere = new THREE.Mesh(geometry, material);
    groupRef.current.add(sphere);

    // Create atmosphere if enabled
    if (globeConfig.showAtmosphere) {
      const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 64);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: globeConfig.atmosphereColor || '#FFFFFF',
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      groupRef.current.add(atmosphere);
    }

    // Add points
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
      color: '#0ea5e9',
      size: globeConfig.pointSize || 4,
      sizeAttenuation: true,
    });

    const pointsPositions: number[] = [];
    for (let i = 0; i < 100; i++) {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lng = Math.random() * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lng) * 100;
      const y = Math.sin(lat) * 100;
      const z = Math.cos(lat) * Math.sin(lng) * 100;
      pointsPositions.push(x, y, z);
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pointsPositions), 3));
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    groupRef.current.add(points);

    // Create arcs between points
    data.forEach((arc) => {
      const lat1 = (arc.startLat * Math.PI) / 180;
      const lng1 = (arc.startLng * Math.PI) / 180;
      const lat2 = (arc.endLat * Math.PI) / 180;
      const lng2 = (arc.endLng * Math.PI) / 180;

      const start = new THREE.Vector3(
        Math.cos(lat1) * Math.cos(lng1) * 100,
        Math.sin(lat1) * 100,
        Math.cos(lat1) * Math.sin(lng1) * 100
      );

      const end = new THREE.Vector3(
        Math.cos(lat2) * Math.cos(lng2) * 100,
        Math.sin(lat2) * 100,
        Math.cos(lat2) * Math.sin(lng2) * 100
      );

      const altitude = arc.arcAlt * 50;
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const midLength = mid.length();
      mid.normalize().multiplyScalar(midLength + altitude);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: arc.color, linewidth: 1 });
      const line = new THREE.Line(geometry, material);
      if (groupRef.current) {
        groupRef.current.add(line);
      }
    });

    camera.position.z = 300;
  }, [data, globeConfig, camera]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <group ref={groupRef} />
      <OrbitControls
        ref={controlsRef}
        autoRotate={globeConfig.autoRotate || false}
        autoRotateSpeed={globeConfig.autoRotateSpeed || 0.5}
        enablePan={false}
        enableZoom={true}
        maxDistance={500}
        minDistance={100}
      />
      <ambientLight intensity={0.8} color={globeConfig.ambientLight || '#38bdf8'} />
      <directionalLight position={[100, 100, 100]} intensity={1} color="#ffffff" />
    </>
  );
}

export function World({ data, globeConfig }: WorldProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 300], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <GlobeComponent data={data} globeConfig={globeConfig} />
    </Canvas>
  );
}
