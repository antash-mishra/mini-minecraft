import * as THREE from 'three';
import { WorldChunk } from './worldChunk';
import { Player } from './player';

export class World extends THREE.Group {

  public chunkSize: {width: number, height: number} = {width: 64, height: 32};
  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2
    }
  }
  seed: number;

  constructor(seed = 0) {
    super();
    this.seed = seed;
  }

  generate() {
    this.disposeChunks();

    for (let x = -1; x <= 1; x++) {
      for (let z=-1; z <= 1; z++) {
        const chunk = new WorldChunk(this.chunkSize, this.params);
        chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
        chunk.userData = {x, z};
        chunk.generate();
        this.add(chunk);
      }
    }
  }

  update(player: Player) {
    
  }

  getBlock(x: number, y: number, z: number) {
    const coords = this.worldToChunkCoords(x, y, z);
    if (!coords) {
      return null;
    }
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
    if (chunk) {
      return chunk.getBlock(coords.block.x, coords.block.y, coords.block.z);
    } else {
      return null;
    }
  }


  worldToChunkCoords(x: number, y: number, z: number) {
    const chunkCoords = {
      x: Math.floor(x / this.chunkSize.width),
      z: Math.floor(z / this.chunkSize.width)
    }
    console.log(chunkCoords, x, z);
    const blockCoords = {
      x: x - (chunkCoords.x * this.chunkSize.width),
      y: y,
      z: z - (chunkCoords.z * this.chunkSize.width)
    }
    return {chunk: chunkCoords, block: blockCoords};
  }
  getChunk(chunkX: number, chunkZ: number) : WorldChunk | null {
    return (this.children.find(child =>
      child.userData.x === chunkX && child.userData.z === chunkZ
    ) as WorldChunk) || null;
  }


  disposeChunks() {
    this.traverse(chunk => {
      if (chunk instanceof WorldChunk) {
        chunk.disposeInstances();
      }
    });
    this.clear();
  }
}