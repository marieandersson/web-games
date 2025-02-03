import { Main } from './scenes/Main';
import { AUTO, Game } from 'phaser';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    backgroundColor: "0x222222",
    scene: [Main],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false,
        },
    },
    render: {
        antialias: true
    },
};

const StartGame = (parent: string) => {
    const parentElement = document.getElementById(parent);
    const maxSize = 600;

    // Calculate the smallest dimension
    const smallestDimension = Math.min(
        parentElement ? parentElement?.clientWidth - 48 : maxSize,
        parentElement ? parentElement?.clientHeight - 48 : maxSize,
        maxSize
    );

    return new Game({
        ...config,
        parent,
        width: smallestDimension,
        height: smallestDimension

    });
}

export default StartGame;
