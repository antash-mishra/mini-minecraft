import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';

export class Player {
  radius: number = 0.5;
  height: number = 1.75;
  jumpSpeed: number = 10;
  onGround: boolean = false;
  boundsHelper: THREE.Mesh;

  maxSpeed: number = 5;
  // Direction of the player is stored in a vector3
  input = new THREE.Vector3();
  velocity = new THREE.Vector3();
  #worldVelocity = new THREE.Vector3();

  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1, 
    100
  );

  cameraHelper: THREE.CameraHelper = new THREE.CameraHelper(this.camera);
  controls: PointerLockControls = new PointerLockControls(this.camera, document.body);

  constructor(scene: THREE.Scene) {
    this.position.set(32, 20, 32);
    scene.add(this.camera);
    scene.add(this.cameraHelper);
  
    document.addEventListener('keydown', this.onkeydown.bind(this));
    document.addEventListener('keyup', this.onkeyup.bind(this));
  
    this.boundsHelper = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
      new THREE.MeshBasicMaterial({wireframe: true})
    );
    scene.add(this.boundsHelper);
  }

  get worldVelocity() {
    this.#worldVelocity.copy(this.velocity);
    this.#worldVelocity.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
    return this.#worldVelocity;
  }

  applyWorldVelocity(dv: THREE.Vector3) {
    dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
    this.velocity.add(dv);
  }

  applyInput(dt: number) {
    if (this.controls.isLocked) {
      this.velocity.x = this.input.x;
      this.velocity.z = this.input.z;
      this.controls.moveRight(this.velocity.x * dt);
      this.controls.moveForward(this.velocity.z * dt);
      this.position.y += this.velocity.y * dt;
      document.getElementById('player-position')!.textContent = this.toString();
    }
  }


  updateBoundsHelper() {
    this.boundsHelper.position.copy(this.position);
    this.boundsHelper.position.y -= this.height / 2;
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
        this.position.set(32, 10, 32);
        this.velocity.set(0, 0, 0);
        break;
      case ' ':
        if (this.onGround) {
          this.velocity.y += this.jumpSpeed;
        }
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

