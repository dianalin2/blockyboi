import { Game } from "./Game";

export class Menu {
    root: HTMLElement;
    game: Game;

    constructor(parent: string, game: Game) {
        const parentElement = document.getElementById(parent);
        this.root = document.createElement('div');
        this.root.classList.add('game-menu');
        parentElement.appendChild(this.root);

        this.game = game;

        const buttons = [
            {
                text: 'Play',
                onClick: this.playAndHide.bind(this)
            },
            {
                text: 'Options',
                onClick: null
            }
        ]

        buttons.forEach(b => {
            const button = document.createElement('button');
            button.innerText = b.text;
            button.onclick = b.onClick;
            this.root.appendChild(button);
        });
    }

    playAndHide() {
        this.game.play();
        this.hide();
    }

    hide() {
        this.root.classList.add('hidden')
    }

    show() {
        this.root.classList.remove('hidden');
    }
}