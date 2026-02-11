import { useState } from "react";
import "./styles.css";

function Square({ value, onSquareClick }) {
  return (
    <button
      className={`square ${value === "X" ? "x" : value === "O" ? "o" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);

  let status;
  if (winner) {
    status = "Kazanan: " + winner;
  } else if (isDraw(squares)) {
    status = "Berabere 🤝";
  } else {
    status = "Sıradaki oyuncu: " + (xIsNext ? "X" : "O");
  }

  const xChance = calculateWinChance(squares, "X");
  const oChance = calculateWinChance(squares, "O");

  return (
    <>
      <div className="status">{status}</div>

      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>

      <div className="chances">
        <p>❌ X kazanma şansı: %{xChance}</p>
        <p>⭕ O kazanma şansı: %{oChance}</p>
      </div>
    </>
  );
}

export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameResults, setGameResults] = useState([]);
  const [winCount, setWinCount] = useState({ X: 0, O: 0 });
  const [showAchievementInfo, setShowAchievementInfo] = useState(false);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const result = checkGameEnd(nextSquares);
    if (result) {
      setGameResults((prev) => [
        ...prev,
        { gameNumber: prev.length + 1, result },
      ]);

      if (result === "X" || result === "O") {
        setWinCount((prev) => ({
          ...prev,
          [result]: prev[result] + 1,
        }));
      }
    }
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  const moves = history.map((_, move) => (
    <li key={move}>
      <button onClick={() => jumpTo(move)}>
        {move === 0 ? "Başlangıca git" : `${move}. hamleye git`}
      </button>
    </li>
  ));

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        <button className="reset" onClick={resetGame}>
          Yeni Oyun
        </button>
      </div>

      <div className="side-panel">
        <div className="info-row">
          <div className="moves">
            <h3>Hamleler</h3>
            <ol>{moves}</ol>
          </div>

          <div className="results">
            <h3>Oyun Sonuçları</h3>
            <ul>
              {gameResults.map((game) => (
                <li key={game.gameNumber}>
                  {game.gameNumber}. Oyun →{" "}
                  {game.result === "Draw"
                    ? "Berabere"
                    : `${game.result} kazandı`}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="achievements"
          onClick={() => setShowAchievementInfo(!showAchievementInfo)}
        >
          <h3>Başarılar (tıkla)</h3>

          <p>❌ X galibiyet: {winCount.X}</p>
          <p>⭕ O galibiyet: {winCount.O}</p>

          <p>🎖 X ödülü: {getAchievement(winCount.X)}</p>
          <p>🎖 O ödülü: {getAchievement(winCount.O)}</p>

          {showAchievementInfo && (
            <div className="achievement-info">
              <hr />
              <p>🥉 5 galibiyet → Bronz Oyuncu</p>
              <p>🥈 10 galibiyet → Gümüş Usta</p>
              <p>🥇 20 galibiyet → Altın Efsane</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isDraw(squares) {
  return squares.every((square) => square !== null);
}

function checkGameEnd(squares) {
  const winner = calculateWinner(squares);
  if (winner) return winner;
  if (isDraw(squares)) return "Draw";
  return null;
}

function calculateWinChance(squares, player) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let possible = 0;
  for (let line of lines) {
    if (
      line.every(
        (index) => squares[index] === null || squares[index] === player
      )
    ) {
      possible++;
    }
  }

  return Math.round((possible / lines.length) * 100);
}

function getAchievement(wins) {
  if (wins >= 20) return "🥇 Altın Efsane";
  if (wins >= 10) return "🥈 Gümüş Usta";
  if (wins >= 5) return "🥉 Bronz Oyuncu";
  return "Henüz ödül yok";
}
