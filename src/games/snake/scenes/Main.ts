import { Scene } from 'phaser';

export class Main extends Scene {
    snake: Phaser.Physics.Arcade.Sprite;
    letters: Phaser.Physics.Arcade.Group;
    snakeParts: { x: number; y: number; radius: number }[] = [];

    constructor() {
        super("Main");
    }

    preload() {
        //  The Main Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Main Scene itself has no preloader.

        this.load.image("a", "assets/letters/A.png");
        this.load.image("b", "assets/letters/B.png");
        this.load.image("c", "assets/letters/C.png");
    }

    create() {
        // this.snake = this.physics.add.sprite(100, 450, "a");
        this.createSnake(5);

        this.letters = this.physics.add.group();
        this.addLetter("a");
        this.addLetter("b");
        this.addLetter("c");
    }

    createSnake(length: number) {
        const graphics = this.add.graphics();
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        for (let i = 0; i < length; i++) {
            const x = centerX + i * 50;
            const y = centerY;
            const radius = 25;
            this.snakeParts.push({ x, y, radius });
            graphics.fillStyle(i === 0 ? 0xf97171 : 0x202020);
            graphics.fillCircle(x, y, radius);
        }
    }

    addLetter(key: string) {
        let x: number, y: number, overlap;
        const radius = 25;
        const diameter = radius * 2;

        do {
            x = Phaser.Math.Between(
                diameter / 2,
                this.cameras.main.width - diameter / 2
            );
            y = Phaser.Math.Between(
                diameter / 2,
                this.cameras.main.height - diameter / 2
            );
            overlap = this.snakeParts.some((part) => {
                const dx = part.x - x;
                const dy = part.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < part.radius + radius;
            });
        } while (overlap);

        const letter = this.letters.create(
            x,
            y,
            key
        ) as Phaser.Physics.Arcade.Sprite;
        letter.displayWidth = 50;
        letter.displayHeight =
            letter.height * (letter.displayWidth / letter.width);
    }
}
