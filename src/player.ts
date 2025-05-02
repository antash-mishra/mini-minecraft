import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';

export class Player {
  maxSpeed: number = 10;
  // Direction of the player is stored in a vector3
  input = new THREE.Vector3();
  velocity = new THREE.Vector3();

  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1, 
    200
  );
  cameraHelper: THREE.CameraHelper = new THREE.CameraHelper(this.camera);
  controls: PointerLockControls = new PointerLockControls(this.camera, document.body);

  constructor(scene: THREE.Scene) {
    this.position.set(32, 16, 32);
    scene.add(this.camera);
    scene.add(this.cameraHelper);
  
    document.addEventListener('keydown', this.onkeydown.bind(this));
    document.addEventListener('keyup', this.onkeyup.bind(this));
  }

  applyInput(dt: number) {
    if (this.controls.isLocked) {
      this.velocity.x = this.input.x;
      this.velocity.z = this.input.z;
      this.controls.moveRight(this.velocity.x * dt);
      this.controls.moveForward(this.velocity.z * dt);
      document.getElementById('player-position')!.textContent = this.toString();
    }
  }


  /**
   * Get the position of the player.
   * @returns {THREE.Vector3} The position of the player.
   */
  get position() {
    return this.camera.position;
  }
  
  onkeydown(event: KeyboardEvent) {
    if (!this.controls.isLocked) {
      this.controls.lock();
    }

    switch (event.key) {
      case 'w':
        this.input.z = this.maxSpeed;
        break;
      case 's':
        this.input.z = -this.maxSpeed;
        break;
      case 'a':
        this.input.x = -this.maxSpeed;
        break;
      case 'd':
        this.input.x = this.maxSpeed;
        break;
      case 'r':
        this.position.set(32, 16, 32);
        this.velocity.set(0, 0, 0);
        break;
    }
  }

  onkeyup(event: KeyboardEvent) {
    switch (event.key) {
      case 'w':
        this.input.z = 0;
        break;
      case 's':
        this.input.z = 0;
        break;
      case 'a':
        this.input.x = 0;
        break;
      case 'd':
        this.input.x = 0;
        break;
    }
  }

  toString() {
    return `x: ${this.position.x.toFixed(2)}, y: ${this.position.y.toFixed(2)}, z: ${this.position.z.toFixed(2)}`;
  }
  
  
  
}

