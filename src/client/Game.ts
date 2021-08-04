import { VoxelWorld } from "./VoxelWorld";
import { Block } from "./Block";
import { Scene } from "three";

export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface Cell {
    location: Vector3D;
    hasBlock: boolean;
    colorHex: string;
}

export class Game {
    size: Vector3D;
    cells: Cell[];
    queue: Block[];
    currentBlock: Block;
    world: VoxelWorld;
    defaultSpawnLocation: Vector3D;

    scene: Scene;

    constructor(size: Vector3D, scene: Scene) {
        this.size = size;
        this.cells = new Array<Cell>(size.x * size.y * size.z);
        for (let z = 0; z < this.size.z; z++) {
            for (let y = 0; y < this.size.y; y++) {
                for (let x = 0; x < this.size.x; x++) {
                    this.cells[x + y * this.size.x + z * this.size.y * this.size.z] = {
                        location: { x: x, y: y, z: z },
                        hasBlock: false,
                        colorHex: null,
                    };
                }
            }
        }

        this.defaultSpawnLocation = { x: Math.floor(this.size.x / 2), y: this.size.y, z: Math.floor(this.size.z / 2) }

        this.currentBlock = Block.getRandomBlock(this.defaultSpawnLocation);
        this.queue = [Block.getRandomBlock(this.defaultSpawnLocation)];

        this.world = new VoxelWorld(this);

        this.scene = scene;
        this.scene.add(this.world.mesh);
        this.scene.add(this.currentBlock.mesh);

        setInterval(this.tick.bind(this), 300);
    }

    render() {
        this.world.render();

        this.currentBlock.render();
    }

    getCell(location: Vector3D) {
        const { x, y, z } = location;
        if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y || z < 0 || z >= this.size.z)
            return undefined;
        return this.cells[x + y * this.size.x + z * this.size.y * this.size.z];
    }

    tick() {
        const { shouldPlaceDown, oldBlock } = this.checkCurrentBlockLocation();
        if (shouldPlaceDown) {
            oldBlock.location
            for (let x = 0; x < this.currentBlock.dimensions.length; x++) {
                for (let y = 0; y < this.currentBlock.dimensions[x].length; y++) {
                    for (let z = 0; z < this.currentBlock.dimensions[x][y].length; z++) {
                        if (!this.currentBlock.dimensions[x][y][z])
                            continue;
                        const cell = this.getCell({
                            x: this.currentBlock.location.x + x,
                            y: this.currentBlock.location.y + y,
                            z: this.currentBlock.location.z + z
                        });

                        if (cell)
                            cell.hasBlock = true;
                    }
                }
            }

            this.placeBlock();
        } else {
            this.currentBlock.tick();
        }
    }

    // Returns true if old block is placed
    checkCurrentBlockLocation() {
        for (let x = 0; x < this.currentBlock.dimensions.length; x++) {
            for (let y = 0; y < this.currentBlock.dimensions.length; y++) {
                for (let z = 0; z < this.currentBlock.dimensions[x][y].length; z++) {
                    const cellBelow = this.getCell({
                        x: this.currentBlock.location.x + x,
                        y: this.currentBlock.location.y + y - 1,
                        z: this.currentBlock.location.z + z
                    });
                    if ((this.currentBlock.dimensions[x][y][z] && cellBelow && cellBelow.hasBlock) || this.currentBlock.location.y == 0) {
                        return { shouldPlaceDown: true, oldBlock: this.currentBlock };
                    }
                }
            }
        }

        return { shouldPlaceDown: false, oldBlock: null };
    }

    rotateBlock() {
        this.currentBlock.rotate();
    }

    // Returns old block
    placeBlock() {
        const oldBlock = this.currentBlock;
        this.scene.remove(this.currentBlock.mesh);

        this.queue.push(Block.getRandomBlock(this.defaultSpawnLocation));
        this.currentBlock = this.queue.shift();

        this.scene.add(this.currentBlock.mesh);

        return oldBlock;
    }
}
