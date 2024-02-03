import { ChessState, LobbyState, createChessState, getCommonState, syncGame } from "@/game/state";
import { auth, database } from "@/util/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { DataSnapshot, get, onValue, ref, set } from "firebase/database";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SettingsContext } from "./SettingsProvider";

type Create_Func = (onError: (error: string) => void) => void;
type Connect_Func = (id: string, onError: (error: string) => void) => void;
type Start_Func = () => void;
type Sync_Func = (chess: ChessState) => void;

type LobbyInterface = {
    type: 'loading',
} | {
    type: 'ready',
    uid: string,
    Create: Create_Func,
    Connect: Connect_Func,
} | {
    type: 'lobby',
    uid: string,
    lobby: LobbyState;
    Start: Start_Func,
} | {
    type: 'ingame',
    uid: string,
    lobby: LobbyState;
    Sync: Sync_Func,
}

/*
interface LobbyInterface {
    connecting: boolean;
    uid?: string;
    lobby?: LobbyState;
    Create: Create_Func,
    Connect: Connect_Func,
    Start: Start_Func,
    Sync: Sync_Func,
}
*/

export const LobbyContext = createContext<LobbyInterface | null>(null);

export const useLobbyContext = (): LobbyInterface => {
    const lobbyCtx = useContext(LobbyContext);
    if (lobbyCtx === null) {
        throw new Error('Lobby context has not been created.');
    }
    return lobbyCtx;
}

interface LobbyProviderProps {
    children?: React.ReactNode,
}

const findUniqueId = async (): Promise<string | undefined> => {
    let tries = 0;
    while (tries < 10) {
        let idNum = Math.floor(Math.random() * 999998) + 1;
        let id = idNum.toString().padStart(6, '0');

        if (!(await get(ref(database, `lobbies/${id}`))).exists()) {
            return id;
        }

        tries++;
    }
    return undefined;
}

export const LobbyProvider: React.FC<LobbyProviderProps> = (props) => {
    const { defaultUsername, gameLength } = useContext(SettingsContext);

    const [connecting, setConnecting] = useState<boolean>(true);
    const [uid, setUid] = useState<string | undefined>();
    const [lobby, setLobby] = useState<LobbyState | undefined>(undefined);

    const userRef = useRef<User | undefined>();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userRef.current = user;
                setUid(user.uid);
            } else {
                userRef.current = undefined;
                setUid(undefined);
            }
        });

        return () => {
        };
    }, []);

    const onLobbyData = (snapshot: DataSnapshot) => {
        setLobby(snapshot.val());
    };

    const value: LobbyInterface = !uid ? {
        type: 'loading',
    } : connecting ? {
        type: 'ready',
        uid,
        Create: async (error) => {
            if (!uid) {
                error('not authenticated yet');
                return;
            }

            const lobbyId = await findUniqueId();

            if (!lobbyId) {
                error('could not find a unique id for your lobby');
                return;
            }

            const chess = createChessState(gameLength, {
                'w': {
                    name: defaultUsername,
                    type: 'local',
                },
                'b': {
                    name: 'not joined',
                    type: 'online',
                }
            });
            const common = getCommonState(chess);

            const lobbyData: LobbyState = {
                lobbyId,
                hostUid: uid,
                players: {
                    'w': {
                        name: defaultUsername,
                        uid,
                    }
                },
                lastAccessTime: new Date().getTime(),
                game: common,
                inGame: false,
                spectators: [],
            };

            try {
                const lobbyRef = ref(database, `lobbies/${lobbyId}`);
                await set(lobbyRef, JSON.parse(JSON.stringify(lobbyData)));
                setLobby(lobbyData);
                setConnecting(false);
                onValue(lobbyRef, onLobbyData);
            } catch (e) {
                error(`failed to create lobby (id ${lobbyId}).  see the console for more information.`);
                console.error(e);
            }
        },
        Connect: async (id, error) => {
            if (!uid) {
                error('not authenticated yet');
                return;
            }

            const lobbyRef = ref(database, `lobbies/${id}`);

            // get value
            const lobby = await get(lobbyRef);

            if (!lobby.exists()) {
                error('lobby does not exist');
                return;
            }

            const lobbyData: LobbyState = lobby.val();

            if (lobbyData.players.w.uid !== uid) {
                if (lobbyData.players.b === undefined) {
                    lobbyData.players.b = {
                        name: defaultUsername,
                        uid,
                    };

                    set(lobbyRef, JSON.parse(JSON.stringify(lobbyData)));
                } else if (lobbyData.players.b.uid !== uid) {
                    const matches = (lobbyData.spectators ?? []).filter(spec => spec.uid === uid);;
                    if (matches.length === 0) {
                        if (lobbyData.spectators === undefined) {
                            lobbyData.spectators = [];
                        }
                        lobbyData.spectators.push({
                            name: defaultUsername,
                            uid,
                        });
                        set(lobbyRef, JSON.parse(JSON.stringify(lobbyData)));
                    }
                }
            }

            onValue(lobbyRef, onLobbyData);
            setLobby(lobbyData);
            setConnecting(false);
        },
    } : !(lobby?.inGame) ? {
        type: 'lobby',
        uid: uid,
        lobby: lobby as LobbyState,
        Start: () => {
            setLobby(lobby => {
                if (lobby) {
                    lobby = {
                        ...lobby,
                        inGame: true,
                    };
                    set(ref(database, `lobbies/${lobby.lobbyId}/inGame`), true);
                }
                return lobby;
            });
        },
    } : {
        type: 'ingame',
        uid: uid,
        lobby: lobby as LobbyState,
        Sync: (chess) => {
            const common = getCommonState(chess);
            setLobby(lobby => {
                if (lobby) {
                    let lastAccessTime = new Date().getTime();
                    const lastTimer = common.timers[common.turn].set;
                    if (lastTimer !== undefined) {
                        lastAccessTime = lastTimer;
                    }
                    lobby = {
                        ...lobby,
                        game: common,
                        lastAccessTime,
                    };

                    set(ref(database, `lobbies/${lobby?.lobbyId}`), JSON.parse(JSON.stringify(lobby)));
                }
                return lobby;
            })
        },
    };

    return (
        <LobbyContext.Provider value={value}>
            {props.children}
        </LobbyContext.Provider>
    );
}