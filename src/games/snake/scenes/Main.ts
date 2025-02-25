import { Scene } from 'phaser';
import { Snake } from '../entities/Snake';
import { LetterManager } from '../entities/LetterManager';
import { Direction } from '../types';
import { GRID_SIZE } from '../utils/Constants';
import { EventBus } from "../EventBus";

export class Main extends Scene {
    private snake: Snake;
    private letterManager: LetterManager;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey!: Phaser.Input.Keyboard.Key;
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

    private drawGrid() {
        const graphics = this.add.graphics();

        // Draw cells with a very dark background
        graphics.lineStyle(1, 0x333333);
        graphics.fillStyle(0x222222);

        for (let x = 0; x < this.cameras.main.width; x += GRID_SIZE) {
            for (let y = 0; y < this.cameras.main.height; y += GRID_SIZE) {
                // Draw cell background
                graphics.fillRect(x, y, GRID_SIZE, GRID_SIZE);
                // Draw cell border
                graphics.strokeRect(x, y, GRID_SIZE, GRID_SIZE);
            }
        }
    }

    create() {
        // Draw grid first so it's behind everything
        this.drawGrid();

        // Initialize keyboard
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Create snake and letter manager
        this.snake = new Snake(this, this.snakeSize, this.moveInterval);
        this.letterManager = new LetterManager(this, this.snakeSize, this.snake);

        // Generate first set of letters
        this.letterManager.generateNewLetters();

        // Add collision detection with custom check
        this.physics.add.overlap(
            this.snake.getHead().sprite,
            this.letterManager.getLetters(),
            (object1, object2) => {
                if (this.isOnSameGridCell(object1 as unknown as Phaser.GameObjects.GameObject, object2 as unknown as Phaser.GameObjects.GameObject)) {
                    this.handleLetterCollection(
                        object1 as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
                        object2 as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody
                    );
                }
            },
            undefined,
            this
        );

        // Emit scene ready event
        EventBus.emit('scene-ready');
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
        EventBus.emit('game-success');
    }

    private showGameOver() {
        EventBus.emit('game-over');
    }

    private resetGame() {
        // Stop all physics
        this.physics.world.colliders.destroy();

        // Clear existing game objects
        this.snake.stopMovement();
        this.children.removeAll();

        // Draw grid first
        this.drawGrid();

        // Reset all state variables
        this.isGameOver = false;
        this.isSuccess = false;
        this.hasStarted = false;
        this.wrongHits = 0;
        this.direction = { x: 1, y: 0 };
        this.nextMoveTime = 0;
        this.canRestart = false;

        // Recreate game objects
        this.snake = new Snake(this, this.snakeSize, this.moveInterval);
        this.letterManager = new LetterManager(this, this.snakeSize, this.snake);
        this.letterManager.generateNewLetters();

        // Reset collision detection
        this.physics.add.overlap(
            this.snake.getHead().sprite,
            this.letterManager.getLetters(),
            (object1, object2) => {
                if (this.isOnSameGridCell(object1 as unknown as Phaser.GameObjects.GameObject, object2 as unknown as Phaser.GameObjects.GameObject)) {
                    this.handleLetterCollection(
                        object1 as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
                        object2 as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody
                    );
                }
            },
            undefined,
            this
        );
    }

    private isOnSameGridCell(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject): boolean {
        const sprite1 = obj1 as Phaser.GameObjects.Sprite;
        const sprite2 = obj2 as Phaser.GameObjects.Sprite;
        const gridX1 = Math.floor(sprite1.x / GRID_SIZE);
        const gridY1 = Math.floor(sprite1.y / GRID_SIZE);
        const gridX2 = Math.floor(sprite2.x / GRID_SIZE);
        const gridY2 = Math.floor(sprite2.y / GRID_SIZE);

        return gridX1 === gridX2 && gridY1 === gridY2;
    }

    private isExactlyOnSamePosition(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject): boolean {
        const sprite1 = obj1 as Phaser.GameObjects.Sprite;
        const sprite2 = obj2 as Phaser.GameObjects.Sprite;
        // Round positions to handle floating point imprecision
        const x1 = Math.round(sprite1.x);
        const y1 = Math.round(sprite1.y);
        const x2 = Math.round(sprite2.x);
        const y2 = Math.round(sprite2.y);
        return x1 === x2 && y1 === y2;
    }

    update(time: number) {
        if (this.isGameOver) {
            if (!this.spaceKey.isDown) {
                this.canRestart = true;
            }

            if (this.canRestart && this.spaceKey.isDown) {
                this.resetGame();
                return;
            }
            return;
        }

        if (!this.hasStarted) {
            if (this.spaceKey.isDown) {
                this.hasStarted = true;
                EventBus.emit('game-started');
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
                this.snake.stopMovement();
                this.showGameOver();
                return;
            }

            // Check for self collision using grid cells
            const parts = this.snake.getParts();
            if (parts.length > 1 && !this.snake.isCurrentlyGrowing()) {  // Only check when not growing
                for (let i = 1; i < parts.length; i++) {
                    if (this.isOnSameGridCell(head, parts[i].sprite)) {
                        this.isGameOver = true;
                        this.snake.stopMovement();
                        this.showGameOver();
                        return;
                    }
                }
            }

            this.nextMoveTime = time + this.moveInterval;
        }
    }
}
