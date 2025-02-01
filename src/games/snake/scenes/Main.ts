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
    private hasStarted: boolean = false;
    private wrongHits: number = 0;

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
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Create snake and letter manager
        this.snake = new Snake(this, this.snakeSize);
        this.letterManager = new LetterManager(this, this.snakeSize);

        // Generate first set of letters
        this.letterManager.generateNewLetters();

        // Add collision detection
        this.physics.add.overlap(
            this.snake.getHead().sprite,
            this.letterManager.getLetters(),
            (object1, object2) => {
                this.handleLetterCollection(
                    object1 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
                    object2 as Phaser.Types.Physics.Arcade.GameObjectWithBody
                );
            },
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
        const correctLetter = this.letterManager.getNextLetterToCollect();

        if (letterKey === correctLetter) {
            // Correct letter collected
            this.snake.grow(letterKey);
            this.wrongHits = 0; // Reset wrong hits counter
            const isGameOver = this.letterManager.collectLetter(letterKey);
            if (isGameOver) {
                this.isGameOver = true;
                this.showGameOver();
            }
        } else {
            // Wrong letter hit
            this.wrongHits++;
            this.letterManager.removeLetter(letterKey);

            if (this.wrongHits >= 2 || this.letterManager.getLetterCount() === 1) {
                // Game over if two wrong hits or only the correct letter remains
                this.isGameOver = true;
                this.snake.stopMovement();
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
            this.hasStarted = true;
        } else if (this.cursors.right.isDown && this.direction.x !== -1) {
            this.direction = { x: 1, y: 0 };
            this.hasStarted = true;
        } else if (this.cursors.up.isDown && this.direction.y !== 1) {
            this.direction = { x: 0, y: -1 };
            this.hasStarted = true;
        } else if (this.cursors.down.isDown && this.direction.y !== -1) {
            this.direction = { x: 0, y: 1 };
            this.hasStarted = true;
        }

        // Only move if the game has started
        if (this.hasStarted) {
            // Move snake
            this.snake.move(this.direction, this.moveInterval);

            // Check for wall collision
            const head = this.snake.getHead().sprite;
            if (head.x < 0 || head.x > this.cameras.main.width ||
                head.y < 0 || head.y > this.cameras.main.height) {
                this.isGameOver = true;
                this.snake.stopMovement(); // Stop the snake's movement
                this.showGameOver();
                return;
            }

            this.nextMoveTime = time + this.moveInterval;
        }
    }
}
