import { Main } from './scenes/Main';
import { AUTO, Game } from 'phaser';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "0x333333",
    scene: [Main],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false,
        },
    },
};

const StartGame = (parent: string) => {
    const parentElement = document.getElementById(parent);
    return new Game({
        ...config,
        parent,
        width: parentElement?.clientWidth || 1024,
        height: parentElement?.clientHeight || 768
    });

}

export default StartGame;
