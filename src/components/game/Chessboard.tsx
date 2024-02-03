import React, { useState, useRef, useEffect, useContext } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { SquareToXY, XYtoSquare, useChessContext } from '../../providers/ChessProvider';
import { Error } from '../../util/Error';
import { ChessPiece } from './ChessPiece';
import { Color, PieceSymbol, Square } from 'chess.js';
import { pieceToFilename, pieceToName, pieceToString } from '@/game/piece';
import { LobbyContext } from '@/providers/LobbyProvider';
import { CompleteFlag } from '@/game/state';

interface MoveProps {
  grid_x: number,
  grid_y: number,
  will_take: boolean,
  is_castle: boolean,
}

const MoveContainerDiv = styled.div`
grid-column: ${(props: MoveProps) => props.grid_x + 1} / span 1;
grid-row: ${(props: MoveProps) => props.grid_y + 1} / span 1;
position: relative;
`;

const MoveInnerDiv = styled.div`
top: 25%;
left: 25%;
position: absolute;
width: 50%;
height: 50%;
border-radius: 50%;
background-color: ${(props: MoveProps) => props.will_take ? '#fc0339' : props.is_castle ? '#f5a742' : '#03a1fc'};
`;

const Move: React.FC<MoveProps> = (props) => {
  return (
    <MoveContainerDiv {...props}>
      <MoveInnerDiv  {...props} />
    </MoveContainerDiv>
  );
};

const BoardDiv = styled.div`
  width: 100%;
  height: 100%;

  display: grid;
  position: relative;
  grid-template-columns: ${() => 'auto '.repeat(8) + ';'};
  grid-template-rows: ${() => 'auto '.repeat(8) + ';'};
  user-select: none;
  -moz-user-select: none;
  touch-action: none;
`;

interface BoardGridProps {
  gridColor: boolean,
  grid_x: number,
  grid_y: number,
  theme: DefaultTheme,
}

const BoardGridDiv = styled.div`
  position: relative;
  background-color: ${(props: BoardGridProps) => props.gridColor ? props.theme.chess.board_light : props.theme.chess.board_dark};
  grid-column: ${(props: BoardGridProps) => props.grid_x + 1} / span 1;
  grid-row: ${(props: BoardGridProps) => props.grid_y + 1} / span 1;
`;

const BoardGridRowLabel = styled.span`
  position: absolute;
  bottom: 5px;
  left: 5px;
  color: ${props => props.theme.chess.board_text};
  font-weight: bold;
  font-size: 18px;
  z-index: 10;
`;
const BoardGridColLabel = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  color: ${props => props.theme.chess.board_text};
  font-weight: bold;
  font-size: 18px;
  z-index: 10;
`;

const Window = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 50px;
  right: 50px;
  background: ${props => props.theme.menus.controls.background};
  z-index: 20;
`;

const WindowTitle = styled.h1`
  text-align: center;
  color: #fff;
  padding-top: 1em;
`;

const PromotionChoices = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  padding: 2em 0em 4em 0em;
`;
const PromotionChoice = styled.img`
  width: 15%;
  background: #fff;
  border: 1px solid #ffffffff;
  border-radius: 10px;
  box-shadow: 1px 1px 5px ${props => props.theme.menus.controls.background};
  transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  cursor: pointer;
  aspect-ratio: 1 / 1;
  padding: 5px;

  &:hover {
    border: 1px solid #777;
    box-shadow: 1px 1px 5px #aeaeae;
  }

  &:active {
    background: #eee;
  }
`;
const GameOverText = styled.h2`
  text-align: center;
  color: #fff;
  padding-bottom: 1em;
`;

const PROMOTIONS: PieceSymbol[] = ['q', 'r', 'n', 'b'];

interface GridPosition {
  grid_x: number,
  grid_y: number,
}

export const Chessboard: React.FC = () => {
  const { state: { board, turn, players, complete }, anticheat, clearAnticheat, PotentialMoves, MakeMove, Promote } = useChessContext();
  const [selected, setSelected] = useState<GridPosition | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [moveError, setMoveError] = useState('');
  const [promotion, setPromotion] = useState<{ from: Square, to: Square } | undefined>(undefined);
  const lobby = useContext(LobbyContext);

  const onTouchMove = (e: TouchEvent) => {
    if (!e.target || !boardRef.current) return;
    const div = e.target as HTMLDivElement;
    if (div === boardRef.current || boardRef.current.contains(div)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (anticheat) {
      setMoveError(anticheat);
    } else {
      setMoveError('');
    }
  }, [anticheat])

  const pixelsToGrid = (x: number, y: number): [number, number] => {
    const parent = boardRef.current;
    if (parent === null) {
      console.log('failed to get reference to game board div!');
      return [0, 0];
    }

    const grid_x = Math.floor((x - parent.offsetLeft) / (parent.offsetWidth / 8));
    const grid_y = Math.floor((y - parent.offsetTop) / (parent.offsetHeight / 8));
    return [grid_x, grid_y];
  };

  const gridToPixels = (x: number, y: number): [number, number] => {
    const parent = boardRef.current;
    if (parent === null) {
      console.log('failed to get reference to game board div!');
      return [0, 0];
    }

    const pixel_x = (x * (parent.offsetWidth / 8)) + parent.offsetLeft;
    const pixel_y = (y * (parent.offsetHeight / 8)) + parent.offsetTop;
    return [pixel_x, pixel_y];
  };

  const AttemptMove = (from_x: number, from_y: number, to_x: number, to_y: number): void => {
    const from = XYtoSquare(from_x, from_y);
    const to = XYtoSquare(to_x, to_y);

    if (to[1] === (turn === 'w' ? '8' : '1') && board[from_y][from_x]?.type === 'p') {
      setPromotion({ from, to });
      return;
    }
    if (!MakeMove(from, to)) {
      setMoveError(`unable to move piece from ${from} to ${to}`);
      return;
    }
  };

  const AttemptPromote = (from: Square, to: Square, promotion: PieceSymbol) => {
    if (!Promote(from, to, promotion)) {
      setMoveError(`unable to move piece from ${from} to ${to} (picked ${pieceToName(promotion)})`);
      return;
    }
    setPromotion(undefined);
  }

  const gameOverReason = (): string => {
    if (complete === undefined) {
      return 'invalid reason';
    }
    let player = turn === 'w' ? players.w.name : players.b.name;
    if (complete.indexOf(CompleteFlag.CHECKMATE) >= 0) {
      return player + ' is in checkmate';
    } else if (complete.indexOf(CompleteFlag.OUT_OF_TIME) >= 0) {
      return player + ' ran out of time';
    } else if (complete.indexOf(CompleteFlag.INSUFFICIENT_MATERIAL) >= 0) {
      return player + ' has insufficient material';
    } else if (complete.indexOf(CompleteFlag.THREEFOLD_REPITITION) >= 0) {
      return player + ' performed threefold repitition';
    } else if (complete.indexOf(CompleteFlag.DRAW) >= 0) {
      return 'draw';
    }

    return 'invalid reason';
  }

  return (
    <BoardDiv ref={boardRef}>
      {
        [...Array(8 * 8)].map(
          (_, i) => {
            const x = i % 8;
            const y = Math.floor(i / 8);
            return (<BoardGridDiv
              key={i}
              grid_x={x}
              grid_y={y}
              gridColor={(i - y) % 2 == 0}
            >
              {x == 0 && <BoardGridRowLabel>{8 - y}</BoardGridRowLabel>}
              {y == 0 && <BoardGridColLabel>{'abcdefgh'[x]}</BoardGridColLabel>}
            </BoardGridDiv>);
          }
        )
      }
      {
        (board.map((row, y) => row.map((value, x) => { return { x, y, ...value } })).flat()
          .filter(v => v.team && v.type && v.uid) as { team: Color, type: PieceSymbol, uid: string, x: number, y: number }[])
          .sort((a, b) => a.uid.localeCompare(b.uid))
          .map(
            v =>
              <ChessPiece
                key={`piece_${v.uid}`}
                type={v.type}
                grid_x={v.x}
                grid_y={v.y}
                is_white={v.team == 'w'}
                on_place={(x, y) => AttemptMove(v.x, v.y, x, y)}
                pixels_to_grid={pixelsToGrid}
                grid_to_pixels={gridToPixels}
                on_select_change={(selected) => selected ? setSelected({ grid_x: v.x, grid_y: v.y }) : setSelected(null)}
                can_click={v.team === turn && players[turn].type === 'local'}
              />
          )
      }
      {
        selected &&
        PotentialMoves(selected.grid_x, selected.grid_y).map((move, i) =>
          <Move
            key={`move_${i}`}
            grid_x={SquareToXY(move.to)[0]}
            grid_y={SquareToXY(move.to)[1]}
            will_take={move.flags.indexOf('e') >= 0 || move.flags.indexOf('c') >= 0}
            is_castle={move.flags.indexOf('k') >= 0 || move.flags.indexOf('q') >= 0}
          />
        )
      }
      <Error error={moveError} duration={1000} onErrorClose={() => { setMoveError(''); clearAnticheat() }} />
      {
        promotion && <Window>
          <WindowTitle>promotion</WindowTitle>
          <PromotionChoices>
            {
              PROMOTIONS.map(piece =>
                <PromotionChoice
                  key={`promotion-${piece}`}
                  src={pieceToFilename(piece, turn === 'w')}
                  title={pieceToName(piece)}
                  alt={pieceToName(piece)}
                  onClick={() => AttemptPromote(promotion.from, promotion.to, piece)}
                />
              )
            }
          </PromotionChoices>
        </Window>
      }
      {
        complete && <Window>
          <WindowTitle>Game Over: </WindowTitle>
          <GameOverText>{gameOverReason()}</GameOverText>
        </Window>
      }
    </BoardDiv>
  );
};