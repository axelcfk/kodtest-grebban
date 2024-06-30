import { useState, useEffect, useCallback } from "react";
import Tile from "./Tile";
import Overlay from "./Overlay";

// Ändra antal brickor i matrisen här
const MATRIX: number = 2;

// Rätt state
const SolvedState = Array.from(
  { length: MATRIX * MATRIX - 1 },
  (_, i) => i + 1
).concat([0]);

const Puzzle: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(MATRIX * MATRIX - 1);
  const [moves, setMoves] = useState<number>(0);
  const [highscore, setHighscore] = useState<number | null>(null);
  const [currentText, setCurrentText] = useState<string>("Kodtest");
  const [animationPhase, setAnimationPhase] = useState<string>("erasing");
  const [currentPhrase, setCurrentPhrase] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  // Fisher-Yates algoritm för att shuffla rutorna
  const shuffleTiles = useCallback((tiles: number[]) => {
    if (!tiles.length) return;
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    setTiles([...tiles]);
    setEmptyIndex(tiles.indexOf(0));
  }, []);

  useEffect(() => {
    const initialTiles = [...SolvedState];
    shuffleTiles(initialTiles);
  }, [shuffleTiles]);

  // Funktion som tar en index parameter - dvs den bricka som klickas på i brick-arrayen
  const handleTileClick = (index: number) => {
    // Räknar ut radnumret där den tomma brickan ligger
    const emptyRow = Math.floor(emptyIndex / MATRIX);

    // Räknar ut kolumnnumret där den tomma brickan ligger
    const emptyCol = emptyIndex % MATRIX;

    // Räknar ut radnumret där den klickade brickan ligger
    const tileRow = Math.floor(index / MATRIX);

    // Räknar ut kolumnnumret där den klickade brickan ligger
    const tileCol = index % MATRIX;

    // Kollar om den klickade brickan är i samma rad eller kolumn som den tomma brickan
    if (emptyRow === tileRow || emptyCol === tileCol) {
      // Skapa en ny array för att ändra brickorna för att undvika mutation
      const newTiles = [...tiles];

      // Kollar om den tomma brickan och den klickade brickan är i samma rad
      if (emptyRow === tileRow) {
        // Flytta tiles i samma rad
        if (emptyCol < tileCol) {
          // Flytta tiles till vänster om tomma brickan är till vänster om den klickade brickan
          for (let i = emptyCol; i < tileCol; i++) {
            newTiles[i + emptyRow * MATRIX] =
              newTiles[i + 1 + emptyRow * MATRIX];
          }
        } else {
          // Flytta tiles till höger om tomma brickan är till höger om den klickade brickan
          for (let i = emptyCol; i > tileCol; i--) {
            newTiles[i + emptyRow * MATRIX] =
              newTiles[i - 1 + emptyRow * MATRIX];
          }
        }
      } else {
        // Flytta brickorna i samma kolumn
        if (emptyRow < tileRow) {
          // Flytta brickorna uppåt om tomma brickan är ovanför den klickade brickan
          for (let i = emptyRow; i < tileRow; i++) {
            newTiles[emptyCol + i * MATRIX] =
              newTiles[emptyCol + (i + 1) * MATRIX];
          }
        } else {
          // Flytta brickorna nedåt om tomma brickan är under den klickade brickan
          for (let i = emptyRow; i > tileRow; i--) {
            newTiles[emptyCol + i * MATRIX] =
              newTiles[emptyCol + (i - 1) * MATRIX];
          }
        }
      }

      // Sätt den nya tomma brickpositionen
      newTiles[index] = 0;

      // Uppdatera state med den nya brick-arrayen
      setTiles(newTiles);

      // Uppdatera indexet för den tomma brickan
      setEmptyIndex(index);

      // Öka move-counter
      setMoves((prevMoves) => prevMoves + 1);
    }
  };

  //rätt state
  const solvedTiles = Array.from(
    { length: MATRIX * MATRIX - 1 },
    (_, i) => i + 1
  ).concat([0]);

  // Kolla om pusslet är löst
  const checkIsSolved = useCallback(() => {
    const solved = tiles.every((tile, index) => tile === SolvedState[index]);
    setIsSolved(solved);
    return solved;
  }, [tiles, solvedTiles]);

  // Om spelet är löst - uppdatera highscore
  useEffect(() => {
    if (checkIsSolved()) {
      console.log("Moves:", moves, "Highscore:", highscore);
      if (highscore === null || moves < highscore) {
        setHighscore(100 - moves);
        console.log("New highscore:", moves);
      }
    }
  }, [isSolved, moves, highscore]);

  // switch-funktion för att visa meddelande beroende på hur många poäng
  const getMessageByScore = (score: number) => {
    switch (true) {
      case score >= 80 && score <= 100:
        return "Wow you solved it! How did you even do that... Amazing!";
      case score >= 60 && score < 80:
        return "Great job! This is resume compatible";
      case score >= 40 && score < 60:
        return "Good job! Have you done this before?";
      case score >= 20 && score < 40:
        return "Good! Can you beat your highscore?";
      case score >= 0 && score < 20:
        return "You did it! Try again and see if you can do even better";
      default:
        return "";
    }
  };

  // Funktion för att stänga overlayen när spel är klarat
  const closeOverlay = () => {
    setIsSolved(false);
  };

  // Funktion för att resetta spelet
  const resetGame = () => {
    setMoves(0);
    shuffleTiles(tiles);
  };

  // En animation just for fun :)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const phrases = ["Kodtest", `15 Puzzle`];

    if (animationPhase === "erasing") {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText((prev) => prev.substring(0, prev.length - 1));
        }, 40); // hastighet
      } else {
        setAnimationPhase("writing");
        setCurrentPhrase((prev) => (prev === 0 ? 1 : 0));
      }
    } else if (animationPhase === "writing") {
      if (currentText !== phrases[currentPhrase]) {
        timer = setTimeout(() => {
          setCurrentText((prev) =>
            phrases[currentPhrase].substring(0, prev.length + 1)
          );
        }, 40); // hastighet
      } else {
        timer = setTimeout(() => {
          setAnimationPhase("erasing");
        }, 4000); //vänta 4 sek innan radera
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, animationPhase, currentPhrase]);

  return (
    <div className="h-lvh p-4 flex justify-start items-center flex-col ">
      <div className="flex justify-between items-start flex-row w-full mb-10 md:px-20">
        <h1 className=" font-medium text-slate-50 w-full">
          <span className="flex flex-col">
            <span className="text-3xl md:text-4xl">Grebban</span>{" "}
            <span className="text-3xl md:text-4xl text-[#40F99B]">
              {currentText}
            </span>
          </span>
        </h1>
        <div className="flex flex-col md:flex-row ">
          <label className="w-full flex  flex-col items-start font-bold mb-4">
            <span className=" text-slate-500 mr-4  md:font-medium">
              Current Score:
            </span>{" "}
            <span className="text-[#40F99B] text-xl md:text-4xl">
              {100 - moves}
            </span>
          </label>
          <label className="w-full flex flex-col items-start font-bold mb-4">
            {highscore !== null ? (
              <>
                <span className="text-slate-500 mr-4  md:font-medium">
                  Your Highscore:
                </span>
                <span className="text-[#40F99B] text-xl md:text-4xl">
                  {highscore}
                </span>
              </>
            ) : (
              <span className="text-slate-500  md:font-medium">
                Highscore: You haven't solved a puzzle yet!
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="flex flex-col justify-start items-center h-full">
        <label className="text-slate-50 font-bold w-full mb-8">
          <span className="text-slate-500 md:text-2xl">Moves:</span>{" "}
          <span className="md:text-2xl text-slate-500">{moves}</span>
        </label>

        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateRows: `repeat(${MATRIX}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${MATRIX}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((tile, index) => (
            <Tile
              key={index}
              index={index}
              value={tile}
              onClick={() => handleTileClick(index)}
            />
          ))}
        </div>
        <button
          className="mt-4 p-2 bg-transparent border-2 border-solid border-[#40F99B] text-slate-50 font-medium hover:cursor-pointer hover:bg-[#40F99B] hover:text-black rounded-full w-[100%] transition duration-500 ease-in-out"
          onClick={() => {
            shuffleTiles(tiles);
            setMoves(0);
          }}
        >
          Shuffle Puzzle
        </button>
      </div>

      {isSolved && (
        <Overlay
          message={getMessageByScore(100 - moves)}
          onClose={closeOverlay}
          resetGame={resetGame}
        />
      )}
    </div>
  );
};

export default Puzzle;
