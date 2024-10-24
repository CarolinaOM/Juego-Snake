import React, { useState, useEffect } from 'react';
import './App.css';

const CANVAS_SIZE = { width: 500, height: 500 };
const SNAKE_START = [{ x: 8, y: 8 }];
const APPLE_START = { x: 10, y: 10 };
const SCALE = 20;
const SPEED = 200;  // Velocidad inicial
const MIN_SPEED = 50;  // Velocidad mínima permitida
const DIRECTIONS = {
  38: { x: 0, y: -1 }, // Arriba
  40: { x: 0, y: 1 },  // Abajo
  37: { x: -1, y: 0 }, // Izquierda
  39: { x: 1, y: 0 }   // Derecha
};

function App() {
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // Movimiento de la serpiente
  const moveSnake = ({ keyCode }) => {
    if (DIRECTIONS[keyCode]) {
      setDirection(DIRECTIONS[keyCode]);
    }
  };

  const createApple = () => {
    return {
      x: Math.floor(Math.random() * CANVAS_SIZE.width / SCALE),
      y: Math.floor(Math.random() * CANVAS_SIZE.height / SCALE)
    };
  };

  const checkCollision = (piece, snk = snake) => {
    if (
      piece.x * SCALE >= CANVAS_SIZE.width || 
      piece.x < 0 || 
      piece.y * SCALE >= CANVAS_SIZE.height || 
      piece.y < 0
    ) return true;
    for (const segment of snk) {
      if (piece.x === segment.x && piece.y === segment.y) return true;
    }
    return false;
  };

  const checkAppleCollision = (newSnake) => {
    if (newSnake[0].x === apple.x && newSnake[0].y === apple.y) {
      let newApple = createApple();
      while (checkCollision(newApple, newSnake)) {
        newApple = createApple();
      }
      setApple(newApple);

      // Aumentar la velocidad si es mayor a la velocidad mínima
      setSpeed((prevSpeed) => (prevSpeed > MIN_SPEED ? prevSpeed - 10 : prevSpeed)); 
      return true;
    }
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = {
      x: snakeCopy[0].x + direction.x,
      y: snakeCopy[0].y + direction.y
    };
    snakeCopy.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) {
      setSpeed(null);
      setGameOver(true);
      return;
    }
    if (!checkAppleCollision(snakeCopy)) {
      snakeCopy.pop();
    }
    setSnake(snakeCopy);
  };

  useEffect(() => {
    if (speed !== null) {
      const interval = setInterval(() => gameLoop(), speed);
      return () => clearInterval(interval);
    }
  }, [snake, direction, speed]);

  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDirection({ x: 1, y: 0 });
    setSpeed(SPEED);  // Reiniciar la velocidad al valor inicial
    setGameOver(false);
  };

  return (
    <div role="button" tabIndex="0" onKeyDown={moveSnake} className="game-area">
      <h1>🐍 Juego de la Serpiente 🐍</h1>
      {gameOver && <h2>💀 ¡Juego Terminado! 💀</h2>}
      <button onClick={startGame}>Iniciar Juego</button>
      <div
        className="game-board"
        style={{
          width: CANVAS_SIZE.width,
          height: CANVAS_SIZE.height,
          backgroundColor: 'black',
          position: 'relative'
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="snake-segment"
            style={{
              left: `${segment.x * SCALE}px`,
              top: `${segment.y * SCALE}px`,
              width: `${SCALE}px`,
              height: `${SCALE}px`,
              backgroundColor: 'lime',
              position: 'absolute'
            }}
          />
        ))}
        <div
          className="apple"
          style={{
            left: `${apple.x * SCALE}px`,
            top: `${apple.y * SCALE}px`,
            width: `${SCALE}px`,
            height: `${SCALE}px`,
            backgroundImage: 'url(/apple.png)', // Reemplaza el color con la imagen
            backgroundSize: 'cover',            // Asegura que la imagen cubra el área del div
            position: 'absolute'
          }}
        />
      </div>
    </div>
  );
}

export default App;
