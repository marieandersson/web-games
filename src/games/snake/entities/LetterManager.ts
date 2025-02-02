import { Scene } from 'phaser';
import { GRID_SIZE, GRID_OFFSET } from '../utils/Constants';
import { Snake } from './Snake';

export class LetterManager {
    private scene: Scene;
    private letters: Phaser.Physics.Arcade.Group;
    private snake: Snake;
    private availableLetters: string[] = 'abcdefghijklmnopqrstuvwxyzåäö'.split('');
    private currentLetters: string[] = [];
    private nextLetterToCollect: string = 'a';
    private letterSize: number;

    constructor(scene: Scene, letterSize: number, snake: Snake) {
        this.scene = scene;
        this.letterSize = letterSize;
        this.letters = this.scene.physics.add.group();
        this.snake = snake;
    }

    private isPositionValid(x: number, y: number): boolean {
        let isValid = true;

        // Check other letters
        this.letters.children.each((child: Phaser.GameObjects.GameObject) => {
            const letter = child as Phaser.Physics.Arcade.Sprite;
            const distance = Phaser.Math.Distance.Between(x, y, letter.x, letter.y);
            if (distance < this.letterSize * 1.5) {
                isValid = false;
                return false;
            }
            return true;
        });

        // Check snake parts
        if (isValid) {
            for (const part of this.snake.getParts()) {
                const distance = Phaser.Math.Distance.Between(x, y, part.sprite.x, part.sprite.y);
                if (distance < this.letterSize * 1.5) {
                    isValid = false;
                    break;
                }
            }
        }

        return isValid;
    }

    private snapToGrid(value: number): number {
        return Math.floor(value / GRID_SIZE) * GRID_SIZE + GRID_OFFSET;
    }

    private getValidPosition(): { x: number, y: number } {
        const padding = GRID_SIZE;
        const maxAttempts = 100;
        let attempts = 0;

        const gridCols = Math.floor((this.scene.cameras.main.width - padding * 2) / GRID_SIZE);
        const gridRows = Math.floor((this.scene.cameras.main.height - padding * 2) / GRID_SIZE);

        while (attempts < maxAttempts) {
            // Get position in grid coordinates
            const gridX = Phaser.Math.Between(1, gridCols - 1);
            const gridY = Phaser.Math.Between(1, gridRows - 1);

            // Convert to pixel coordinates (centered in grid cell)
            const x = (gridX * GRID_SIZE) + GRID_OFFSET;
            const y = (gridY * GRID_SIZE) + GRID_OFFSET;

            if (this.isPositionValid(x, y)) {
                return { x, y };
            }
            attempts++;
        }

        // Default to center of a grid cell
        const centerGridX = Math.floor(this.scene.cameras.main.width / (2 * GRID_SIZE));
        const centerGridY = Math.floor(this.scene.cameras.main.height / (2 * GRID_SIZE));
        return {
            x: (centerGridX * GRID_SIZE) + GRID_OFFSET,
            y: (centerGridY * GRID_SIZE) + GRID_OFFSET
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