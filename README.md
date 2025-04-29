# Mini-Minecraft

A voxel-based sandbox game inspired by Minecraft, built with TypeScript, Three.js, and Vite.

## Features

- **3D Voxel World**: Rendered using Three.js with efficient instanced mesh rendering
- **Procedural Terrain Generation**: Using Simplex noise to create landscapes
- **Block Types**: Different block types (grass, dirt, etc.) with distinct appearances
- **Interactive Camera**: Orbit controls for navigating the 3D world
- **Customizable World Parameters**: UI controls to adjust terrain generation settings
  - World size adjustment
  - Terrain scale (controls smoothness)
  - Terrain magnitude (controls height variation)
  - Terrain offset (controls base height)
- **Seeded World Generation**: Generate the same world multiple times using a seed value

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mini-minecraft.git
cd mini-minecraft
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to http://localhost:5173

## Implementation Details

- **World Generation**: The world is represented as a 3D array of block data
- **Rendering Optimization**: Only blocks with at least one visible face are rendered
- **Interactive UI**: Built with lil-gui for adjusting terrain parameters
- **Reproducible Worlds**: Custom random number generator (RNG) class for seeded procedural generation

## Controls

- **Left Mouse Button + Drag**: Rotate camera
- **Right Mouse Button + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out

## Planned Features

- [ ] **Terrain Resources**: Add ores, trees, and other resources to the world
- [ ] **Infinite Terrain**: Generate terrain dynamically as player moves
- [ ] **Player Character**: Add player movement and interaction with the world
- [ ] **Block Interaction**: Place and break blocks in the world
- [ ] **Physics**: Add gravity and collision detection
- [ ] **Day/Night Cycle**: Implement a dynamic lighting system
- [ ] **Water and Fluids**: Add fluid simulation
- [ ] **Ambient Sound**: Background music and environmental sounds
