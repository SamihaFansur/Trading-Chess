import React, { useContext } from 'react';
import styled from 'styled-components';
import { Move } from 'chess.js';
import { pieceToString } from '../../game/piece';
import { useChessContext } from '../../providers/ChessProvider';
import { SettingsContext } from '@/providers/SettingsProvider';

const MoveContainer = styled.div`
  grid-area: moves;
  overflow-y: auto;
  background-color: ${props => props.theme.menus.moves.background};
  max-height: min(calc(100vw - 450px), calc(1000px - 430px));
  @media (max-width: 800px) {
    max-height: none;
  }
`;

const MoveItem = styled.p`
  padding: 5px 10px;
  margin: 0px;
  color: ${props => props.theme.colors.text};
`;

export const Moves: React.FC = () => {
  const { useChessNotation } = useContext(SettingsContext);
  const { state: { moves, redoStack } } = useChessContext();

  const moveString = (move: Move): string => {
    if (useChessNotation) {
      return move.san;
    }

    const piece = pieceToString(move.piece, move.color === 'w');

    if (move.flags.indexOf('k') >= 0) {
      return `castled ${piece} kingside`;
    } else if (move.flags.indexOf('q') >= 0) {
      return `castled ${piece} queenside`;
    }

    let str = `moved ${piece} ${move.from} to ${move.to}`;

    if (move.promotion) {
      const promotionPiece = pieceToString(move.promotion, move.color === 'w');
      str += ` (promoted to ${promotionPiece})`;
    }

    if (move.captured) {
      const capturedPiece = pieceToString(move.captured, move.color === 'b');
      str += ` (took ${capturedPiece})`;
    }

    return str;
  };

  return (
    <MoveContainer>
      {
        (moves ?? []).map(
          (move, i) => {
            return (
              <MoveItem key={`move_${i}`} style={(moves ?? []).length - 1 === i ? { fontWeight: 'bold' } : {}}>
                {moveString(move)}
              </MoveItem>
            );
          }
        )
      }
      {
        [...redoStack].reverse().map(
          (move, i) => {
            return (
              <MoveItem key={`move_redo_${i}`}>
                {moveString(move)}
              </MoveItem>
            );
          }
        )
      }
    </MoveContainer>
  );
};