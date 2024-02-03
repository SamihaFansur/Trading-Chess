import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { SettingsContext } from './SettingsProvider';

import BotWorker from '@/game/bot?worker';
import { BotMessage, BotResult } from '@/game/bot';
import { Chess, Color, Move, PieceSymbol, Square } from 'chess.js';
import { ChessState, chessReducer, createChessState, syncGame } from '@/game/state';
import { LobbyContext, useLobbyContext } from './LobbyProvider';

export type PlayerType = 'local' | 'bot' | 'online';

export interface ChessConfig {
  player_white: PlayerType;
  player_black: PlayerType;
  positions: string;
}

export const XYtoSquare = (x: number, y: number): Square => {
  return `${'abcdefgh'[x]}${8 - y}` as Square;
}

export const SquareToXY = (square: Square): [number, number] => {
  return ["abcdefgh".indexOf(square[0]), 8 - parseInt(square[1])];
}

type StartNewGame_Func = (config: ChessConfig) => void;
type MakeMove_Func = (from: Square, to: Square) => boolean;
type Promote_Func = (from: Square, to: Square, promotion: PieceSymbol) => boolean;
type PotentialMoves_Func = (from_x: number, from_y: number) => { to: Square, flags: string }[];
type UndoMove_Func = () => boolean;
type RedoMove_Func = () => boolean;
type Pause_Func = () => boolean;
type OutOfTime_Func = () => void;

interface ChessInterface {
  state: ChessState;
  anticheat: string | undefined;
  clearAnticheat: () => void;
  StartNewGame: StartNewGame_Func;
  MakeMove: MakeMove_Func;
  Promote: Promote_Func;
  PotentialMoves: PotentialMoves_Func;
  UndoMove: UndoMove_Func;
  RedoMove: RedoMove_Func;
  Pause: Pause_Func;
  OutOfTime: OutOfTime_Func;
}

export const ChessContext = createContext<ChessInterface | null>(null);

export const useChessContext = (): ChessInterface => {
  const chessCtx = useContext(ChessContext);
  if (chessCtx === null) {
    throw new Error('Chess context has not been created.');
  }
  return chessCtx;
};

interface ChessProviderProps {
  children?: React.ReactNode,
}

export const ChessProvider: React.FC<ChessProviderProps> = (props) => {
  const { allowPause, defaultUsername, gameLength } = useContext(SettingsContext);
  const [state, setState] = useState(createChessState(gameLength, { w: { name: 'loading', type: 'local' }, b: { name: 'loading', type: 'local' } }));
  const [anticheat, setAnticheat] = useState<string | undefined>();
  const stateRef = useRef(new Chess());
  const workerRef = useRef(new BotWorker());
  const configRef = useRef<ChessConfig | undefined>(undefined);
  const lobby = useContext(LobbyContext);

  workerRef.current.onmessage = (e) => {
    const result = e.data as BotResult;
    switch (result.type) {
      case 'success': {
        setState(oldState => chessReducer(oldState, {
          type: 'move',
          from: result.move.from,
          to: result.move.to,
          promotion: result.move.promotion,
          time: new Date().getTime(),
          chess: stateRef.current,
        }));
        break;
      }
      case 'failed': {
        alert('bot failed to generate a move');
        break;
      }
    }
  }

  useEffect(() => {
    const thisPlayer = (state.turn === 'b' ? configRef.current?.player_black : configRef.current?.player_white);
    if (thisPlayer === 'bot' && state.redoStack.length === 0) {
      workerRef.current.postMessage({
        type: 'generateMove',
        fen: stateRef.current.fen(),
        team: state.turn,
      } as BotMessage);
    } else if (lobby?.type === 'ingame') {
      const lastPlayer = lobby.lobby.players[state.turn === 'w' ? 'b' : 'w'];
      const stateMoves = state.moves?.length ?? 0;
      const lobbyMoves = lobby.lobby.game.moves?.length ?? 0;
      if (lastPlayer && lastPlayer.uid === lobby.uid && stateMoves > lobbyMoves) {
        lobby.Sync(state);
      }
    }
  }, [state.turn]);

  useEffect(() => {
    if (lobby?.type === 'ingame') {
      const lobbyData = lobby.lobby;
      setState(state => {
        const next = syncGame(state, lobbyData, lobby.uid, stateRef.current, new Date().getTime());
        if (typeof next === 'string') {
          setAnticheat(next);
          console.error('found cheater!')
          console.error(next);
        } else {
          return next;
        }
        return state;
      })
    }
  }, [lobby]);

  const contextValue: ChessInterface = {
    state,
    anticheat,
    clearAnticheat: () => {
      setAnticheat(undefined);
    },
    StartNewGame: (config: ChessConfig): void => {
      configRef.current = config;
      stateRef.current = new Chess();
      setState(createChessState(gameLength, {
        w: {
          name: 'WHITE',
          type: config.player_white,
        },
        b: {
          name: config.player_black === 'bot' ? 'BOT' : 'BLACK',
          type: config.player_black,
        },
      }));
    },
    MakeMove: (from: Square, to: Square): boolean => {
      setState(oldState => chessReducer(oldState, {
        type: 'move',
        from,
        to,
        time: new Date().getTime(),
        chess: stateRef.current,
      }));
      return true;
    },
    Promote: (from, to, promotion) => {
      setState(oldState => chessReducer(oldState, {
        type: 'move',
        from,
        to,
        promotion,
        time: new Date().getTime(),
        chess: stateRef.current,
      }));
      return true;
    },
    PotentialMoves: (from_x: number, from_y: number): { to: Square, flags: string }[] => {
      return stateRef.current.moves({ square: XYtoSquare(from_x, from_y), verbose: true });
    },
    UndoMove: (): boolean => {
      if (state.players.w.type === 'online' || state.players.b.type === 'online') {
        return false;
      }
      setState(oldState => chessReducer(oldState, {
        type: 'undo',
        time: new Date().getTime(),
        chess: stateRef.current,
      }));
      return true;
    },
    RedoMove: (): boolean => {
      if (state.players.w.type === 'online' || state.players.b.type === 'online') {
        return false;
      }
      setState(oldState => chessReducer(oldState, {
        type: 'redo',
        time: new Date().getTime(),
        chess: stateRef.current,
      }));
      return true;
    },
    Pause: (): boolean => {
      if (state.players.w.type === 'online' || state.players.b.type === 'online') {
        return false;
      }
      if (!allowPause) return false;

      setState(oldState => chessReducer(oldState, {
        type: 'pause',
        time: new Date().getTime(),
      }));
      return true;
    },
    OutOfTime: () => {
      setState(oldState => chessReducer(oldState, {
        type: 'checkTimers',
        time: new Date().getTime(),
        chess: stateRef.current,
      }));
    },
  };

  return (
    <ChessContext.Provider value={contextValue}>
      {
        props.children
      }
    </ChessContext.Provider>
  );
};