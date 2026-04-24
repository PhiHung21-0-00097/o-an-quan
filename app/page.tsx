"use client";
import React, { useState, useEffect } from "react";

// --- (Giữ nguyên Component Pebble và PebbleField từ bản trước để đảm bảo UI đẹp) ---
const PEBBLE_COLORS = [
  "radial-gradient(circle at 30% 30%, #ff9a9e, #f6416c)",
  "radial-gradient(circle at 30% 30%, #a1c4fd, #2193b0)",
  "radial-gradient(circle at 30% 30%, #84fb95, #11998e)",
  "radial-gradient(circle at 30% 30%, #feca57, #ff9f43)",
  "radial-gradient(circle at 30% 30%, #cfd9df, #697175)",
];

const Pebble = ({
  isBig = false,
  index = 0,
}: {
  isBig?: boolean;
  index?: number;
}) => (
  <div
    className={`${isBig ? "w-6 h-6" : "w-3 h-3"} rounded-full shadow-md`}
    style={{
      background: isBig ? PEBBLE_COLORS[4] : PEBBLE_COLORS[index % 4],
      boxShadow:
        "inset -2px -2px 4px rgba(0,0,0,0.4), 2px 2px 5px rgba(0,0,0,0.3)",
      margin: "1px",
    }}
  />
);

const PebbleField = ({
  count,
  isQuan = false,
}: {
  count: number;
  isQuan?: boolean;
}) => (
  <div className="relative w-full h-full flex flex-wrap justify-center items-center p-2 gap-1">
    {Array.from({ length: Math.min(count, 30) }).map((_, i) => (
      <Pebble key={i} index={i} isBig={isQuan && i === 0 && count > 0} />
    ))}
    <div className="absolute -top-1 -right-1 bg-black/60 text-white text-[10px] px-1.5 rounded-full font-bold">
      {count}
    </div>
  </div>
);

type Difficulty = "Dễ" | "Thường" | "Khó";

export default function OAnQuanMaster() {
  // 5 dân mỗi ô, ô Quan (5 và 11) có 1 viên Quan lớn
  const [board, setBoard] = useState([5, 5, 5, 5, 5, 1, 5, 5, 5, 5, 5, 1]);
  const [score, setScore] = useState([0, 0]);
  const [turn, setTurn] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Thường");

  // Quy đổi điểm khi ăn: 1 viên Quan = 10 điểm, 1 dân = 1 điểm
  // Trong logic này, ta mặc định nếu ăn tại index 5 hoặc 11 mà board[i] > 0
  // thì viên đầu tiên là Quan (10đ), các viên sau là dân (1đ)

  const calculateEatenScore = (index: number, count: number) => {
    if ((index === 5 || index === 11) && count > 0) {
      return 10 + (count - 1); // 1 Quan lớn + số dân rải thêm vào
    }
    return count;
  };

  const checkGameOver = (currentBoard: number[], currentScore: number[]) => {
    if (currentBoard[5] === 0 && currentBoard[11] === 0) {
      let finalScore = [...currentScore];
      for (let i = 0; i < 5; i++) finalScore[0] += currentBoard[i];
      for (let i = 6; i < 11; i++) finalScore[1] += currentBoard[i];

      const result =
        finalScore[0] > finalScore[1]
          ? "BẠN THẮNG!"
          : finalScore[0] < finalScore[1]
            ? "AI THẮNG!"
            : "HÒA CỜ!";
      alert(
        `HẾT QUAN, TÀN DÂN!\n\nĐiểm của bạn: ${finalScore[0]}\nĐiểm AI: ${finalScore[1]}\n\nKết quả: ${result}`,
      );
      window.location.reload();
      return true;
    }
    return false;
  };

  // Logic Simulate & AI (Giữ nguyên cấu trúc nhưng cập nhật cách tính điểm)
  const simulate = (
    currentBoard: number[],
    index: number,
    direction: "left" | "right",
  ) => {
    let tempBoard = [...currentBoard];
    let hand = tempBoard[index];
    tempBoard[index] = 0;
    let curr = index;
    let eaten = 0;

    while (true) {
      while (hand > 0) {
        curr = direction === "right" ? (curr + 1) % 12 : (curr - 1 + 12) % 12;
        tempBoard[curr]++;
        hand--;
      }
      let next = direction === "right" ? (curr + 1) % 12 : (curr - 1 + 12) % 12;
      let afterNext =
        direction === "right" ? (next + 1) % 12 : (next - 1 + 12) % 12;

      if (tempBoard[next] > 0 && next !== 5 && next !== 11) {
        hand = tempBoard[next];
        tempBoard[next] = 0;
        curr = next;
      } else if (tempBoard[next] === 0 && tempBoard[afterNext] > 0) {
        while (tempBoard[next] === 0 && tempBoard[afterNext] > 0) {
          eaten += calculateEatenScore(afterNext, tempBoard[afterNext]);
          tempBoard[afterNext] = 0;
          next =
            direction === "right"
              ? (afterNext + 1) % 12
              : (afterNext - 1 + 12) % 12;
          afterNext =
            direction === "right" ? (next + 1) % 12 : (next - 1 + 12) % 12;
        }
        break;
      } else break;
    }
    return { eaten, tempBoard };
  };

  const handleMove = async (index: number, direction: "left" | "right") => {
    if (isMoving || board[index] === 0) return;
    setIsMoving(true);
    let currentBoard = [...board];
    let hand = currentBoard[index];
    currentBoard[index] = 0;
    let currentIndex = index;

    while (true) {
      while (hand > 0) {
        await new Promise((r) => setTimeout(r, 100));
        currentIndex =
          direction === "right"
            ? (currentIndex + 1) % 12
            : (currentIndex - 1 + 12) % 12;
        currentBoard[currentIndex]++;
        hand--;
        setBoard([...currentBoard]);
      }

      let next =
        direction === "right"
          ? (currentIndex + 1) % 12
          : (currentIndex - 1 + 12) % 12;
      let afterNext =
        direction === "right" ? (next + 1) % 12 : (next - 1 + 12) % 12;

      if (currentBoard[next] > 0 && next !== 5 && next !== 11) {
        await new Promise((r) => setTimeout(r, 300));
        hand = currentBoard[next];
        currentBoard[next] = 0;
        currentIndex = next;
        setBoard([...currentBoard]);
      } else if (currentBoard[next] === 0 && currentBoard[afterNext] > 0) {
        let totalPoints = 0;
        let tempScore = [...score];

        while (currentBoard[next] === 0 && currentBoard[afterNext] > 0) {
          await new Promise((r) => setTimeout(r, 500));
          totalPoints += calculateEatenScore(
            afterNext,
            currentBoard[afterNext],
          );
          currentBoard[afterNext] = 0;
          setBoard([...currentBoard]);

          next =
            direction === "right"
              ? (afterNext + 1) % 12
              : (afterNext - 1 + 12) % 12;
          afterNext =
            direction === "right" ? (next + 1) % 12 : (next - 1 + 12) % 12;
        }

        tempScore[turn] += totalPoints;
        setScore(tempScore);
        if (checkGameOver(currentBoard, tempScore)) return;
        break;
      } else break;
    }

    // Logic mượn quân nếu đến lượt mà ô dân trống
    let nextTurn = turn === 0 ? 1 : 0;
    const sideStart = nextTurn === 0 ? 0 : 6;
    const hasStones = currentBoard
      .slice(sideStart, sideStart + 5)
      .some((q) => q > 0);

    if (!hasStones && (currentBoard[5] > 0 || currentBoard[11] > 0)) {
      for (let i = sideStart; i < sideStart + 5; i++) currentBoard[i] = 1;
      let finalScore = [...score];
      finalScore[nextTurn] -= 5;
      setScore(finalScore);
      setBoard([...currentBoard]);
    }

    setTurn(nextTurn);
    setIsMoving(false);
  };

  // AI Turn (getBestMove giữ nguyên logic từ bản trước nhưng dùng hàm simulate mới)
  useEffect(() => {
    if (turn === 1 && !isMoving) {
      setTimeout(() => {
        const moves: any[] = [];
        [6, 7, 8, 9, 10].forEach((idx) => {
          if (board[idx] > 0) {
            ["left", "right"].forEach((dir) =>
              moves.push({ idx, dir, ...simulate(board, idx, dir as any) }),
            );
          }
        });
        const best = moves.sort((a, b) => b.eaten - a.eaten)[0]; // Greedy đơn giản để demo
        if (best) handleMove(best.idx, best.dir);
      }, 1000);
    }
  }, [turn, isMoving]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] p-4 text-white">
      {/* CHỌN CHẾ ĐỘ CHƠI */}
      <div className="mb-8 flex gap-4 bg-stone-800 p-2 rounded-2xl border border-stone-600">
        {(["Dễ", "Thường", "Khó"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${difficulty === level ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "hover:bg-stone-700 text-stone-400"}`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 scale-90 md:scale-100">
        <div className="flex flex-col items-center">
          <p className="text-rose-400 font-bold mb-2 tracking-tighter">
            Otis đẹp zai ({difficulty}) - ĐÃ ĂN: {score[1]}
          </p>
          <div className="w-[500px] h-14 bg-black/40 rounded-full flex flex-wrap items-center justify-center px-6 gap-1 border border-rose-900/50 shadow-inner">
            {Array.from({ length: score[1] }).map((_, i) => (
              <Pebble key={i} index={i} />
            ))}
          </div>
        </div>

        {/* BÀN CỜ */}
        <div className="relative flex items-center bg-[#4e342e] p-10 rounded-[70px] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border-[16px] border-[#2d1b18]">
          <div className="w-36 h-72 bg-[#efebe9] rounded-l-full border-4 border-[#2d1b18] shadow-inner overflow-hidden">
            <PebbleField count={board[11]} isQuan />
          </div>
          <div className="grid grid-cols-5 gap-4 mx-8">
            {[10, 9, 8, 7, 6].map((i) => (
              <div
                key={i}
                className="w-28 h-28 bg-[#d7ccc8] rounded-3xl border-4 border-[#2d1b18] shadow-inner"
              >
                <PebbleField count={board[i]} />
              </div>
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-28 h-28 bg-[#d7ccc8] rounded-3xl border-4 border-[#2d1b18] shadow-inner relative group"
              >
                <PebbleField count={board[i]} />
                {turn === 0 && !isMoving && board[i] > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-white/30 opacity-0 group-hover:opacity-100 transition-all rounded-[20px] backdrop-blur-[2px]">
                    <button
                      onClick={() => handleMove(i, "left")}
                      className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-125 transition-transform"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => handleMove(i, "right")}
                      className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-125 transition-transform"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="w-36 h-72 bg-[#efebe9] rounded-r-full border-4 border-[#2d1b18] shadow-inner overflow-hidden">
            <PebbleField count={board[5]} isQuan />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-[500px] h-14 bg-black/40 rounded-full flex flex-wrap items-center justify-center px-6 gap-1 border border-indigo-900/50 shadow-inner">
            {Array.from({ length: score[0] }).map((_, i) => (
              <Pebble key={i} index={i} />
            ))}
          </div>
          <p className="text-indigo-400 font-bold mt-2 tracking-tighter text-lg">
            Doanh Doanh cùi bắp - ĐÃ ĂN: {score[0]}
          </p>
        </div>
      </div>
    </main>
  );
}
