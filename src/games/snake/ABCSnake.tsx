import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { Main } from "./scenes/Main";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

export const ABCSnake = forwardRef<IRefPhaserGame>(
    function PhaserGame({}, ref) {
        const game = useRef<Phaser.Game | null>(null!);
        const [isSceneReady, setIsSceneReady] = useState(false);
        const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover' | 'success'>('ready');

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container");

                EventBus.on('scene-ready', () => {
                    setIsSceneReady(true);
                });

                EventBus.on('game-started', () => {
                    setGameState('playing');
                });

                EventBus.on('game-over', () => {
                    setGameState('gameover');
                });

                EventBus.on('game-success', () => {
                    setGameState('success');
                });

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }
            }

            return () => {
                if (game.current) {
                    game.current.destroy(true);
                    if (game.current !== null) {
                        game.current = null;
                    }
                }
            };
        }, [ref]);

        return (
            <>
                <div id="game-container"></div>
                <div className="game-wrapper">
                    {isSceneReady && gameState === 'ready' && (
                        <div className="game-overlay">
                            <p className="start-text">Press SPACE to start</p>
                        </div>
                    )}
                    {gameState === 'gameover' && (
                        <div className="game-overlay">
                            <p className="game-over-text">Game Over</p>
                            <p className="restart-text">Press SPACE to restart</p>
                        </div>
                    )}
                    {gameState === 'success' && (
                        <div className="game-overlay">
                            <p className="success-text">Congratulations!</p>
                            <p className="restart-text">Press SPACE to restart</p>
                        </div>
                    )}
                </div>
            </>
        );
    }
);
