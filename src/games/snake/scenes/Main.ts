import { Scene } from 'phaser';
import { Snake } from '../entities/Snake';
import { LetterManager } from '../entities/LetterManager';
import { Direction } from '../types';

export class Main extends Scene {
    private snake: Snake;
    private letterManager: LetterManager;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private direction: Direction = { x: 1, y: 0 };
    private nextMoveTime: number = 0;
    private moveInterval: number = 150;
    private snakeSize: number = 40;
    private isGameOver: boolean = false;

    constructor() {
        super("Main");
    }

    preload() {
        // Load letter images
        'abcdefghijklmnopqrstuvwxyz'.split('').forEach(letter => {
            this.load.image(letter, `assets/letters/${letter.toUpperCase()}.png`);
        });
    }

    create() {
        // Initialize keyboard
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create snake and letter manager
        this.snake = new Snake(this, this.snakeSize);
        this.letterManager = new LetterManager(this, this.snakeSize);

        // Generate first set of letters
        this.letterManager.generateNewLetters();

        // Add collision detection
        this.physics.add.overlap(
            this.snake.getHead().sprite,
            this.letterManager.getLetters(),
            this.handleLetterCollection,
            undefined,
            this
        );
    }

    private handleLetterCollection = (
        snakeHead: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        letter: Phaser.Types.Physics.Arcade.GameObjectWithBody
    ) => {
        const letterSprite = letter as Phaser.Physics.Arcade.Sprite;
        const letterKey = letterSprite.texture.key;

        if (letterKey === this.letterManager.getNextLetterToCollect()) {
            // Grow snake with collected letter
            this.snake.grow(letterKey);

            // Update letters and check for game over
            const isGameOver = this.letterManager.collectLetter(letterKey);
            if (isGameOver) {
                this.isGameOver = true;
                this.showGameOver();
            }
        }
    }

    private showGameOver() {
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Game Over', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    update(time: number) {
        if (this.isGameOver || time < this.nextMoveTime) {
            return;
        }

        // Handle input
        if (this.cursors.left.isDown && this.direction.x !== 1) {
            this.direction = { x: -1, y: 0 };
        } else if (this.cursors.right.isDown && this.direction.x !== -1) {
            this.direction = { x: 1, y: 0 };
        } else if (this.cursors.up.isDown && this.direction.y !== 1) {
            this.direction = { x: 0, y: -1 };
        } else if (this.cursors.down.isDown && this.direction.y !== -1) {
            this.direction = { x: 0, y: 1 };
        }

        // Move snake
        this.snake.move(this.direction, this.moveInterval);

        // Handle screen wrapping
        const head = this.snake.getHead().sprite;
        if (head.x < 0) {
            head.x = this.cameras.main.width;
        } else if (head.x > this.cameras.main.width) {
            head.x = 0;
        }

        if (head.y < 0) {
            head.y = this.cameras.main.height;
        } else if (head.y > this.cameras.main.height) {
            head.y = 0;
        }

        this.nextMoveTime = time + this.moveInterval;
    }
}
