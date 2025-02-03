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
            <div className="w-screen h-screen flex items-center justify-center overflow-hidden flex-col gap-8">
                <div className="text-center h-30">
                    <h1 className="text-4xl font-bold text-teal-600 mb-4 tracking-[0.2em] uppercase font-['Press_Start_2P',_monospace]">ABC Snake</h1>
                    {isSceneReady && gameState === 'ready' && (
                        <div>
                            <p className="text-emerald-600 font-['Press_Start_2P',_monospace] tracking-[0.2em] uppercase">Press SPACE to start</p>
                        </div>
                    )}
                    {gameState === 'gameover' && (
                        <div>
                            <p className="text-red-600 font-['Press_Start_2P',_monospace] tracking-[0.2em] uppercase">Game Over</p>
                            <p className="text-emerald-600 font-['Press_Start_2P',_monospace] tracking-[0.2em] uppercase">Press SPACE to restart</p>
                        </div>

                    )}
                    {gameState === 'success' && (
                        <div>
                            <p className="text-amber-400 font-['Press_Start_2P',_monospace] tracking-[0.2em] uppercase animate-bounce mb-5 text-2xl">🎉 Amazing! Congratulations! 🎉</p>
                            <p className="text-emerald-600 font-['Press_Start_2P',_monospace] tracking-[0.2em] uppercase">Press SPACE to play again</p>
                        </div>

                    )}
                </div>
                <div id="game-container" className="min-w-[600px] min-h-[600px] flex items-center justify-center border-4 border-double border-yellow-400 rounded-lg p-2 bg-black/20"></div>
            </div>

        );
    }
);
