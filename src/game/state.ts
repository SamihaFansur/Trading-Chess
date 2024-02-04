import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { stockDatasets } from "@/components/FakeStockChart";
import { CanStart } from "@/components/Chess";

/* helpers */
type Board = ({ type: PieceSymbol, team: Color, uid: string, value: number } | null)[][];

const pieceValues: Record<PieceSymbol, number> = {
    p: 1, // Pawn
    r: 5, // Rook
    n: 3, // Knight
    b: 3, // Bishop
    q: 9, // Queen
    k: 1000, // King (arbitrarily high to represent its importance)
  };


const getRandomValue = (baseValue: number): number => {
const variation = baseValue;
return baseValue + Math.random() * variation * 2 - variation;
};

type StockValues = {
    [key: string]: number;
  };
  
const stockValues: StockValues = {};

let hasMoved = false; // Flag to determine if a piece has moved

let updateToggle = false; // Toggle to determine whether to update or reuse value
const pieceValueCache: Record<string, number> = {}; // Cache to store piece values by their UID

// Initialize piece type values for white pieces
const whitePieceTypeValues: Record<PieceSymbol, number> = {
    p: getRandomValue(pieceValues.p),
    r: getRandomValue(pieceValues.r),
    n: getRandomValue(pieceValues.n),
    b: getRandomValue(pieceValues.b),
    q: getRandomValue(pieceValues.q),
    k: getRandomValue(pieceValues.k),
};

// Initialize piece type values for black pieces
const blackPieceTypeValues: Record<PieceSymbol, number> = {
    p: getRandomValue(pieceValues.p),
    r: getRandomValue(pieceValues.r),
    n: getRandomValue(pieceValues.n),
    b: getRandomValue(pieceValues.b),
    q: getRandomValue(pieceValues.q),
    k: getRandomValue(pieceValues.k),
};

const whitePieceValueCache: Record<string, number> = {};
const blackPieceValueCache: Record<string, number> = {};


const getBoard = (chess: Chess, pieceUids: Record<string, string>): Board => {
    return chess.board().map(row => 
        row.map(piece => {
            if (piece !== null) {
                let pieceValue;
                const uid = pieceUids[piece.square];
                const cache = piece.color === 'w' ? whitePieceValueCache : blackPieceValueCache;
                const typeValues = piece.color === 'w' ? whitePieceTypeValues : blackPieceTypeValues;

                // Use cached value if available and updateToggle is off, else generate new value
                if (!updateToggle && cache[uid] !== undefined) {
                    pieceValue = cache[uid];
                } else {
                    pieceValue = getRandomValue(pieceValues[piece.type]);
                    cache[uid] = pieceValue; // Cache the new value
                }

                const pieceObject = {
                    type: piece.type,
                    team: piece.color,
                    uid: uid,
                    value: pieceValue, // Use the value for the piece type
                };

                return pieceObject;
            }
            return null;
        })
    );
};

const fetchCurrentStockValues = async (): Promise<StockValues> => {
    // Simulate fetching data with a small delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate stock value changes
    stockDatasets.forEach(stock => {
        // Generate a random change percentage between -5% and 5%
        const changePercentage = (Math.random() * 10 - 5) / 100;
        // Apply the change to the last data point
        const lastValueIndex = stock.data.length - 1;
        const lastValue = parseFloat(stock.data[lastValueIndex]);
        stock.data[lastValueIndex] = (lastValue + lastValue * changePercentage).toFixed(2);
    });

    // Create an object to hold the most recent value of each stock
    const stockValues: StockValues = {};

    // Iterate over the stockDatasets and get the last value from the data array
    stockDatasets.forEach(stock => {
        // The label of the stock dataset will be the key, and the last data point will be the value
        const stockLabel = stock.label.split(' - ')[0]; // Extract the stock symbol from the label
        const stockValue = stock.data[stock.data.length - 1]; // Get the last value from the data array
        stockValues[stockLabel] = parseFloat(stockValue);
    });

    return stockValues;
};


export enum CompleteFlag {
    CHECKMATE = 'c',
    DRAW = 'd',
    THREEFOLD_REPITITION = 'r',
    INSUFFICIENT_MATERIAL = 'm',
    OUT_OF_TIME = 't',
};

const getCompleteFlag = (chess: Chess, outOfTime: boolean = false): string | undefined => {
    let result = '';

    if (outOfTime) {
        result += CompleteFlag.OUT_OF_TIME;
    }
    if (chess.isCheckmate()) {
        result += CompleteFlag.CHECKMATE;
    }
    if (chess.isDraw()) {
        result += CompleteFlag.DRAW;
    }
    if (chess.isInsufficientMaterial()) {
        result += CompleteFlag.INSUFFICIENT_MATERIAL;
    }
    if (chess.isThreefoldRepetition()) {
        result += CompleteFlag.THREEFOLD_REPITITION;
    }

    if (result.length === 0) {
        return undefined;
    }

    return result;
}

type Captured = Record<Color, PieceSymbol[]>;
type Timers = Record<Color, { set?: number, time: number }>;
type MoveUID = { taken?: string };
type Players = Record<Color, {
    name: string,
    type: 'local' | 'bot' | 'online',
}>;

/*
 * state that is used for the chess game AND synced online
 */
interface CommonState {
    timers: Timers;
    moves?: Move[];
    captured: Captured;
    board: Board;
    turn: Color;
    check: Record<Color, boolean>;
    fen: string;
    complete?: string;
};

/*
 * state for chess game (not synced)
 */
export interface ChessState extends CommonState {
    redoStack: Move[];
    pieceUids: Record<string, string>;
    pieceUidTracker: MoveUID[];
    paused: boolean;
    players: Players;
    stockValueSnapshot: Record<string, number>; // Add this line

};

export const createChessState = (length: number, players: Players): ChessState => {
    const chess = new Chess();
    const pieceUids: Record<string, string> = {};
    chess.board().flat().forEach((key, i) => {
        if (key === null) return;
        pieceUids[key.square] = `${i}`;
    });
    const board = getBoard(chess, pieceUids);

    return {
        board,
        timers: {
            'w': {
                time: length * 60,
            },
            'b': {
                time: length * 60,
            },
        },
        moves: [],
        captured: {
            'w': [],
            'b': [],
        },
        turn: 'w',
        check: {
            'w': false,
            'b': false,
        },
        fen: chess.fen(),
        redoStack: [],
        pieceUids,
        pieceUidTracker: [],
        paused: false,
        players,
        stockValueSnapshot: {}, // Initialize it here
    };
};

/* 
 * actions for modifying the chess state
 * note that if chess is passed in the action, it will be mutated
 */
export type ChessAction = {
    type: 'move',
    from: Square,
    to: Square,
    promotion?: PieceSymbol,
    time: number,
    chess: Chess,
} | {
    type: 'undo'
    time: number,
    chess: Chess,
} | {
    type: 'redo'
    time: number,
    chess: Chess,
} | {
    type: 'pause'
    time?: number, /* time only required for unpausing */
} | {
    type: 'checkTimers',
    chess: Chess,
    time: number,
};

/* only for our reducer to use */
type InternalChessAction = {
    type: 'endMove',
    chess: Chess,
    time: number,
};

export const chessReducer = (state: ChessState, action: ChessAction | InternalChessAction): ChessState => {
    switch (action.type) {
        case 'move': {
            if (!CanStart()){
                alert("Select all your assets first before making a move!")
                return state;
            }
            state = chessReducer(state, {
                type: 'checkTimers',
                chess: action.chess,
                time: action.time,
            });
            if (state.complete) {
                break;
            }
        
            if (state.redoStack) {
                state.redoStack = [];
            }
        
            try {
                const move = action.chess.move({
                    from: action.from,
                    to: action.to,
                    promotion: action.promotion,
                });
        
                if (!move) {
                    break; // If the move is not valid, exit the case
                }
        
                const tracked: MoveUID = {};
        
                // Newly added logic for value-based move validation
                const attackingPiece = state.board.flat().find(piece => piece?.uid === state.pieceUids[action.from]);
                const defendingPiece = state.board.flat().find(piece => piece?.uid === state.pieceUids[action.to]);
                if (attackingPiece && defendingPiece && attackingPiece.value < defendingPiece.value) {
                    console.error("Move invalid: Cannot capture a piece of lower value.");
                    action.chess.undo(); // Revert the move
                    break; // Exit the processing of this move
                }
                
                // Proceed with handling captures, castling, and normal moves as before
                if (move.flags.includes('e') || move.captured) {
                    tracked.taken = state.pieceUids[move.to];
                    state.pieceUids[move.to] = state.pieceUids[move.from];
                    delete state.pieceUids[move.from];
                } else if (move.flags.includes('k')) {
                    // Handle kingside castling
                    state.pieceUids[move.to] = state.pieceUids[move.from];
                    delete state.pieceUids[move.from];
                    const castleFrom = `h${move.from[1]}`;
                    const castleTo = `f${move.from[1]}`;
                    state.pieceUids[castleTo] = state.pieceUids[castleFrom];
                    delete state.pieceUids[castleFrom];
                } else if (move.flags.includes('q')) {
                    // Handle queenside castling
                    state.pieceUids[move.to] = state.pieceUids[move.from];
                    delete state.pieceUids[move.from];
                    const castleFrom = `a${move.from[1]}`;
                    const castleTo = `d${move.from[1]}`;
                    state.pieceUids[castleTo] = state.pieceUids[castleFrom];
                    delete state.pieceUids[castleFrom];
                } else {
                    // Normal move
                    state.pieceUids[move.to] = state.pieceUids[move.from];
                    delete state.pieceUids[move.from];
                }
        
                state.pieceUids = { ...state.pieceUids };
                state.pieceUidTracker = [...state.pieceUidTracker, tracked];
                state.moves = [...(state.moves ?? []), move];
        
                if (move.captured) {
                    state.captured[move.color] = [...state.captured[move.color], move.captured];
                }

                fetchCurrentStockValues().then(stockValues => {
                    // Update the stockValueSnapshot in the state with the fetched stock values
                    state = {
                        ...state,
                        stockValueSnapshot: stockValues
                    };
                     // Log the fetched stock values
                    console.log('Fetched stock values after move:', stockValues);
                }).catch(error => {
                    console.error("Error fetching stock values: ", error);
                });


                // Refresh the board state to reflect any changes
                state.board = getBoard(action.chess, state.pieceUids);

        
            } catch (e) {
                break;
            }
        
            return chessReducer(state, {
                type: 'endMove',
                chess: action.chess,
                time: action.time,
            });
        }
        
        case 'undo': {
            state = chessReducer(state, {
                type: 'checkTimers',
                chess: action.chess,
                time: action.time,
            });

            if (state.complete) {
                break;
            }

            const move = action.chess.undo();
            if (move === null || state.moves === undefined) {
                break;
            }
            state.moves.pop();
            state.moves = [...state.moves];

            const update = state.pieceUidTracker.pop();
            state.pieceUidTracker = [...state.pieceUidTracker];

            if (move.captured || move.flags.indexOf('e') >= 0) {
                // get stored uid
                state.pieceUids[move.from] = state.pieceUids[move.to];
                if (update && update.taken) {
                    state.pieceUids[move.to] = update.taken;
                } else {
                    console.error('move UID tracker made a mistake');
                    delete state.pieceUids[move.to];
                }
            } else if (move.flags.indexOf('k') >= 0) {
                // swap uids for both king and castle (kingside)
                state.pieceUids[move.from] = state.pieceUids[move.to];
                delete state.pieceUids[move.to];
                const castleFrom = `h${move.from[1]}`;
                const castleTo = `f${move.from[1]}`;
                state.pieceUids[castleFrom] = state.pieceUids[castleTo];
                delete state.pieceUids[castleTo];
            } else if (move.flags.indexOf('q') >= 0) {
                // swap uids for both king and castle (queenside)
                state.pieceUids[move.from] = state.pieceUids[move.to];
                delete state.pieceUids[move.to];
                const castleFrom = `a${move.from[1]}`;
                const castleTo = `d${move.from[1]}`;
                state.pieceUids[castleFrom] = state.pieceUids[castleTo];
                delete state.pieceUids[castleTo];
            } else {
                // normal move, just move uid
                state.pieceUids[move.from] = state.pieceUids[move.to];
                delete state.pieceUids[move.to];
            }

            state.pieceUids = {
                ...state.pieceUids
            };

            if (move.captured) {
                const oldCaptured = state.captured[move.color];
                const index = oldCaptured.indexOf(move.captured);
                state.captured[move.color] = oldCaptured
                    .filter((_, i) => i !== index);
            }

            state.redoStack = [
                ...state.redoStack,
                move,
            ];

            return chessReducer(state, {
                type: 'endMove',
                chess: action.chess,
                time: action.time,
            });
        }
        case 'redo': {
            state = chessReducer(state, {
                type: 'checkTimers',
                chess: action.chess,
                time: action.time,
            });

            if (state.complete) {
                break;
            }

            const move = state.redoStack.pop();
            if (move === undefined) {
                break;
            }

            const redo = [...state.redoStack];

            state = chessReducer(state, {
                type: 'move',
                to: move.to,
                from: move.from,
                promotion: move.promotion,
                chess: action.chess,
                time: action.time,
            });

            state.redoStack = redo;
            
            return state;
        }
        case 'pause': {
            console.error('PAUSE is not implemented');
            break;
        }
        case 'checkTimers': {
            const now = action.time;
            const { set, time } = state.timers.w.set ? state.timers.w : state.timers.b;
            if (!set) {
                break;
            }

            const elapsed = (now - set) / 1000;
            if (time - elapsed <= 0) {
                state.complete = getCompleteFlag(action.chess, true);

                return {
                    ...state,
                    timers: {
                        w: {
                            time: state.timers.w.set ?
                                0 :
                                state.timers.w.time
                        },
                        b: {
                            time: state.timers.b.set ?
                                0 :
                                state.timers.b.time
                        },
                    }
                };
            }
            break;
        }
        case 'endMove': {
            // update timers

            let { w, b } = state.timers;
            if (action.chess.turn() === 'b') {
                hasMoved = true;
                b.set = action.time;
                if (w.set) {
                    const elapsed = (b.set - w.set) / 1000;
                    w.time -= elapsed;
                }
                w.set = undefined;
            } else {
                w.set = action.time;
                if (b.set) {
                    const elapsed = (w.set - b.set) / 1000;
                    b.time -= elapsed;
                }
                b.set = undefined;
            }
            state.timers = { w, b };

            // update state
            state.turn = action.chess.turn();
            // state.board = getBoard(action.chess, state.pieceUids);
            state.check = {
                w: false,
                b: false,
            };
            state.check[state.turn] = action.chess.isCheck();
            state.complete = getCompleteFlag(action.chess, false);
            updateToggle = !updateToggle;

            return {
                ...state,
            };
            
        }
    }
    
    return state;
};
export const HasMoved = (): boolean => {
    return hasMoved;
};
/*
 * structure of lobby data in firebase
 */
export interface LobbyState {
    lobbyId: string;
    hostUid: string;
    players: {
        w: {
            name: string;
            uid: string;
        };
        b?: {
            name: string;
            uid: string;
        };
    };
    spectators?: {
        name: string;
        uid: string;
    }[];
    game: CommonState;
    inGame: boolean;
    lastAccessTime: number;
};

export const getCommonState = (state: ChessState): CommonState => {
    return {
        timers: state.timers,
        board: state.board,
        captured: state.captured,
        check: state.check,
        fen: state.fen,
        moves: state.moves,
        turn: state.turn,
        complete: state.complete,
    };
}

/* returns string on error (cheated) or new state*/
export const syncGame = (state: ChessState, lobby: LobbyState, uid: string, chess: Chess, time: number): string | ChessState => {
    // set player names
    state.players = {
        w: {
            name: lobby.players.w.name,
            type: lobby.players.w.uid === uid ? 'local' : 'online',
        },
        b: {
            name: lobby.players.b?.name ?? 'connecting',
            type: lobby.players.b?.uid === uid ? 'local' : 'online',
        },
    }

    // if we have an empty state, match lobby
    if ((state.moves?.length ?? 0) === 0) {
        // sync timers
        state.timers = lobby.game.timers;

        if ((lobby.game.moves?.length ?? 0) > 1) {
            // apply all lobby moves
            for (const move of (lobby.game.moves ?? [])) {
                chessReducer(state, {
                    type: 'move',
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion,
                    chess,
                    time,
                });
            }

            return state;
        }
    }

    // compare turn
    if (state.turn === lobby.game.turn) {
        // ignore change - the other player either hasn't played, or has cheated
        return state;
    }

    // compare timers

    // compare moves
    const ourMoveCount = state.moves?.length ?? 0;
    const lobbyMoveCount = lobby.game.moves?.length ?? 0;
    const ourMovesValid = state.moves ?? [];
    const lobbyMovesValid = lobby.game.moves ?? [];
    if (ourMoveCount !== lobbyMoveCount && ourMoveCount !== lobbyMoveCount - 1) {
        return `other user sent us ${lobbyMoveCount} moves, expected ${ourMoveCount} or ${ourMoveCount + 1} moves`;
    }

    for (let i = 0; i < ourMoveCount; i++) {
        if (ourMovesValid[i].san !== lobbyMovesValid[i].san) {
            return `other user manipulated move history (move ${i} expected ${ourMovesValid[i].san} got ${lobbyMovesValid[i].san}`;
        }
    }

    if (ourMoveCount === lobbyMoveCount) {
        // no moves made, both moves match.  don't do anything!
        return state;
    }

    // make last move
    const lastMove = lobbyMovesValid[lobbyMovesValid.length - 1];
    if (!lastMove) {
        return state;
    } else {
        state = chessReducer(state, {
            type: 'move',
            from: lastMove.from,
            to: lastMove.to,
            promotion: lastMove.promotion,
            chess,
            time,
        });
    }

    // check that move worked
    if (state.moves && lobby.game.moves && state.moves.length !== lobby.game.moves.length) {
        return 'other user sent an invalid move';
    }

    // fix timers
    state.timers = lobby.game.timers;

    // compare captured
    const whiteCaptureMatches = state.captured['w'].every((v, i) => v === lobby.game.captured['w'][i]);
    const blackCaptureMatches = state.captured['b'].every((v, i) => v === lobby.game.captured['b'][i]);
    if (!(whiteCaptureMatches && blackCaptureMatches)) {
        return 'other user manipulated captures';
    }

    // compare check status
    if (state.check['w'] !== lobby.game.check['w']
        || state.check['b'] !== lobby.game.check['b']) {
        return 'other user manipulated game check status';
    }

    // compare completion
    if (state.complete !== lobby.game.complete) {
        return 'other user manipulated game completion!';
    }

    return state;
};