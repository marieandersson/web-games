export interface SnakePart {
    sprite: Phaser.GameObjects.Arc;
    letter?: string;
    letterText?: Phaser.GameObjects.Text;
}

export interface Direction {
    x: number;
    y: number;
}