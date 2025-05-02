import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { World } from './world';
import { createUI } from './ui';

const stats = new Stats();
document.body.appendChild(stats.dom);

// Renderer Setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x80a0e0);
document.body.appendChild(renderer.domElement);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(-32, 16, -32);
camera.lookAt(0,0,0);

// Controls Setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(16, 0, 16);
controls.enableDamping = true;

// Scene Setup
const scene = new THREE.Scene();
const world = new World();
world.generate();
scene.add(world);

// Lights Setup
function setupLights() {
  const sun = new THREE.DirectionalLight();
  sun.position.set(50, 50, 50);
  sun.castShadow = true;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.mapSize.set(512, 512);
  sun.shadow.bias = -0.0001;
  scene.add(sun);


  // Directional light helper
  const lightHelper = new THREE.CameraHelper(sun.shadow.camera);
  scene.add(lightHelper);

  const ambient = new THREE.AmbientLight();
  ambient.intensity = 0.1;
  scene.add(ambient);
}

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  stats.update();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

setupLights();
createUI(world);
animate();