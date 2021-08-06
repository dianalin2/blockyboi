import { Game } from "./Game";

interface KeyData {
    isDown: boolean;
    key: string;
    action: (...args: any[]) => void;
    args: any[];
}

export class Controller {
    keysDown: KeyData[];

    constructor(game: Game) {
        document.addEventListener('keydown', (e) => {
            const k = this.keysDown.filter(v => e.key == v.key)[0];
            if (k)
                k.isDown = true;
        });

        document.addEventListener('keyup', (e) => {
            const k = this.keysDown.filter(v => e.key == v.key)[0];
            if (k)
                k.isDown = false;
        });

        this.keysDown = [
            {
                key: 'w',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [0, -1]
            },
            {
                key: 'a',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [-1, 0]
            },
            {
                key: 's',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [0, 1]
            },
            {
                key: 'd',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [1, 0]
            },
            {
                key: 'ArrowLeft',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: 90, z: 0 }]
            },
            {
                key: 'ArrowRight',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: -90, z: 0 }]
            },
            {
                key: 'ArrowUp',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 90, y: 0, z: 0 }]
            },
            {
                key: 'ArrowDown',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: -90, y: 0, z: 0 }]
            },
            {
                key: 'q',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: 0, z: -90 }]
            },
            {
                key: 'e',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: 0, z: 90 }]
            }
        ];

        setInterval(this.keyTick.bind(this), 150);
    }

    keyTick() {
        for (const k of this.keysDown.filter(v => v.isDown)) {
            k.action(...k.args);
        }
    }
}