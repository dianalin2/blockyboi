import { VoxelWorld } from "./VoxelWorld";
import { Block } from "./Block";
import { Scene } from "three";
import { Controller } from "./Controller";

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

        new Controller(this);
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
        if (this.checkCurrentBlockLocation({x: 0, y: -1, z: 0})) {
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

    // Returns true if block would collide
    checkCurrentBlockLocation(offset: Vector3D) {
        for (let x = 0; x < this.currentBlock.dimensions.length; x++) {
            for (let y = 0; y < this.currentBlock.dimensions.length; y++) {
                for (let z = 0; z < this.currentBlock.dimensions[x][y].length; z++) {
                    const cellBelow = this.getCell({
                        x: this.currentBlock.location.x + x + offset.x,
                        y: this.currentBlock.location.y + y + offset.y,
                        z: this.currentBlock.location.z + z + offset.z
                    });
                    if ((this.currentBlock.dimensions[x][y][z] && cellBelow && cellBelow.hasBlock) || this.currentBlock.location.y == 0) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    rotateBlock() {
        this.currentBlock.rotate();
    }

    // Returns old block
    placeBlock() {
        // TODO DISPOSE
        const oldBlock = this.currentBlock;
        this.scene.remove(this.currentBlock.mesh);

        this.queue.push(Block.getRandomBlock(this.defaultSpawnLocation));
        this.currentBlock = this.queue.shift();

        this.scene.add(this.currentBlock.mesh);

        return oldBlock;
    }

    blockIsInBounds(offsetX: number, offsetZ: number) {
        const xPos = this.currentBlock.location.x + offsetX;
        const xSize = this.currentBlock.dimensions.length;

        const zPos = this.currentBlock.location.z + offsetZ;
        const zSize = this.currentBlock.dimensions[0][0].length;

        return xPos >= 0 && xPos + xSize < this.size.x && zPos >= 0 && zPos + zSize < this.size.z;
    }

    translateBlock(x: number, z: number) {
        if (!this.checkCurrentBlockLocation({x: x, y: 0, z: z}) && this.blockIsInBounds(x, z)) {
            this.currentBlock.translate(x, z);
        }
    }
}
