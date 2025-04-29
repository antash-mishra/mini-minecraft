import * as THREE from 'three';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

/**
 * Represents a voxel-based 3D world composed of blocks.
 * Extends THREE.Group to manage blocks as a collective unit in the scene.
 */
export class World extends THREE.Group {

  /**
   * Size configuration for the world.
   * @property {number} width - Width of the world in blocks.
   * @property {number} height - Height of the world in blocks.
   */
  public size: {width: number, height: number};

/**
 * Stores data about each block in the world in a 3D array structure.
 * @type {Array<Array<Array<{id: number, instanceId: number|null}>>>}
 */
  data: Array<Array<Array<{id: number, instanceId: number|null}>>> = [];

  /**
   * Creates a new World instance.
   * @param {Object} size - Dimensions of the world.
   * @param {number} size.width - Width of the world in blocks (default: 32).
   * @param {number} size.height - Height of the world in blocks (default: 32).
   */
  constructor(size = {width: 32, height: 32}) {
    super();
    this.size = size;
  }

  generate() {
    this.generateTerrain();
    this.generateMeshes();
  }

  generateTerrain() {
    this.data = [];
    for (let x=0; x < this.size.width; x++) {
      const slice = [];
      for (let y =0; y < this.size.height; y++) {
        const row = [];
        for (let z =0; z < this.size.width; z++) {
          row.push({
            id: 1,
            instanceId: null
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  /**
   * Generates the world by creating blocks according to the defined size.
   * Clears any existing blocks before generating new ones.
   * Uses THREE.InstancedMesh for efficient rendering of many identical blocks.
   */
  generateMeshes() {
    // clear all existing blocks
    this.clear();

    // number of blocks in the world
    const max_count = this.size.width * this.size.height * this.size.width;
    const mesh = new THREE.InstancedMesh(geometry, material, max_count)  
    mesh.count = 0;
    const matrix = new THREE.Matrix4();
    for (let x=0; x < this.size.width; x++) {
      for (let y =0; y < this.size.height; y++) {
        for (let z =0; z < this .size.width; z++) {
          matrix.setPosition(x+0.5, y+0.5, z+0.5);
          mesh.setMatrixAt(mesh.count++, matrix);
        }
      }
    }
    this.add(mesh);
  }
}  