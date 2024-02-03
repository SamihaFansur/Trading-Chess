import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from './game/Chessboard';
import { Controls } from './game/Controls';
import { Players } from './game/Players';
import { Moves } from './game/Moves';
import { Fullscreen } from '../util/Fullscreen';
import { useParams } from 'react-router-dom';
import { useChessContext } from '../providers/ChessProvider';
import { SettingsContext } from '@/providers/SettingsProvider';
import { LobbyContext } from '@/providers/LobbyProvider';

const ChessContainer = styled.div<{ fullscreen: boolean }>`
  ${props => props.fullscreen && `display: flex; 
  align-items: center; justify-content: center; 
  background: ${props.theme.colors.background}; 
  width: 100%; height: 100%;`}
  
  width: 100%;
`;

const GameContainer = styled.div<{ fullscreen: boolean }>`
  width: 100%;
  ${props => props.fullscreen && 'max-width: 1400px;'};
  display: grid;
  background: ${props => props.theme.colors.grid};
  grid-template-columns: auto auto 250px;
  grid-template-rows: 60px 120px auto;
  grid-template-areas:
    "chess chess controls"
    "chess chess players"
    "chess chess moves";

  @media (max-width: 800px) {
    grid-template-columns: 250px auto;
    grid-template-rows: auto 60px 120px;
    grid-template-areas:
      "chess chess"
      "controls moves"
      "players moves"
  }
  @media (max-width: 600px) {
    grid-template-columns: auto;
    grid-template-rows: auto 60px 120px auto;
    grid-template-areas:
      "chess"
      "controls"
      "players"
      "moves"
  }
`;

const BoardContainer = styled.div`
  grid-area: chess;
  aspect-ratio: 1;
`;

interface ChessProps {
  type: 'local' | 'bot' | 'online'
}

export const Chess: React.FC<ChessProps> = ({ type }) => {
  const [fullscreen, setIsFullscreen] = useState(false);
  const { hasLoaded } = useContext(SettingsContext);
  const { id } = useParams();
  const { StartNewGame } = useChessContext();
  const navigate = useNavigate();
  const lobby = useContext(LobbyContext);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    if (type === 'bot') {
      StartNewGame({ player_white: 'local', player_black: 'bot', positions: 'default' });
    } else if (type === 'local') {
      StartNewGame({ player_white: 'local', player_black: 'local', positions: 'default' });
    } else {
      if (lobby?.type === 'ready') {
        lobby.Connect(id ?? '', (error) => {
          alert(error);
        });
      }
    }
  }, [hasLoaded, lobby?.type]);

  const toggleFullscreen = () => {
    setIsFullscreen(b => !b);
  };

  const quitGame = () => {
    if (confirm('would you like to quit this game?  once left, it cannot be joined again.'))
      navigate('/');
  };

  return (
    <Fullscreen isFullscreen={fullscreen}>
      <ChessContainer fullscreen={fullscreen}>
        {
          lobby && lobby.type !== 'ingame' && <p>connecting...</p>
        }
        <GameContainer fullscreen={fullscreen}>
          <BoardContainer>
            <Chessboard />
          </BoardContainer>
          <Controls
            toggleFullscreen={() => toggleFullscreen()}
            quitGame={() => quitGame()}
          />
          <Players />
          <Moves />
        </GameContainer>
      </ChessContainer>
    </Fullscreen>
  );
};