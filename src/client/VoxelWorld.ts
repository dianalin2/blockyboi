import { BufferAttribute, BufferGeometry, Mesh, MeshLambertMaterial } from "three";
import { Game, Vector3D } from "./Game";

export class VoxelWorld {
    size: Vector3D;
    game: Game;
    geometry: BufferGeometry;
    material: MeshLambertMaterial;
    mesh: Mesh;

    static faces = [
        {
            // Left
            dir: { x: -1, y: 0, z: 0 },
            corners: [
                { x: 0, y: 1, z: 0 },
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 1, z: 1 },
                { x: 0, y: 0, z: 1 }
            ]
        },
        {
            // Right
            dir: { x: 1, y: 0, z: 0 },
            corners: [
                { x: 1, y: 1, z: 1 },
                { x: 1, y: 0, z: 1 },
                { x: 1, y: 1, z: 0 },
                { x: 1, y: 0, z: 0 }
            ]
        },
        {
            // Bottom
            dir: { x: 0, y: -1, z: 0 },
            corners: [
                { x: 1, y: 0, z: 1 },
                { x: 0, y: 0, z: 1 },
                { x: 1, y: 0, z: 0 },
                { x: 0, y: 0, z: 0 }
            ]
        },
        {
            // Top
            dir: { x: 0, y: 1, z: 0 },
            corners: [
                { x: 0, y: 1, z: 1 },
                { x: 1, y: 1, z: 1 },
                { x: 0, y: 1, z: 0 },
                { x: 1, y: 1, z: 0 }
            ]
        },
        {
            // Back
            dir: { x: 0, y: 0, z: -1 },
            corners: [
                { x: 1, y: 0, z: 0 },
                { x: 0, y: 0, z: 0 },
                { x: 1, y: 1, z: 0 },
                { x: 0, y: 1, z: 0 }
            ]
        },
        {
            // Front
            dir: { x: 0, y: 0, z: 1 },
            corners: [
                { x: 0, y: 0, z: 1 },
                { x: 1, y: 0, z: 1 },
                { x: 0, y: 1, z: 1 },
                { x: 1, y: 1, z: 1 }
            ]
        },
    ];

    constructor(game: Game) {
        this.game = game;
        this.size = game.size;

        this.geometry = new BufferGeometry();
        this.material = new MeshLambertMaterial({ vertexColors: true });
        this.mesh = new Mesh(this.geometry, this.material);
    }

    render() {
        // TODO DISPOSE
        const { positions, normals, indices, colors } = this.generateGeometryData();

        this.geometry.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(positions), 3)
        );
        this.geometry.setAttribute(
            'normal',
            new BufferAttribute(new Float32Array(normals), 3)
        );

        this.geometry.setAttribute(
            'color',
            new BufferAttribute(new Uint8Array(colors), 3, true)
        );

        this.geometry.setIndex(indices);
    }

    generateGeometryData() {
        const positions = [];
        const normals = [];
        const indices = [];
        const colors = [];

        for (let y = 0; y < this.size.y; ++y) {
            for (let z = 0; z < this.size.z; ++z) {
                for (let x = 0; x < this.size.x; ++x) {
                    const cell = this.game.getCell({ x: x, y: y, z: z });

                    if (cell.hasBlock) {
                        for (const { dir, corners } of VoxelWorld.faces) {
                            const neighbor = this.game.getCell({
                                x: x + dir.x,
                                y: y + dir.y,
                                z: z + dir.z
                            });

                            if (!neighbor || !neighbor.hasBlock) {
                                // Create face
                                const ndx = positions.length / 3;
                                for (const pos of corners) {
                                    positions.push(pos.x + x, pos.y + y, pos.z + z);
                                    normals.push(dir.x, dir.y, dir.z);
                                    colors.push((cell.colorHex >> 16) % 256, (cell.colorHex >> 8) % 256, (cell.colorHex >> 0) % 256);
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
            indices: indices,
            colors: colors
        };
    }
}
