import { Block } from "./Block";

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

    constructor(size: Vector3D) {
        this.size = size;
        this.cells = new Array<Cell>(size.x * size.y * size.z);
        for (let z = 0; z < this.size.z; z++) {
            for (let y = 0; y < this.size.y; y++) {
                for (let x = 0; x < this.size.x; x++) {
                    const hasBlock = Math.sin((x + this.size.x * z) / 100) > y / 10;
                    this.cells[x + y * this.size.x + z * this.size.y * this.size.z] = {
                        location: { x: x, y: y, z: z },
                        hasBlock: hasBlock,
                        colorHex: null,
                    };
                }
            }
        }
    }

    getCell(location: Vector3D) {
        const { x, y, z } = location;
        if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y || z < 0 || z >= this.size.z)
            return undefined;
        return this.cells[x + y * this.size.x + z * this.size.y * this.size.z];
    }

    
}
