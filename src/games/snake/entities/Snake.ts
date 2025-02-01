import { Scene } from 'phaser';
import { SnakePart, Direction } from '../types';

export class Snake {
    private parts: SnakePart[] = [];
    private scene: Scene;
    private snakeSize: number;

    constructor(scene: Scene, snakeSize: number) {
        this.scene = scene;
        this.snakeSize = snakeSize;
        this.createInitialSnake();
    }

    private createInitialSnake() {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        const head = this.scene.add.circle(centerX, centerY, this.snakeSize / 2, 0xf97171);
        this.scene.physics.add.existing(head);

        const headMarker = this.scene.add.sprite(centerX, centerY, 'a')
            .setDisplaySize(this.snakeSize * 0.8, this.snakeSize * 0.8)
            .setAlpha(0);

        this.parts.push({
            sprite: head,
            letterText: headMarker as unknown as Phaser.GameObjects.Text
        });
    }

    public move(direction: Direction, moveInterval: number) {
        for (let i = this.parts.length - 1; i > 0; i--) {
            const part = this.parts[i];
            const ahead = this.parts[i - 1];
            this.scene.tweens.add({
                targets: part.sprite,
                x: ahead.sprite.x,
                y: ahead.sprite.y,
                duration: moveInterval,
                ease: 'Linear',
                onUpdate: () => {
                    if (part.letterText) {
                        part.letterText.setPosition(part.sprite.x, part.sprite.y);
                    }
                }
            });
        }

        const head = this.parts[0].sprite;
        const newX = head.x + direction.x * this.snakeSize;
        const newY = head.y + direction.y * this.snakeSize;

        this.scene.tweens.add({
            targets: head,
            x: newX,
            y: newY,
            duration: moveInterval,
            ease: 'Linear',
            onUpdate: () => {
                if (this.parts[0].letterText) {
                    this.parts[0].letterText.setPosition(head.x, head.y);
                }
            }
        });
    }

    public grow(letterKey: string) {
        const lastPart = this.parts[this.parts.length - 1];
        const newPart = this.scene.add.circle(
            lastPart.sprite.x,
            lastPart.sprite.y,
            this.snakeSize / 2,
            0x202020
        );
        this.scene.physics.add.existing(newPart);

        const letterText = this.scene.add.sprite(
            newPart.x,
            newPart.y,
            letterKey
        ).setDisplaySize(this.snakeSize * 0.8, this.snakeSize * 0.8);

        this.parts.push({
            sprite: newPart,
            letter: letterKey,
            letterText: letterText as unknown as Phaser.GameObjects.Text
        });
    }

    public getHead() {
        return this.parts[0];
    }

    public stopMovement() {
        // Stop all existing tweens
        this.parts.forEach(part => {
            this.scene.tweens.killTweensOf(part.sprite);
        });
    }
}