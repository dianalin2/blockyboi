import { Game } from "./Game";

interface KeyData {
    isDown: boolean;
    key: string;
    action: (...args: any[]) => void;
    args: any[];
    currentInterval: NodeJS.Timer;
}

export class Controller {
    keysDown: KeyData[];

    constructor(game: Game) {
        document.addEventListener('keydown', (e) => {
            const k = this.keysDown.filter(v => e.key == v.key)[0];
            if (!k || k.currentInterval)
                return;
            k.isDown = true;
            k.action(...k.args);
            k.currentInterval = setInterval(k.action, 150, ...k.args);
        });

        document.addEventListener('keyup', (e) => {
            const k = this.keysDown.filter(v => e.key == v.key)[0];
            if (!k || !k.currentInterval)
                return;
            k.isDown = false;
            clearInterval(k.currentInterval);
            k.currentInterval = null;
        });

        this.keysDown = [
            {
                key: 'w',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [0, -1],
                currentInterval: null
            },
            {
                key: 'a',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [-1, 0],
                currentInterval: null
            },
            {
                key: 's',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [0, 1],
                currentInterval: null
            },
            {
                key: 'd',
                isDown: false,
                action: game.translateBlock.bind(game),
                args: [1, 0],
                currentInterval: null
            },
            {
                key: 'ArrowLeft',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: 90, z: 0 }],
                currentInterval: null
            },
            {
                key: 'ArrowRight',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: -90, z: 0 }],
                currentInterval: null
            },
            {
                key: 'ArrowUp',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: -90, y: 0, z: 0 }],
                currentInterval: null
            },
            {
                key: 'ArrowDown',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 90, y: 0, z: 0 }],
                currentInterval: null
            },
            {
                key: 'q',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: 0, z: -90 }],
                currentInterval: null
            },
            {
                key: 'e',
                isDown: false,
                action: game.rotateBlock.bind(game),
                args: [{ x: 0, y: 0, z: 90 }],
                currentInterval: null
            }
        ];
    }
}