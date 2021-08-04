import { Vector3D } from "./Game";
import { randInt } from "three/src/math/MathUtils";
import { VoxelWorld } from "./VoxelWorld";
import { BufferGeometry, MeshLambertMaterial, Mesh, BufferAttribute } from "three";

interface BlockData {
    dimensions: number[][][];
    center: number[];
}

export class Block {
    dimensions: number[][][];
    center: Vector3D;
    static blockTypes: BlockData[] = [];
    location: Vector3D;
    geometry: BufferGeometry;
    material: MeshLambertMaterial;
    mesh: Mesh;

    normals: number[];
    indices: number[];
    positions: number[];

    constructor(dimensions: number[][][], center: Vector3D, spawnLocation: Vector3D) {
        this.dimensions = dimensions;
        this.center = center;
        this.location = JSON.parse(JSON.stringify(spawnLocation));

        this.location.x -= center.x;
        this.location.y -= center.y;
        this.location.z -= center.z;

        this.geometry = new BufferGeometry();

        this.material = new MeshLambertMaterial({ color: 0x373F51 });

        this.mesh = new Mesh(this.geometry, this.material);
    }

    static getRandomBlock(spawnLocation: Vector3D): Block {
        const { center, dimensions } = Block.blockTypes[randInt(0, Block.blockTypes.length - 1)];
        return new Block(dimensions, { x: center[0], y: center[1], z: center[2] }, spawnLocation);
    }

    static async loadBlockDataFromJSON(data: BlockData[]) {
        this.blockTypes = data;
    }

    generateGeometryData() {
        const positions = [];
        const normals = [];
        const indices = [];

        for (let y = 0; y < this.dimensions[0].length; ++y) {
            for (let z = 0; z < this.dimensions[0][0].length; ++z) {
                for (let x = 0; x < this.dimensions.length; ++x) {
                    const cell = this.dimensions[x][y][z];

                    if (cell) {
                        for (const { dir, corners } of VoxelWorld.faces) {
                            const nX = x + dir.x;
                            const nY = y + dir.y;
                            const nZ = z + dir.z;

                            let neighbor;
                            if (nX >= this.dimensions.length || nX < 0 || nY >= this.dimensions[0].length || nY < 0 || nZ >= this.dimensions[0][0].length || nZ < 0)
                                neighbor = undefined;
                            else
                                neighbor = this.dimensions[nX][nY][nZ];

                            if (!neighbor) {
                                // Create face
                                const ndx = positions.length / 3;
                                for (const pos of corners) {
                                    positions.push(pos.x + x + this.location.x, pos.y + y + this.location.y, pos.z + z + this.location.z);
                                    normals.push(dir.x, dir.y, dir.z);
                                }

                                indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                            }
                        }
                    }
                }
            }
        }

        return {
            positions: positions,
            normals: normals,
            indices: indices
        };
    }

    tick() {
        if (this.location.y == 0)
            return;

        console.log(this.location.y)
        this.location.y--;
    }

    rotate() {
        // TODO
    }

    render() {
        const geoData = this.generateGeometryData();
         
        this.positions = geoData.positions;
        this.normals = geoData.normals;
        this.indices = geoData.indices;

        this.geometry.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(this.positions), 3)
        );
        this.geometry.setAttribute(
            'normal',
            new BufferAttribute(new Float32Array(this.normals), 3)
        );
        this.geometry.setIndex(this.indices);

        // console.log(this.positions);
    }
}
