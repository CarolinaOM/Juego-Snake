import React, { useState, useLayoutEffect, useRef } from 'react';
import './App.css';

const GRID_SIZE = 25;
const SNAKE_START = [{ x: 8, y: 8 }];
const APPLE_START = { x: 10, y: 10 };
const SPEED = 200;
const MIN_SPEED = 50;
const DIRECTIONS = {
  38: { x: 0, y: -1 },
  40: { x: 0, y: 1 },
  37: { x: -1, y: 0 },
  39: { x: 1, y: 0 }
};

function App() {
  const boardRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  //const SCALE = canvasSize.width > 0 ? Math.max(canvasSize.width / GRID_SIZE, 8) : 20;
  const SCALE = canvasSize.width > 0 && canvasSize.height > 0
  ? Math.max(
      Math.min(
        Math.floor(canvasSize.width / GRID_SIZE),
        Math.floor(canvasSize.height / GRID_SIZE)
      ),
      10 // 👈 tamaño mínimo por celda
    )
  : 12;



  useLayoutEffect(() => {
    if (boardRef.current) {
      const size = boardRef.current.getBoundingClientRect();
      setCanvasSize({ width: size.width, height: size.height });
    }
  }, []);

  const moveSnake = ({ keyCode }) => {
    if (DIRECTIONS[keyCode]) {
      setDirection(DIRECTIONS[keyCode]);
    }
  };

  const createApple = (snakeBody) => {
    let newApple = {
      x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
      y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
    };
    let attempts = 0;
    while (checkCollision(newApple, snakeBody) && attempts < 100) {
      newApple = {
        x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
      };
      attempts++;
    }
    return newApple;
  };


  const checkCollision = (piece, snk = snake) => {
    if (
      piece.x < 0 || piece.x >= GRID_SIZE ||
      piece.y < 0 || piece.y >= GRID_SIZE
    ) return true;
    for (const segment of snk) {
      if (piece.x === segment.x && piece.y === segment.y) return true;
    }
    return false;
  };

  const checkAppleCollision = (newSnake) => {
    if (newSnake[0].x === apple.x && newSnake[0].y === apple.y) {
      const newApple = createApple(newSnake);
      setApple(newApple);
      setScore((prevScore) => prevScore + 1);
      setSpeed((prevSpeed) => (prevSpeed > MIN_SPEED ? prevSpeed - 10 : prevSpeed));
      return true;
    }
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newHead = {
      x: snakeCopy[0].x + direction.x,
      y: snakeCopy[0].y + direction.y
    };
    snakeCopy.unshift(newHead);
    if (checkCollision(newHead)) {
      setSpeed(null);
      setGameOver(true);
      return;
    }
    if (!checkAppleCollision(snakeCopy)) {
      snakeCopy.pop();
    }
    setSnake(snakeCopy);
  };

  useLayoutEffect(() => {
    if (speed !== null) {
      const interval = setInterval(() => gameLoop(), speed);
      return () => clearInterval(interval);
    }
  }, [snake, direction, speed]);

  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDirection({ x: 1, y: 0 });
    setSpeed(SPEED);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div role="button" tabIndex="0" onKeyDown={moveSnake} className="game-area">
      <div className="title-container">
        <h1>🐍 Juego de la Serpiente 🐍</h1>
      </div>

      {!speed && !gameOver && (
        <div className="intro">
          <p>🕹️ Usa las flechas para moverte</p>
          <p>🍎 Come manzanas para ganar puntos</p>
        </div>
      )}

      {gameOver && <h2>💀 ¡Juego Terminado! 💀</h2>}

      <button onClick={startGame}>Iniciar Juego</button>
      <h2 className="score">Puntos: {score}</h2>

      <div
        className="progress-bar"
        style={{
          width: `${Math.min(score * 4, 100)}%`
        }}
      ></div>

      <div ref={boardRef} className="game-board">
        {canvasSize.width > 0 && (
          <>
            {snake.map((segment, index) => (
              <div
                key={index}
                className="snake-segment"
                style={{
                  left: `${segment.x * SCALE}px`,
                  top: `${segment.y * SCALE}px`,
                  width: `${SCALE}px`,
                  height: `${SCALE}px`
                }}
              />
            ))}
            <div
            className="apple"
            style={{
              left: `${apple.x * SCALE + SCALE * 0.05}px`,
              top: `${apple.y * SCALE + SCALE * 0.05}px`,
              width: `${SCALE * 0.9}px`,
              height: `${SCALE * 0.9}px`
            }}
          />

          </>
        )}
      </div>
    </div>
  );
}

export default App;