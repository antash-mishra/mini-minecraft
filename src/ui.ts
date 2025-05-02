import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { World } from "./world";
import { resources } from "./blocks";



export function createUI(world: World) {
  const gui = new GUI();

  gui.add(world.size, 'width' as keyof typeof world.size, 8, 128, 1).name('width');
  gui.add(world.size, 'height' as keyof typeof world.size, 8, 128, 1).name('height');

  const terrainFolder = gui.addFolder('Terrain');
  terrainFolder.add(world.params, 'seed', 0, 10000).name('seed');
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('scale');
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('magnitude');
  terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('offset');
  
  const resourcesFolder = gui.addFolder('Resources');
  
  resources.forEach(resource => {
    const resourceFolder = resourcesFolder.addFolder(resource.name);
    resourceFolder.add(resource, 'scarcity', 0, 1).name('scarcity');
    const scaleFolder = resourceFolder.addFolder('scale');
    scaleFolder.add(resource.scale, 'x', 10, 100).name('x');
    scaleFolder.add(resource.scale, 'y', 10, 100).name('y');
    scaleFolder.add(resource.scale, 'z', 10, 100).name('z');
  });

  gui.onChange(() => {
    world.generate();
  });
}