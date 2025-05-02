import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { RNG } from './rng.ts';
import { blocks, resources } from './blocks.ts';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial();

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
   * Configuration parameters for world generation.
   * @property {number} seed - Random seed for terrain generation.
   * @property {Object} terrain - Terrain generation settings.
   * @property {number} terrain.scale - Controls the smoothness/size of simplex noise (higher = smoother).
   * @property {number} terrain.magnitude - Controls the height variation of terrain (0-1).
   * @property {number} terrain.offset - Base height offset for the terrain (0-1).
   */
  params = {
    seed: 0,
    terrain: {
      // smoothness or size of simplex noise
      scale: 30,
      // size of terrain
      magnitude: 0.5,
      // offset of terrain
      offset:0.2
    }
  };

  /**
   * Creates a new World instance.
   * @param {Object} size - Dimensions of the world.
   * @param {number} size.width - Width of the world in blocks (default: 32).
   * @param {number} size.height - Height of the world in blocks (default: 32).
   */
  constructor(size = {width: 64, height: 32}) {
    super();
    this.size = size;
  }

  generateResources(rng: RNG) {
    // generating 3d noise
    const simplex = new SimplexNoise(rng);
    resources.forEach(resource => {
      for (let x=0; x < this.size.width; x++) {
        for (let y=0; y < this.size.height; y++) {
          for (let z=0; z < this.size.width; z++) {
            const values = simplex.noise3d(
              x / resource.scale.x, 
              y / resource.scale.y,
              z / resource.scale.z
            );

            if (values  > resource.scarcity) {
              this.setBlockId(x, y, z, resource.id);
            }
          }
        }
      }
    });
  }

  /**
   * Main method to generate the world.
   * Initializes terrain data structure, generates terrain based on simplex noise,
   * and creates the 3D mesh representation.
   */
  generate() {
    const rng: RNG = new RNG(this.params.seed);
    this.initializeTerrain();
    this.generateResources(rng);
    this.generateTerrain(rng);
    this.generateMeshes();
  }

  /**
   * Initializing world terrain data.
   * Creates a 3D array filled with empty blocks to represent the world.
  */
  initializeTerrain() {
    this.data = [];
    for (let x=0; x < this.size.width; x++) {
      const slice = [];
      for (let y =0; y < this.size.height; y++) {
        const row = [];
        for (let z =0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  /**
   * Generates terrain using simplex noise.
   * Creates a heightmap based on noise values and places blocks accordingly.
   * Dirt blocks are placed below the surface, and grass blocks on top.
   */
  generateTerrain(rng: RNG) {

    const simplex = new SimplexNoise(rng);
    
    for (let x=0; x < this.size.width; x++) {
      for (let z=0; z < this.size.width; z++) {
        const value = simplex.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );

        // scale the noise to the desired magnitude and offset
        const scaledNoise = this.params.terrain.offset + 
          value * this.params.terrain.magnitude;

        // calculate the height of the terrain
        let height = Math.floor(this.size.height * scaledNoise);
        
        // clamp height to the world size
        height = Math.max(0, Math.min(height, this.size.height - 1));

        // set the block id for the generated terrain
        for (let y=0; y <= this.size.height; y++) {
          if (y < height && this.getBlock(x, y, z)?.id === blocks.empty.id) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else if (y === height) {
            this.setBlockId(x, y, z, blocks.grass.id);
          } else if (y > height) {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
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
    
    
    const meshes = {};
    
    Object.values(blocks)
      .filter(blockType => blockType.id !== blocks.empty.id)
      .forEach(blockType => {
        // Check if blockType has material property before accessing it
        if ('material' in blockType) {
          const mesh = new THREE.InstancedMesh(geometry, blockType.material, max_count);
          mesh.count = 0;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          meshes[blockType.id] = mesh;
        }
      });

    const matrix = new THREE.Matrix4();
    for (let x=0; x < this.size.width; x++) {
      for (let y =0; y < this.size.height; y++) {
        for (let z =0; z < this .size.width; z++) {
          // get block
          const blockId = this.getBlock(x, y, z)?.id;
          // get current instance id
          
          if (blockId === blocks.empty.id) {
            continue;
          }

          const mesh = meshes[blockId];
          const instanceId = mesh.count;

          // if block is non-empty, set the matrix and instance id
          if (!this.isBlockObscured(x, y, z)) {
            matrix.setPosition(x+0.5, y+0.5, z+0.5);
            mesh.setMatrixAt(instanceId, matrix);
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }
    // add the instanced mesh to the world
    this.add(...Object.values(meshes));
  }

  /**
   * Retrieves the block data at the specified coordinates.
   * @param {number} x - The x-coordinate of the block.
   * @param {number} y - The y-coordinate of the block.
   * @param {number} z - The z-coordinate of the block.
   * @returns {Object|null} The block data or null if out of bounds.
   */
  getBlock(x: number, y: number, z: number) { 
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    }
    return null;
  }

  /**
   * Sets the ID for a block at the specified coordinates.
   * @param {number} x - The x-coordinate of the block.
   * @param {number} y - The y-coordinate of the block.
   * @param {number} z - The z-coordinate of the block.
   * @param {number} id - The ID to set.
   */
  setBlockId(x: number, y: number, z: number, id: number) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  /**
   * Sets the instance ID for a block at the specified coordinates.
   * @param {number} x - The x-coordinate of the block.
   * @param {number} y - The y-coordinate of the block.
   * @param {number} z - The z-coordinate of the block.
   * @param {number} instanceId - The instance ID to set.
   */
  setBlockInstanceId(x: number, y: number, z: number, instanceId: number) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  /**
   * Checks if the given coordinates are within the bounds of the world.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} z - The z-coordinate.
   * @returns {boolean} True if the coordinates are within bounds, false otherwise.
   */
  inBounds(x: number, y: number, z: number) {
    if (x >= 0 && x < this.size.width &&
        y >= 0 && y < this.size.height &&
        z >= 0 && z < this.size.width) {
      return true;
    }
    return false;
  }

  /**
   * Determines if a block is completely surrounded by other blocks.
   * A block is considered obscured if all six adjacent blocks (up, down, left, right, front, back)
   * are non-empty blocks. Obscured blocks are not rendered for performance optimization.
   * 
   * @param {number} x - The x-coordinate of the block.
   * @param {number} y - The y-coordinate of the block.
   * @param {number} z - The z-coordinate of the block.
   * @returns {boolean} True if the block is completely obscured, false if at least one face is visible.
   */
  isBlockObscured(x: number, y: number, z: number) {
    const up = this.getBlock(x, y+1, z)?.id ?? blocks.empty.id;
    const down = this.getBlock(x, y-1, z)?.id ?? blocks.empty.id;
    const front = this.getBlock(x, y, z+1)?.id ?? blocks.empty.id;
    const back = this.getBlock(x, y, z-1)?.id ?? blocks.empty.id;
    const left = this.getBlock(x-1, y, z)?.id ?? blocks.empty.id;
    const right = this.getBlock(x+1, y, z)?.id ?? blocks.empty.id;
    
    if (up === blocks.empty.id || down === blocks.empty.id ||
        front === blocks.empty.id || back === blocks.empty.id ||
        left === blocks.empty.id || right === blocks.empty.id) {
      return false;
    }
    return true;
  }
}  