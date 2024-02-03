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
import { Color, PieceSymbol, Square } from 'chess.js';
import { pieceToFilename, pieceToName, pieceToString } from '@/game/piece';


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
  grid-template-columns: 200px auto 200px 250px  ; // Added sidebars
  grid-template-rows: 60px auto 120px 200px; // Adjusted rows
  grid-template-areas:
    "leftSidebar chess chess controls"
    "leftSidebar chess chess players "
    "leftSidebar chess chess moves"
    "rightSidebar chess chess moves"; // Adjusted areas
  

  @media (max-width: 1200px) {
    grid-template-columns: 150px auto 200px 300px; // Slightly smaller sidebars for medium screens
  }
  
  @media (max-width: 800px) {
    grid-template-columns: 100px auto 100px; // Sidebar, chessboard, and sidebar
    grid-template-rows: 60px auto 120px;
    grid-template-areas:
      "leftSidebar chess"
      "controls chess"
      "players chess moves"; // Adjust for small screens
  }
  
  @media (max-width: 600px) {
    grid-template-columns: auto; // Only chessboard
    grid-template-rows: 60px auto 60px 120px;
    grid-template-areas:
      "controls"
      "chess"
      "players"
      "moves"; // Stack all components vertically for very small screens
  }
    
`;


const BoardContainer = styled.div`
  grid-area: chess;
  aspect-ratio: 1;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 10px;
  background-color: #f9f9f9; // Example color, adjust as needed
.
`;

const PieceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0px 0;
  // More styling...
`;

const RightSidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 10px;
  background-color: #f9f9f9; // Example color, adjust as needed
  // More styling...
`;


const PieceImage = styled.img`
  width: auto; // Set width as needed
  height: 30px; // Maintain aspect ratio
  // Add additional styling if needed
`;


export const LeftSidebar = () => {
  const whitePieces: PieceSymbol[] = ['p', 'r', 'n', 'b', 'q', 'k']; // Example piece symbols

  return (
    <Sidebar>
      {whitePieces.map((pieceSymbol, index) => (
        <PieceContainer key={index}>
          <PieceImage src={pieceToFilename(pieceSymbol, true)} alt={pieceToName(pieceSymbol)} />
          {/* Placeholder for future piece value */}
          <span>Value</span>
        </PieceContainer>
      ))}
    </Sidebar>
  );
};


export const DummySidebar = () => {
  return (
    <Sidebar>
      <PieceContainer>
        <span></span>
      </PieceContainer>
      <PieceContainer>
        <span></span>
      </PieceContainer>
      <PieceContainer>
        <span></span>
      </PieceContainer>
      {/* Add more pieces as needed */}
    </Sidebar>
  );
};

export const RightSidebar = () => {
  const blackPieces: PieceSymbol[] = ['p', 'r', 'n', 'b', 'q', 'k']; // Example piece symbols

  return (
    <RightSidebarContainer>
      {blackPieces.map((pieceSymbol, index) => (
        <PieceContainer key={index}>
          <PieceImage src={pieceToFilename(pieceSymbol, false)} alt={pieceToName(pieceSymbol)} />
          {/* Placeholder for future piece value */}
          <span>Value</span>
        </PieceContainer>
      ))}
    </RightSidebarContainer>
  );
};



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
        <DummySidebar /> {/* Use dummy */}

          <BoardContainer>
            <Chessboard />
          </BoardContainer>
          <Controls
            toggleFullscreen={() => toggleFullscreen()}
            quitGame={() => quitGame()}
          />
          <Players />
          <Moves />
        <RightSidebar /> {/* Use RightSidebar */}
        <LeftSidebar /> {/* Use LeftSidebar */}

        </GameContainer>
      </ChessContainer>
    </Fullscreen>
  );
};