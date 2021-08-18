export class GUI {

    parentElement: HTMLElement;
    rootElement: HTMLElement;

    scoreElement: HTMLElement;
    levelElement: HTMLElement;

    constructor(menuDocumentId: string) {
        this.parentElement = document.getElementById(menuDocumentId);
        this.parentElement.style.position = 'relative';

        this.rootElement = document.createElement('div');
        this.rootElement.classList.add('game-gui');
        this.parentElement.appendChild(this.rootElement);

        this.rootElement.style.position = 'absolute';
        this.rootElement.style.top = '0';
        this.rootElement.style.left = '0';

        const title = document.createElement('h1');
        title.innerText = 'bloktris';
        title.classList.add('title');
        this.rootElement.appendChild(title);

        this.levelElement = document.createElement('span');
        this.rootElement.appendChild(this.levelElement);

        this.scoreElement = document.createElement('span');
        this.rootElement.appendChild(this.scoreElement);

        this.updateLevel(0, 0);
        this.updateScore(0);
    }

    updateScore(score: number) {
        this.scoreElement.innerText = `Score ${score}`;
    }

    updateLevel(level: number, lineNum: number) {
        this.levelElement.innerText = `Level ${level}, ${lineNum}`;
    }
}