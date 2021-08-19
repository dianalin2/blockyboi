import { Cell, Vector3D } from "./Game";
import { randInt } from "three/src/math/MathUtils";
import { VoxelWorld } from "./VoxelWorld";
import { BufferGeometry, MeshLambertMaterial, Mesh, BufferAttribute } from "three";

interface BlockData {
    dimensions: number[][][];
    center: number[];
    colorHex: string;
}

export class Block {
    center: Vector3D;
    cells: Cell[] = [];
    size: Vector3D;
    lowerBound: Vector3D;
    upperBound: Vector3D;
    static blockTypes: BlockData[] = [];
    location: Vector3D;
    geometry: BufferGeometry;
    material: MeshLambertMaterial;
    mesh: Mesh;

    normals: number[];
    indices: number[];
    positions: number[];

    colorHex: number;

    constructor(dimensions: number[][][], center: Vector3D, spawnLocation: Vector3D, colorHex: number, opacity = 1) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        for (let x = 0; x < dimensions.length; x++) {
            for (let y = 0; y < dimensions[x].length; y++) {
                for (let z = 0; z < dimensions[x][y].length; z++) {
                    if (dimensions[x][y][z]) {
                        this.cells.push({ location: { x: x, y: y, z: z }, hasBlock: true, colorHex: colorHex });

                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        minZ = Math.min(minZ, z);

                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                        maxZ = Math.max(maxZ, z);
                    }
                }
            }
        }

        this.size = { x: maxX, y: maxY, z: maxZ };
        this.lowerBound = { x: minX, y: minY, z: minZ };
        this.upperBound = { x: maxX, y: maxY, z: maxZ };

        this.center = center;
        this.location = JSON.parse(JSON.stringify(spawnLocation));

        this.location.x -= center.x;
        this.location.y -= center.y;
        this.location.z -= center.z;

        this.geometry = new BufferGeometry();

        this.material = new MeshLambertMaterial({ color: colorHex, opacity: opacity });
        this.colorHex = colorHex;

        this.mesh = new Mesh(this.geometry, this.material);
    }

    static getRandomBlock(spawnLocation: Vector3D): Block {
        const { center, dimensions, colorHex } = Block.blockTypes[randInt(0, Block.blockTypes.length - 1)];
        return new Block(dimensions, { x: center[0], y: center[1], z: center[2] }, spawnLocation, parseInt(colorHex, 16));
    }

    static async loadBlockDataFromJSON(data: BlockData[]) {
        this.blockTypes = data;
    }

    static serializeCell(cell: Cell) {
        return `${cell.location.x}-${cell.location.y}-${cell.location.z}`;
    }

    generateGeometryData() {
        const positions = [];
        const normals = [];
        const indices = [];

        for (const cell of this.cells) {
            for (const { dir, corners } of VoxelWorld.faces) {
                const nX = cell.location.x + dir.x;
                const nY = cell.location.y + dir.y;
                const nZ = cell.location.z + dir.z;
                
                let hasNeighbor = false;
                for (const possN of this.cells) {
                    if (possN.location.x == nX && possN.location.y == nY && possN.location.z == nZ) {
                        hasNeighbor = true;
                        break;
                    }
                }

                if (!hasNeighbor) {
                    // Create face
                    const ndx = positions.length / 3;
                    for (const pos of corners) {
                        positions.push(pos.x + cell.location.x + this.location.x, pos.y + cell.location.y + this.location.y, pos.z + cell.location.z + this.location.z);
                        normals.push(dir.x, dir.y, dir.z);
                    }

                    indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
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

        this.location.y--;
    }

    translate(x: number, z: number) {
        this.location.x += x;
        this.location.z += z;
    }

    rotate(angle: Vector3D) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        for (const cell of this.cells) {
            const cosa = Math.cos(Block.toRadians(angle.z));
            const sina = Math.sin(Block.toRadians(angle.z));

            const cosb = Math.cos(Block.toRadians(angle.y));
            const sinb = Math.sin(Block.toRadians(angle.y));

            const cosc = Math.cos(Block.toRadians(angle.x));
            const sinc = Math.sin(Block.toRadians(angle.x));

            var Axx = cosa * cosb;
            var Axy = cosa * sinb * sinc - sina * cosc;
            var Axz = cosa * sinb * cosc + sina * sinc;

            var Ayx = sina * cosb;
            var Ayy = sina * sinb * sinc + cosa * cosc;
            var Ayz = sina * sinb * cosc - cosa * sinc;

            var Azx = -sinb;
            var Azy = cosb * sinc;
            var Azz = cosb * cosc;


            const xFromOrigin = cell.location.x - this.center.x;
            const yFromOrigin = cell.location.y - this.center.y;
            const zFromOrigin = cell.location.z - this.center.z;

            const newX = Math.round(Axx * xFromOrigin + Axy * yFromOrigin + Axz * zFromOrigin + this.center.x);
            const newY = Math.round(Ayx * xFromOrigin + Ayy * yFromOrigin + Ayz * zFromOrigin + this.center.y);
            const newZ = Math.round(Azx * xFromOrigin + Azy * yFromOrigin + Azz * zFromOrigin + this.center.z);

            cell.location = { x: newX, y: newY, z: newZ };

            minX = Math.min(minX, newX);
            minY = Math.min(minY, newY);
            minZ = Math.min(minZ, newZ);

            maxX = Math.max(maxX, newX);
            maxY = Math.max(maxY, newY);
            maxZ = Math.max(maxZ, newZ);
        }

        this.lowerBound = { x: minX, y: minY, z: minZ };
        this.upperBound = { x: maxX, y: maxY, z: maxZ };
    }

    static toRadians(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    render() {
        // TODO DISPOSE
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
    }
}
