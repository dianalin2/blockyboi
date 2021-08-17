import { VoxelWorld } from "./VoxelWorld";
import { Block } from "./Block";
import { Scene, Object3D } from "three";
import { Controller } from "./Controller";
import { GUI } from "./GUI";

export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface Cell {
    location: Vector3D;
    hasBlock: boolean;
    colorHex: number;
}

export class Game {
    size: Vector3D;
    cells: Cell[];
    queue: Block[];
    currentBlock: Block;
    world: VoxelWorld;
    defaultSpawnLocation: Vector3D;

    scene: Scene;
    gameObject: Object3D;

    gui: GUI;

    score: number;
    level: number;
    lineNum: number;
    totalLinesCleared: number;

    constructor(size: Vector3D) {
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

        this.gameObject = new Object3D();
        this.gameObject.add(this.world.mesh);
        this.gameObject.add(this.currentBlock.mesh);

        setInterval(this.tick.bind(this), 500);

        new Controller(this);

        this.gui = new GUI('game-gui');

        this.score = 0;
        this.level = 0;
        this.lineNum = 0;
        this.totalLinesCleared = 0;
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
        if (this.checkCurrentBlockLocation({ x: 0, y: -1, z: 0 })) {
            for (const cell of this.currentBlock.cells) {
                const { x, y, z } = cell.location;
                const cellLocation = {
                    x: this.currentBlock.location.x + x,
                    y: this.currentBlock.location.y + y,
                    z: this.currentBlock.location.z + z
                };
                const voxelCell = this.getCell(cellLocation);
                if (voxelCell) {
                    voxelCell.hasBlock = true;
                    voxelCell.colorHex = this.currentBlock.colorHex;
                } else {
                    console.log('lose');
                }
            }

            this.placeBlock();
        } else {
            this.currentBlock.tick();
        }

        let linesCleared = 0;
        for (let y = this.size.y; y >= 0; y--) {
            if (this.shouldClearLayer(y)) {
                linesCleared++;

                for (let yy = y; yy < this.size.y; yy++) {
                    for (let x = 0; x < this.size.x; x++) {
                        for (let z = 0; z < this.size.z; z++) {
                            const cell = this.getCell({ x: x, y: yy, z: z });
                            const cellAbove = this.getCell({ x: x, y: yy + 1, z: z });
                            if (!cellAbove) {
                                cell.hasBlock = false;
                            } else {
                                cell.hasBlock = cellAbove.hasBlock;
                                cell.colorHex = cellAbove.colorHex;
                            }
                        }
                    }
                }
            }
        }

        // Update score
        this.score += Game.calculateScore(linesCleared, this.level);
        this.totalLinesCleared += linesCleared;
        const { level, lineNum } = Game.calculateLevel(this.totalLinesCleared);
        this.level = level;
        this.lineNum = lineNum;

        this.gui.updateScore(this.score);
        this.gui.updateLevel(this.level, this.lineNum);
    }

    shouldClearLayer(y: number) {
        for (let x = 0; x < this.size.x; x++) {
            for (let z = 0; z < this.size.z; z++) {
                const cell = this.getCell({ x: x, y: y, z: z });
                if (!cell || !cell.hasBlock) {
                    return false;
                }
            }
        }

        return true;
    }

    // Returns true if block would collide
    checkCurrentBlockLocation(offset: Vector3D) {
        if (this.currentBlock.location.y + this.currentBlock.lowerBound.y + offset.y <= 0) {
            return true;
        }

        for (const cell of this.currentBlock.cells) {
            const { x, y, z } = cell.location;
            const cellLocation = {
                x: this.currentBlock.location.x + x + offset.x,
                y: this.currentBlock.location.y + y + offset.y,
                z: this.currentBlock.location.z + z + offset.z
            };
            const voxelCell = this.getCell(cellLocation);
            if (voxelCell && voxelCell.hasBlock) {
                return true;
            }
        }

        return false;
    }

    rotateBlock(angle: Vector3D) {
        this.currentBlock.rotate(angle);

        const { x, y, z } = this.currentBlock.location;
        const { x: minX, y: minY, z: minZ } = this.currentBlock.lowerBound;
        const { x: maxX, y: maxY, z: maxZ } = this.currentBlock.upperBound;
        this.currentBlock.location.x = Math.min(this.size.x - maxX - 1, Math.max(-minX, x));
        this.currentBlock.location.y = Math.min(this.size.y - maxY - 1, Math.max(-minY, y));
        this.currentBlock.location.z = Math.min(this.size.z - maxZ - 1, Math.max(-minZ, z));

        if (this.checkCurrentBlockLocation({ x: 0, y: 0, z: 0 })) {
            this.currentBlock.rotate({ x: -angle.x, y: -angle.y, z: -angle.z });
            this.currentBlock.location = { x: x, y: y, z: z };
        }
    }

    // Returns old block
    placeBlock() {
        // TODO DISPOSE
        const oldBlock = this.currentBlock;
        this.gameObject.remove(this.currentBlock.mesh);

        this.queue.push(Block.getRandomBlock(this.defaultSpawnLocation));
        this.currentBlock = this.queue.shift();

        this.gameObject.add(this.currentBlock.mesh);

        return oldBlock;
    }

    isBlockInBounds(offsetX: number, offsetZ: number) {
        const x = this.currentBlock.location.x + offsetX;
        const y = this.currentBlock.location.y;
        const z = this.currentBlock.location.z + offsetZ;
        const { x: minX, y: minY, z: minZ } = this.currentBlock.lowerBound;
        const { x: maxX, y: maxY, z: maxZ } = this.currentBlock.upperBound;

        if (x + minX < 0 || x + maxX >= this.size.x || z + minZ < 0 || z + maxZ >= this.size.z)
            return false;

        return true;
    }

    translateBlock(x: number, z: number) {
        if (!this.checkCurrentBlockLocation({ x: x, y: 0, z: z }) && this.isBlockInBounds(x, z)) {
            this.currentBlock.translate(x, z);
        }
    }

    static scores = [40, 100, 300, 1200]

    static calculateScore(linesCleared: number, level: number) {
        if (linesCleared < 1 || linesCleared > 4)
            return 0;
        return Game.scores[linesCleared - 1] * (level + 1);
    }

    static calculateLevel(lines: number) {
        return { level: Math.floor(lines / 10), lineNum: lines % 10 };
    }
}
