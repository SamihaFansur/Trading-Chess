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

const pieceOrder = {
  k: 0, // King
  q: 1, // Queen
  r: 2, // Rook
  b: 3, // Bishop
  n: 4, // Knight
  p: 5, // Pawn
};

export const LeftSidebar = () => {
  const { state } = useChessContext(); // Access the chess state

  // Filter for white pieces from the current board state and flatten the array
  const whitePieces = state.board.flat().filter(cell => cell && cell.team === 'w');

  // Group pieces by their type and select one piece of each type
  const uniqueWhitePieces = Object.values(whitePieces.reduce((acc, piece) => {
      acc[piece.type] = piece; // Assign or overwrite the type key
      return acc;
  }, {}));

  // Sort pieces by the defined order
  const sortedWhitePieces = uniqueWhitePieces.sort((a, b) => pieceOrder[a.type] - pieceOrder[b.type]);

  return (
      <Sidebar>
          {sortedWhitePieces.map((piece, index) => (
              <PieceContainer key={index}>
                  <PieceImage src={pieceToFilename(piece.type, true)} alt={pieceToName(piece.type)} />
                  <span>{piece.value.toFixed(2)}</span>
              </PieceContainer>
          ))}
      </Sidebar>
  );
};

export const RightSidebar = () => {
  const { state } = useChessContext(); // Access the chess state

  // Filter for black pieces from the current board state and flatten the array
  const blackPieces = state.board.flat().filter(cell => cell && cell.team === 'b');

  // Group pieces by their type and select one piece of each type
  const uniqueBlackPieces = Object.values(blackPieces.reduce((acc, piece) => {
      acc[piece.type] = piece; // Assign or overwrite the type key
      return acc;
  }, {}));

  // Sort pieces by the defined order
  const sortedBlackPieces = uniqueBlackPieces.sort((a, b) => pieceOrder[a.type] - pieceOrder[b.type]);

  return (
      <RightSidebarContainer>
          {sortedBlackPieces.map((piece, index) => (
              <PieceContainer key={index}>
                  <PieceImage src={pieceToFilename(piece.type, false)} alt={pieceToName(piece.type)} />
                  <span>{piece.value.toFixed(2)}</span>
              </PieceContainer>
          ))}
      </RightSidebarContainer>
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