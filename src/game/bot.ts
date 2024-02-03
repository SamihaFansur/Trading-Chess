import { Chess, Color, Move, PieceSymbol, Square } from 'chess.js';

export type BotMessage = {
  type: 'generateMove',
  fen: string,
};

export type BotResult = {
  type: 'success',
  move: Move,
} | {
  type: 'failed',
};

const scorePiece = (piece: PieceSymbol, ours: boolean): number => {
  const multiplier = ours ? 1 : -1;
  let cost = 0;
  switch (piece) {
    case 'p': cost = 10; break;
    case 'n': cost = 30; break;
    case 'b': cost = 30; break;
    case 'r': cost = 50; break;
    case 'q': cost = 90; break;
    case 'k': cost = 900; break;
  }
  return cost * multiplier;
};

const aiScoreTeam = (state: Chess, color: Color): number => {
  return (state.board().flat().filter(p => p !== null) as { square: Square, type: PieceSymbol, color: Color }[])
    .map(p => scorePiece(p.type, p.color === color))
    .reduce((a, v) => a + v, 0);
};

const aiMinimax = (state: Chess, color: Color, depth: number, alpha: number, beta: number, our_move = false): number => {
  if (depth === 0) return aiScoreTeam(state, color);

  if (our_move) {
    let max = Number.NEGATIVE_INFINITY;
    for (const move of state.moves()) {
      state.move(move);
      const score = aiMinimax(state, color, depth - 1, alpha, beta, false);
      state.undo();
      if (score > max) max = score;
      if (score > alpha) alpha = score;

      if (beta <= alpha) break;
    }
    return max;
  } else {
    let min = Number.POSITIVE_INFINITY;
    for (const move of state.moves()) {
      state.move(move);
      const score = aiMinimax(state, color, depth - 1, alpha, beta, true);
      state.undo();
      if (score < min) min = score;
      if (score < beta) beta = score;

      if (beta <= alpha) break;
    }
    return min;
  }
};

const aiDoMinimax = (state: Chess, color: Color): Move | undefined => {
  const moves = state.moves();
  let bestMove = undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const move of moves) {
    state.move(move);
    const score = aiMinimax(state, color, 3, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    state.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  if (!bestMove) return;

  return state.move(bestMove);
};

onmessage = (e: MessageEvent) => {
  const input = e.data as BotMessage;

  switch (input.type) {
    case 'generateMove': {
      const t0 = performance.now();
      const state = new Chess(input.fen);
      const move = aiDoMinimax(state, state.turn());
      const t1 = performance.now();
      console.log(`AI move generation took ${t1 - t0} ms`);

      if (move === undefined) {
        postMessage({ type: 'failed' } as BotResult);
      } else {
        postMessage({ type: 'success', move } as BotResult);
      }
    }
  }
}

export default {};