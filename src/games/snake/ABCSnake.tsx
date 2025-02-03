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

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container");

                EventBus.on('scene-ready', () => {
                    setIsSceneReady(true);
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


                    {isSceneReady && (
                        <div className="game-overlay">
                        <p className="start-text">Press SPACE to start</p>
                    </div>
                    )}
                </div>
            </>
        );
    }
);
