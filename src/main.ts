import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { World } from './world';
import { createUI } from './ui';
import { Player } from './player';
import { Physics } from './physics';

const stats = new Stats();
document.body.appendChild(stats.dom);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x80a0e0);
document.body.appendChild(renderer.domElement);

// Camera Setup
const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
orbitCamera.position.set(-32, 16, -32);
orbitCamera.lookAt(0,0,0);

// Controls Setup
const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.target.set(16, 0, 16);
controls.enableDamping = true;

// Scene Setup
const scene = new THREE.Scene();
const world = new World();
world.generate();
scene.add(world);

// add player
const player = new Player(scene); 

// Physics Setup
const physics = new Physics(scene);

// Lights Setup
function setupLights() {
  const sun = new THREE.DirectionalLight();
  sun.intensity = 1.5;
  sun.position.set(50, 50, 50);
  sun.castShadow = true;

  // Set the size of the sun's shadow box
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  const ambient = new THREE.AmbientLight();
  ambient.intensity = 0.2;
  scene.add(ambient);
}


let previousTime = performance.now();

// Render Loop
function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const dt = (currentTime - previousTime) / 1000;

  if (player.controls.isLocked) {
  physics.update(dt, player, world);
  }
  
  renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
  stats.update();

  previousTime = currentTime;
}

window.addEventListener('resize', () => {
  orbitCamera.aspect = window.innerWidth / window.innerHeight;
  orbitCamera.updateProjectionMatrix();
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
})

setupLights();
createUI(world, player);
animate();