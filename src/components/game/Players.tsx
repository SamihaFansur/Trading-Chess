import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { pieceToString } from '../../game/piece';
import { Color, PieceSymbol } from 'chess.js';
import { useChessContext } from '../../providers/ChessProvider';
import { CompleteFlag } from '@/game/state';

const PlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background: ${props => props.theme.menus.players.background};
`;

const PlayerContainer = styled.div`
  display: grid;
  border-top: 2px solid ${props => props.theme.menus.controls.background};
  grid-template-columns: 50px auto 50px;
  grid-template-rows: 20px 20px 20px;
  grid-template-areas:
    "icon name turn"
    "icon details turn"
    "pieces pieces turn";
`;
const PlayerIcon = styled.span`
  font-size: 30px;
  width: 50px;
  text-align: center;
  align-self: center;
  grid-area: icon;
`;

const PlayersName = styled.p`
  padding: 0px;
  margin: 0px;
  grid-area: name;
  align-self: end;
  color: ${props => props.theme.colors.text};
`;

const PlayerStatus = styled.span`
  font-size: 10px;
  background: #ff0000;
  border-radius: 7px;
  padding: 2px 4px;
  color: ${props => props.theme.colors.text};
`;

const PlayerDetails = styled.p`
  padding: 0px;
  margin: 0px;
  align-self: center;
  grid-area: details;
  color: ${props => props.theme.colors.text};
`;

const PlayerPieces = styled.p`
  grid-area: pieces;
  padding: 0px;
  margin: 0px;
  margin-top: -3px;
  margin-left: 2px;
  color: #000;
`;

const PlayerTurn = styled.p`
  grid-area: turn;
  display: flex;
  align-item: center;
  justify-content: center;
  color: ${props => props.theme.colors.text};
`;

interface PlayerDataUI {
  icon: string;
  name: string;
  status: string;
  details: string;
  turn: boolean;
  lost_pieces: PieceSymbol[];
  playable: boolean;
  timer: {
    minutes: number,
    seconds: number,
  };
}

const EmptyPlayerDataUI: PlayerDataUI = {
  icon: '',
  name: 'loading...',
  status: '',
  details: '',
  turn: false,
  lost_pieces: [],
  playable: false,
  timer: {
    minutes: 0,
    seconds: 0,
  },
};

export const Players: React.FC = () => {
  const { state: { players: lobbyPlayers, captured, turn, complete, timers, check }, OutOfTime } = useChessContext();

  const [players, setPlayers] = useState<PlayerDataUI[]>([
    { ...EmptyPlayerDataUI, lost_pieces: [...EmptyPlayerDataUI.lost_pieces], timer: { ...EmptyPlayerDataUI.timer } },
    { ...EmptyPlayerDataUI, lost_pieces: [...EmptyPlayerDataUI.lost_pieces], timer: { ...EmptyPlayerDataUI.timer } },
  ]);

  const fillPlayerData = () => {
    setPlayers(players => {
      players.forEach((p, i) => {
        const colour: Color = i === 0 ? 'w' : 'b';
        p.icon = pieceToString('k', colour === 'w');

        if (check[colour]) {
          p.status = "CHECK";
        } else {
          p.status = '';
        }

        p.name = lobbyPlayers[colour].name;
        p.playable = lobbyPlayers[colour].type === 'local';
        p.turn = turn === colour;
        p.lost_pieces = [...captured[colour]];
      });

      return [...players];
    });
  };

  const updatePlayerTimers = () => {
    setPlayers(players => {
      players.forEach((p, i) => {
        const colour: Color = i === 0 ? 'w' : 'b';

        const { set, time } = timers[colour];
        let elapsed = 0;
        if (set) {
          elapsed = (new Date().getTime() - set) / 1000;
        }

        let timeLeft = time - elapsed;
        if (timeLeft <= 0) {
          timeLeft = 0;
        }
        p.timer.minutes = Math.floor(timeLeft / 60);
        p.timer.seconds = Math.floor(timeLeft) % 60;
      });

      return [...players];
    })
  }

  useEffect(() => {
    fillPlayerData();
  }, [captured, turn, complete, lobbyPlayers]);

  useEffect(() => {
    updatePlayerTimers();
    const timeout = setInterval(() => {
      updatePlayerTimers();
      for (const player of players) {
        if (player.timer.minutes === 0 && player.timer.seconds === 0) {
          OutOfTime();
        }
      }
    }, 1000);
    return () => {
      clearInterval(timeout);
    }
  }, [timers]);

  return (
    <PlayersContainer style={{ gridArea: 'players' }}>
      {
        players.map((v: PlayerDataUI, i) =>
          <PlayerContainer key={i}>
            <PlayerIcon>{v.icon}</PlayerIcon>
            <PlayersName>
              {v.playable ? (<strong>{v.name}</strong>) : v.name}{' '}
              {v.status !== '' && <PlayerStatus>{v.status}</PlayerStatus>}
            </PlayersName>
            <PlayerDetails>
              {v.timer.minutes}:{v.timer.seconds.toString().padStart(2, '0')}
            </PlayerDetails>
            <PlayerPieces>
              {v.lost_pieces.map(p => pieceToString(p, i == 1))}
            </PlayerPieces>
            <PlayerTurn>
              {v.turn && <FontAwesomeIcon style={{ alignSelf: 'center' }} icon={faStar} />}
            </PlayerTurn>
          </PlayerContainer>
        )
      }
    </PlayersContainer>
  );
};