import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { World } from "./world";

export function createUI(world: World) {
  const gui = new GUI();

  gui.add(world.size, 'width', 8, 128, 1);
  gui.add(world.size, 'height', 8, 128, 1);
  gui.add(world, 'generate');

  gui.onChange(() => {
    world.generate();
  });
}