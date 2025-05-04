import * as THREE from 'three';
import { Player } from './player';
import { World } from './world';
import { blocks } from './blocks';

const collisionMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000, 
  transparent: true,
  opacity: 0.2
});

const collisionGeometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);

const contactGeometry = new THREE.SphereGeometry(0.05, 6, 6);
const contactMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
});

export class Physics {
  simulationRate = 200;
  timeStep = 1 / this.simulationRate;
  accumulator = 0;

  gravity = 32;
  private helpers: THREE.Group;
  
  constructor(scene: THREE.Scene) {
    this.helpers = new THREE.Group();
    scene.add(this.helpers);
  }


  update(dt: number, player: Player, world: World) {
    this.accumulator += dt;
    while (this.accumulator >= this.timeStep) {
      player.velocity.y -= this.gravity * this.timeStep;
      player.applyInput(this.timeStep);
      player.updateBoundsHelper();
      this.detectCollisions(player, world);   
      this.accumulator -= this.timeStep;
    }
  }

  detectCollisions(player: Player, world: World) {
    player.onGround = false;
    this.helpers.clear();
    
    // Check for collisions
    const candidates = this.broadPhase(player, world);

    // calculates collision point, overlap and normal
    const collisions = this.narrowPhase(candidates, player);
    
    // // process each collision and adjust position and velocity
    if (collisions.length > 0) {
      this.resolveCollisions(collisions, player);
    }
  }

  broadPhase(player: Player, world: World) {
    const candidates = [];
    
    // get extent of player's bounding box
    const extents = {
      x: {
        min: Math.floor(player.position.x - player.radius),
        max: Math.ceil(player.position.x + player.radius),
      },
      y: {
        min: Math.floor(player.position.y - player.height),
        max: Math.ceil(player.position.y),
      },

      z: {
        min: Math.floor(player.position.z - player.radius),
        max: Math.ceil(player.position.z + player.radius),
      },
    }

    for (let x = extents.x.min; x <= extents.x.max; x++) {
      for (let y = extents.y.min; y <= extents.y.max; y++) {
        for (let z = extents.z.min; z <= extents.z.max; z++) {
          const blockId = world.getBlock(x, y, z)?.id;
          if (blockId && blockId !== blocks.empty.id) {
            const blockPos = {x, y,z};
            candidates.push(blockPos);
            this.addCollisionHelper(blockPos);
          } 
        }
      }
    }

    console.log(`Found ${candidates.length} candidates`);
    return candidates;
  }

  // narrows down the candidates to the actual collisions
  narrowPhase(candidates: {x: number, y: number, z: number}[], player: Player) {
    const collisions = [];

    for (const block of candidates) {
      // get point on block closest to player
      const playerPos = player.position;
      const closestPoint = {
        x: Math.max(block.x - 0.5, Math.min(block.x + 0.5, playerPos.x)),
        y: Math.max(block.y - 0.5, Math.min(block.y + 0.5, player.position.y - (player.height / 2))),
        z: Math.max(block.z - 0.5, Math.min(block.z + 0.5, playerPos.z)),
      }

      // Determine if the closest point is within the player's bounding radius
      const dx = closestPoint.x - playerPos.x;
      const dy = closestPoint.y - (playerPos.y - (player.height/2));
      const dz = closestPoint.z - playerPos.z;

      if (this.pointInPlayerBoundingCylinder(closestPoint, player)) {
        // compute contact point, normal and penetration depth
        const contactPoint = closestPoint;
        
        const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);
        const overlapY = player.height / 2 - Math.abs(dy);
        
        let normal;
        let penetrationDepth;

        if (overlapY < overlapXZ) {
          // collision is along y-axis
          normal = new THREE.Vector3(0, -Math.sign(dy), 0);
          penetrationDepth = overlapY;
          player.onGround = true;
        } else {
          // collision is along xz-plane
          normal = new THREE.Vector3(-dx, 0, -dz).normalize();
          penetrationDepth = overlapXZ;
        }
        
        collisions.push({
          block,
          contactPoint,
          normal,
          overlap: penetrationDepth
        })

        this.addContactPointHelper(closestPoint);
      }
    }

    return collisions;

  }

  resolveCollisions(
    collisions: {
      block: {x: number, y: number, z: number}, 
      contactPoint: {x: number, y: number, z: number}, 
      normal: THREE.Vector3, 
      overlap: number
    }[], 
    player: Player
  ) {

    // sort collisions by penetration depth
    collisions.sort((a, b) => {
      return a.overlap < b.overlap;
    });

    // Adjust player position based on collision
    for (const collision of collisions) {

      // skip if the contact point is not in the player's bounding cylinder
      if (!this.pointInPlayerBoundingCylinder(collision.contactPoint, player)) continue;

      let deltaPosition = collision.normal.clone();
      deltaPosition.multiplyScalar(collision.overlap);
      player.position.add(deltaPosition);

      // negate players velocity in the direction of the collision normal
      // Get magnitude of player velocity in the direction of the collision normal
      let magnitude = player.worldVelocity.dot(collision.normal);
      // Remove the magnitude from the players velocity
      let velocityAdjustment = collision.normal.clone().multiplyScalar(magnitude);
      // apply the velocity to player
      player.applyWorldVelocity(velocityAdjustment.negate());
      
    }
    
  }

  


  addContactPointHelper(p) {
    const contactMesh = new THREE.Mesh(
      contactGeometry,
      contactMaterial
    )
    contactMesh.position.copy(p);
    this.helpers.add(contactMesh);
  }

  addCollisionHelper(block: {x: number, y: number, z: number}) {
    const blockMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
    console.log(blockMesh.material);
    blockMesh.position.copy(block);
    this.helpers.add(blockMesh);

  }

  pointInPlayerBoundingCylinder(p, player) {
    const dx = p.x - player.position.x;
    const dy = p.y - (player.position.y - (player.height/2));
    const dz = p.z - player.position.z;

    return dx * dx + dz * dz <= player.radius * player.radius && Math.abs(dy) < player.height / 2;
  }
}
