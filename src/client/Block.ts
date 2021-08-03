import { randInt } from "three/src/math/MathUtils";

export class Block {
    dimensions: number[][][];
    static blocks: Block[] = [];

    constructor(dimensions: number[][][]) {
        Block.blocks.push(this);
        this.dimensions = dimensions;
    }

    static getRandomBlock() : Block {
        return Block.blocks[randInt(0, Block.blocks.length)]
    }
}