import { Scene } from 'phaser';

interface SnakePart {
    sprite: Phaser.GameObjects.Arc;
    letter?: string;
    letterText?: Phaser.GameObjects.Text;
}

export class Main extends Scene {
    private snake: SnakePart[] = [];
    private letters: Phaser.Physics.Arcade.Group;
    private snakeSize: number = 40;
    private moveSpeed: number = 200;
    private direction: { x: number; y: number } = { x: 1, y: 0 };
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private availableLetters: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
    private currentLetters: string[] = [];
    private nextMoveTime: number = 0;
    private moveInterval: number = 150;
    private nextLetterToCollect: string = 'a';
    private isGameOver: boolean = false;

    constructor() {
        super("Main");
    }

    preload() {
        // Load letter images
        this.availableLetters.forEach(letter => {
            this.load.image(letter, `assets/letters/${letter.toUpperCase()}.png`);
        });
    }

    create() {
        // Initialize keyboard
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create initial snake
        this.createSnake();

        // Create letters group
        this.letters = this.physics.add.group();

        // Generate first set of letters
        this.generateNewLetters();

        // Add collision detection
        this.physics.add.overlap(
            this.snake[0].sprite,
            this.letters,
            this.handleLetterCollection,
            undefined,
            this
        );
    }

    private createSnake() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create head as a circle
        const head = this.add.circle(centerX, centerY, this.snakeSize / 2, 0xf97171);
        this.physics.add.existing(head);

        // Create head marker (could be first letter or a dot)
        const headMarker = this.add.sprite(centerX, centerY, 'a')
            .setDisplaySize(this.snakeSize * 0.8, this.snakeSize * 0.8)
            .setAlpha(0); // Make it invisible

        this.snake.push({
            sprite: head,
            letterText: headMarker as unknown as Phaser.GameObjects.Text
        });
    }

    private generateNewLetters() {
        // Clear existing letters
        this.letters.clear(true, true);

        // Get three random unique letters from available pool
        this.currentLetters = [];
        const tempPool = [...this.availableLetters];

        // Always include the next required letter
        this.currentLetters.push(this.nextLetterToCollect);
        tempPool.splice(tempPool.indexOf(this.nextLetterToCollect), 1);

        // Add two more random letters
        for (let i = 0; i < 2 && tempPool.length > 0; i++) {
            const randomIndex = Phaser.Math.Between(0, tempPool.length - 1);
            this.currentLetters.push(tempPool.splice(randomIndex, 1)[0]);
        }

        // Shuffle the letters for random positions
        this.currentLetters = Phaser.Utils.Array.Shuffle(this.currentLetters);

        // Add letters to the game
        this.currentLetters.forEach(letter => {
            this.addLetter(letter);
        });
    }

    private addLetter(key: string) {
        const padding = this.snakeSize;
        let x = Phaser.Math.Between(padding, this.cameras.main.width - padding);
        let y = Phaser.Math.Between(padding, this.cameras.main.height - padding);

        const letter = this.letters.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
        letter.setDisplaySize(this.snakeSize, this.snakeSize);
        // Ensure crisp scaling
        letter.setTexture(key);
    }

    private handleLetterCollection = (
        snakeHead: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        letter: Phaser.Types.Physics.Arcade.GameObjectWithBody
    ) => {
        const letterSprite = letter as Phaser.Physics.Arcade.Sprite;
        const letterKey = letterSprite.texture.key;

        if (letterKey === this.nextLetterToCollect) {
            // Remove letter from available pool
            this.availableLetters = this.availableLetters.filter(l => l !== letterKey);

            // Add new segment to snake
            const lastPart = this.snake[this.snake.length - 1];
            const newPart = this.add.circle(
                lastPart.sprite.x,
                lastPart.sprite.y,
                this.snakeSize / 2,
                0x202020
            );
            this.physics.add.existing(newPart);

            // Add letter sprite on the segment
            const letterText = this.add.sprite(
                newPart.x,
                newPart.y,
                letterKey
            ).setDisplaySize(this.snakeSize * 0.8, this.snakeSize * 0.8);

            this.snake.push({
                sprite: newPart,
                letter: letterKey,
                letterText: letterText as unknown as Phaser.GameObjects.Text
            });

            // Update next letter to collect
            const nextIndex = this.availableLetters.indexOf(this.nextLetterToCollect) + 1;
            console.log(`Next Index: ${nextIndex}`);

            if (nextIndex < this.availableLetters.length) {
                this.nextLetterToCollect = this.availableLetters[nextIndex];
                this.generateNewLetters();
            } else {
                this.isGameOver = true;
                this.showGameOver(); // Show game over message
            }
        }
    }

    private showGameOver() {
        // Clear the screen or display a "Game Over" message
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
        for (let i = this.snake.length - 1; i > 0; i--) {
            const part = this.snake[i].sprite;
            const ahead = this.snake[i - 1].sprite;
            this.tweens.add({
                targets: part,
                x: ahead.x,
                y: ahead.y,
                duration: this.moveInterval,
                ease: 'Linear',
                onUpdate: () => {
                    if (this.snake[i].letterText) {
                        this.snake[i].letterText!.setPosition(part.x, part.y);
                    }
                }
            });
        }

        // Move head
        const head = this.snake[0].sprite;
        let newX = head.x + this.direction.x * this.snakeSize;
        let newY = head.y + this.direction.y * this.snakeSize;

        // Wrap around screen
        if (newX < 0) {
            newX = this.cameras.main.width;
        } else if (newX > this.cameras.main.width) {
            newX = 0;
        }

        if (newY < 0) {
            newY = this.cameras.main.height;
        } else if (newY > this.cameras.main.height) {
            newY = 0;
        }

        this.tweens.add({
            targets: head,
            x: newX,
            y: newY,
            duration: this.moveInterval,
            ease: 'Linear',
            onUpdate: () => {
                if (this.snake[0].letterText) {
                    this.snake[0].letterText!.setPosition(head.x, head.y);
                }
            }
        });

        this.nextMoveTime = time + this.moveInterval;
    }
}
