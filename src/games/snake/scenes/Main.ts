import { Scene } from 'phaser';
import { Snake } from '../entities/Snake';
import { LetterManager } from '../entities/LetterManager';
import { Direction } from '../types';

export class Main extends Scene {
    private snake: Snake;
    private letterManager: LetterManager;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private direction: Direction = { x: 1, y: 0 };
    private nextMoveTime: number = 0;
    private moveInterval: number = 150;
    private snakeSize: number = 40;
    private isGameOver: boolean = false;
    private hasStarted: boolean = false;
    private wrongHits: number = 0;
    private isSuccess: boolean = false;
    private canRestart: boolean = false;

    constructor() {
        super("Main");
    }

    preload() {
        // Load letter images
        'abcdefghijklmnopqrstuvwxyzåäö'.split('').forEach(letter => {
            this.load.image(letter, `assets/letters/${letter.toUpperCase()}.png`);
        });
    }

    create() {
        // Initialize keyboard
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

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
            this.wrongHits = 0;
            const isGameOver = this.letterManager.collectLetter(letterKey);
            if (isGameOver) {
                this.isGameOver = true;
                this.isSuccess = true;
                this.snake.stopMovement();
                this.showSuccess();
            }
        } else {
            // Wrong letter hit
            this.wrongHits++;
            this.letterManager.removeLetter(letterKey);

            if (this.wrongHits >= 2 || this.letterManager.getLetterCount() === 1) {
                this.isGameOver = true;
                this.snake.stopMovement();
                this.showGameOver();
            }
        }
    }

    private showSuccess() {
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Congratulations!\nYou completed the alphabet!',
            {
                fontSize: '48px',
                color: '#00ff00',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            'Press ENTER to restart',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
    }

    private showGameOver() {
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Game Over',
            {
                fontSize: '64px',
                color: '#ff0000'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            'Press ENTER to restart',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
    }

    private resetGame() {
        // Clear existing game objects
        this.snake.stopMovement();
        this.children.removeAll();

        // Reset all state variables
        this.isGameOver = false;
        this.isSuccess = false;
        this.hasStarted = false;
        this.wrongHits = 0;
        this.direction = { x: 1, y: 0 };
        this.nextMoveTime = 0;
        this.canRestart = false;

        // Recreate game objects
        this.snake = new Snake(this, this.snakeSize);
        this.letterManager = new LetterManager(this, this.snakeSize);
        this.letterManager.generateNewLetters();

        // Reset collision detection
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

    update(time: number) {
        if (this.isGameOver) {
            // Wait for Enter key to be released before allowing restart
            if (!this.enterKey.isDown) {
                this.canRestart = true;
            }

            if (this.canRestart && this.enterKey.isDown) {
                this.resetGame();
                return;
            }
            return;
        }

        if (time < this.nextMoveTime) {
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
