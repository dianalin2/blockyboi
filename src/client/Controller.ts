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
            }
        ];

        setInterval(this.keyTick.bind(this), 100);
    }

    keyTick() {
        for (const k of this.keysDown.filter(v => v.isDown)) {
            k.action(...k.args);
        }
    }
}