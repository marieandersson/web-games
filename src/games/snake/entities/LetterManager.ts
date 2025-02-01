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

    private isPositionValid(x: number, y: number): boolean {
        let isValid = true;
        this.letters.children.each((child: Phaser.GameObjects.GameObject) => {
            const letter = child as Phaser.Physics.Arcade.Sprite;
            const distance = Phaser.Math.Distance.Between(x, y, letter.x, letter.y);
            if (distance < this.letterSize * 1.5) { // 1.5 times letter size for spacing
                isValid = false;
                return false; // Stop iterating
            }
            return true;
        });
        return isValid;
    }

    private getValidPosition(): { x: number, y: number } {
        const padding = this.letterSize;
        const maxAttempts = 100; // Prevent infinite loop
        let attempts = 0;

        while (attempts < maxAttempts) {
            const x = Phaser.Math.Between(padding, this.scene.cameras.main.width - padding);
            const y = Phaser.Math.Between(padding, this.scene.cameras.main.height - padding);

            if (this.isPositionValid(x, y)) {
                return { x, y };
            }
            attempts++;
        }

        // If we couldn't find a valid position after max attempts,
        // return a position in the center (this should rarely happen)
        return {
            x: this.scene.cameras.main.width / 2,
            y: this.scene.cameras.main.height / 2
        };
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
        const position = this.getValidPosition();
        const letter = this.letters.create(position.x, position.y, key) as Phaser.Physics.Arcade.Sprite;
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
    public removeLetter(letterKey: string) {
        this.letters.children.each((child: Phaser.GameObjects.GameObject) => {
            const sprite = child as Phaser.Physics.Arcade.Sprite;
            if (sprite.texture.key === letterKey) {
                sprite.destroy();
            }
            return true;
        });
    }

    public getLetterCount() {
        return this.letters.countActive();
    }
}