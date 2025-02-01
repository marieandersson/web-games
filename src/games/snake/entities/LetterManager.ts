import { Scene } from 'phaser';

export class LetterManager {
    private scene: Scene;
    private letters: Phaser.Physics.Arcade.Group;
    private availableLetters: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
    private currentLetters: string[] = [];
    private nextLetterToCollect: string = 'a';
    private letterSize: number;

    constructor(scene: Scene, letterSize: number) {
        this.scene = scene;
        this.letterSize = letterSize;
        this.letters = this.scene.physics.add.group();
    }

    public generateNewLetters() {
        this.letters.clear(true, true);
        this.currentLetters = [];
        const tempPool = [...this.availableLetters];

        this.currentLetters.push(this.nextLetterToCollect);
        tempPool.splice(tempPool.indexOf(this.nextLetterToCollect), 1);

        for (let i = 0; i < 2 && tempPool.length > 0; i++) {
            const randomIndex = Phaser.Math.Between(0, tempPool.length - 1);
            this.currentLetters.push(tempPool.splice(randomIndex, 1)[0]);
        }

        this.currentLetters = Phaser.Utils.Array.Shuffle(this.currentLetters);
        this.currentLetters.forEach(letter => this.addLetter(letter));
    }

    private addLetter(key: string) {
        const padding = this.letterSize;
        let x = Phaser.Math.Between(padding, this.scene.cameras.main.width - padding);
        let y = Phaser.Math.Between(padding, this.scene.cameras.main.height - padding);

        const letter = this.letters.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
        letter.setDisplaySize(this.letterSize, this.letterSize);
        letter.setTexture(key);
    }

    public getLetters() {
        return this.letters;
    }

    public collectLetter(letterKey: string) {
        this.availableLetters = this.availableLetters.filter(l => l !== letterKey);
        const nextIndex = this.availableLetters.indexOf(this.nextLetterToCollect) + 1;

        if (nextIndex < this.availableLetters.length) {
            this.nextLetterToCollect = this.availableLetters[nextIndex];
            this.generateNewLetters();
            return false;
        }
        return true; // Game Over
    }

    public getNextLetterToCollect() {
        return this.nextLetterToCollect;
    }
}