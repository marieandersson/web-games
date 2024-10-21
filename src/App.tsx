import { useRef } from 'react';
import { IRefPhaserGame, ABCSnake } from "./games/snake/ABCSnake";

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <ABCSnake ref={phaserRef} />
        </div>
    );
}

export default App
