import { PieceSymbol } from "chess.js";

const PIECES_HAVE_SHADOW = true;
const PIECES_RESOLUTION = '512px';

const pieceToString = (piece: PieceSymbol, is_white: boolean): string => {
  switch (piece) {
    case 'p': return is_white ? '♙' : '♟︎';
    case 'r': return is_white ? '♖' : '♜';
    case 'n': return is_white ? '♘' : '♞';
    case 'b': return is_white ? '♗' : '♝';
    case 'k': return is_white ? '♔' : '♚';
    case 'q': return is_white ? '♕' : '♛';
  }
  return '_';
};

export const pieceToName = (piece: PieceSymbol): string => {
  switch (piece) {
    case 'p': return 'pawn';
    case 'r': return 'rook';
    case 'n': return 'knight';
    case 'b': return 'bishop';
    case 'k': return 'king';
    case 'q': return 'queen';
  }
  return '_';
}

const pieceToFilename = (piece: PieceSymbol, is_white: boolean): string => {
  const path = `${import.meta.env.BASE_URL}pieces/${PIECES_HAVE_SHADOW ? '' : 'no_'}shadow/${PIECES_RESOLUTION}/`;
  const fname =
    `${is_white ? 'w' : 'b'}_\
${pieceToName(piece)}_png_\
${PIECES_HAVE_SHADOW ? 'shadow_' : ''}\
${PIECES_RESOLUTION}.png`;

  return path + fname;
};

export { pieceToFilename, pieceToString };