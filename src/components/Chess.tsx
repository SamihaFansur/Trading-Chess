import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
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
import { FakeStockChart, FakeStockChartProps } from './FakeStockChart'; // Adjust the path as necessary
import { HasMoved } from '../game/state'
import { count } from 'console';
import { string } from 'prop-types';

let canStart = false;

export const CanStart = (): boolean => {
  return canStart;
};

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
  grid-template-columns: 350px 50% 300px;
  grid-template-rows: 150px 150px 300px; // Include header height as the first row
  grid-template-areas:
    "header header header"
    "rightSidebar chess controls"
    "leftSidebar chess players"
    ". chess moves";



  @media (max-width: 1200px) {
    // Adjustments for medium screens
  }
  
  @media (max-width: 800px) {
    // Adjustments for small screens
  }
  
  @media (max-width: 600px) {
    // Adjustments for very small screens, consider responsive design changes
  }
`;

const Header = styled.div`
  grid-area: header;
  display: flex;
  justify-content: center; // Center items horizontally
  min-height: 300px; // Increased minimum height
`;

const BoardContainer = styled.div`
  grid-area: chess;
  aspect-ratio: 1;
`;

const RSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 2%;
  margin-bottom: -36%;
  // More styling...
`;

const LSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  margin-top: 32%;
  padding: 2%;
  margin-bottom: -70%;
  // More styling...
`;


const PieceImage = styled.img`
  width: auto; // Set width as needed
  height: 30px; // Maintain aspect ratio
  // Add additional styling if needed
`;

const PieceContainer = styled.div`
  display: grid;
  grid-template-columns: 50px 175px 50px 95px; // Adjusted the width of the columns
  align-items: center;
  gap: 0px;
  width: 100%;
  // More styling...
`;



const StockDropdown = styled.select`
  width: 100%;
  // Add more styling as needed
`;

const StockValue = styled.div`
  // Style for the stock value display
`;

const ChartContainer = styled.div`
  width: 20%; // Adjusted to take full width of its parent container
  height: 50%; // Adjusted for auto height to accommodate the charts' heights

  display: flex;
  justify-content: center; // Center the charts horizontally
  align-items: flex-start; // Align charts at the top
  flex-wrap: nowrap; // Prevent wrapping into the next row
  gap: 0px; // Adjusted gap for spacing between charts
  margin-top: 0px; // Space above the charts row
`;

const stockOptions = [
  { code: 'Default', label: '-' }, // Default option
  { code: 'MSFT', label: 'Microsoft Corporation (MSFT) - Technology' },
  { code: 'PG', label: 'Procter & Gamble Co. (PG) - Consumer Goods' },
  { code: 'TSLA', label: 'Tesla Inc. (TSLA) - Automotive/Electric Vehicles' },
  { code: 'AMZN', label: 'Amazon.com Inc. (AMZN) - E-commerce/Technology' },
  { code: 'AAPL', label: 'Apple Inc. (AAPL) - Technology/Electronics' }
];


const Select = styled.select`
  margin: 0 10px;
  // Add additional styling if needed
`;

const StockDropdownComponent = ({ onChange }) => (
  <StockDropdown onChange={onChange}>
    {StockOptions.map((option) => (
      <option value={option.value} key={option.value}>{option.label}</option>
    ))}
  </StockDropdown>
);



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
      <LSidebar>
          {sortedWhitePieces.map((piece, index) => (
              <PieceContainer key={index}>
                  <PieceImage src={pieceToFilename(piece.type, true)} alt={pieceToName(piece.type)} />
                  <Select>
                    {stockOptions.map(option => (
                      <option disabled={HasMoved()} key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </Select>
                  <span>Stock Value</span>
                  <span>{piece.value.toFixed(2)}</span>
              </PieceContainer>
          ))}
      </LSidebar>
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

  // Group pieces by their type and select one piece of each type
  let countSelected = "";

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    countSelected += selectedOption;
    if (countSelected.includes("-") || countSelected.length < 1) {
      canStart = false;
    };
    canStart = true;
    console.log("Selected option: ", selectedOption);
    // You can add more code here to handle the selected option
  };
  return (
      <RSidebar>
          {sortedBlackPieces.map((piece, index) => (
              <PieceContainer key={index}>
                  <PieceImage src={pieceToFilename(piece.type, false)} alt={pieceToName(piece.type)} />
                  <Select onChange={handleSelectChange}>
                    {stockOptions.map(option => (
                      <option disabled={HasMoved()} key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </Select>
                  <span>Stock Value</span>
                  <span>{piece.value.toFixed(2)}</span>
              </PieceContainer>
          ))}
      </RSidebar>
  );
};





interface ChessProps {
  type: 'local' | 'bot' 
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

  const TutorialCanvas = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const onClose = () => {
      document.getElementById('tutorialCanvas')?.remove();
    };
  
    const handleBackwards = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };
  
    const handleForward = () => {
      setCurrentPage(currentPage + 1);
      
    };
    
    
    return (
      <div id="tutorialCanvas" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.93)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        zIndex: 9999,
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: 30,
          right: 30,
          fontSize: '2em',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}>
          X
        </button>

        <div style={{padding: '20px'}}>

        {currentPage === 1 && (
          <>
            <h1 style={{ fontSize: '3em', textAlign: 'center' }}>Trading Chess: A Strategic Blend of Chess and Financial Savvy</h1>
            <h2 style={{ fontSize: '2em', textAlign: 'center' }}>Welcome to the tutorial!</h2>
            <p><b>Objective:</b>Checkmate your opponent's king, while maximizing your portfolio value through smart asset allocation and calculated moves.</p>
          </>
        )}
        {currentPage === 2 && (
          <>
            <h1 style={{ fontSize: '2em' }}>Board and Pieces:</h1>
            <p style={{ textAlign: 'left' }}> - The board and pieces are identical to the classic chess.</p>
            <p style={{ textAlign: 'left' }}> - Each piece represents an asset class. You assign these assets to your pieces before the game begins.</p>
            <p style={{ textAlign: 'left' }}> - You can view current stock prices for all available assets at the top of the screen.</p>
          </>
        )}
        {currentPage === 3 && (
          <>
            <h1 style={{ fontSize: '2em' }}>Movement:</h1>
            <p style={{ textAlign: 'left' }}>- Pieces move based on their standard chess movement patterns (pawn, rook, knight, bishop, queen, king).</p>
            <p style={{ textAlign: 'left' }}> - Crucially, a piece with a lower stock price cannot capture a pawn with a higher value.</p>
            <p style={{ textAlign: 'left' }}> - You can choose to prioritize speed (move immediately) or wait for a price update before moving a piece. Price updates may reveal valuable information to inform your decisions.</p>
          </>
        )}
        {currentPage === 4 && (
          <>
            <h1 style={{ fontSize: '2em' }}>Assignment and Research:</h1>
            <p style={{ textAlign: 'left' }}>- On the left-hand side, assign an asset to each piece before the game.</p>
            <p style={{ textAlign: 'left' }}> - Use the "read about them" buttons if you're unfamiliar with a company.</p>
            <p style={{ textAlign: 'left' }}> - Consider factors like current price, volatility, and market sentiment when assigning assets.</p>
          </>
        )}
        {currentPage === 5 && (
          <>
            <h1 style={{ fontSize: '2em' }}>Strategy Tips:</h1>
            <p style={{ textAlign: 'left' }}>- Seek value: Prioritize capturing pieces with lower stock prices than your own.</p>
            <p style={{ textAlign: 'left' }}> - Mind the market: Stay updated on real-time price movements and adjust your strategy accordingly.</p>
            <p style={{ textAlign: 'left' }}> - Think long-term: Plan your moves based on both immediate gains and potential future value changes.</p>
            <p style={{ textAlign: 'left' }}> Sacrifice wisely: Consider sacrificing pawns for strategically valuable captures.</p>
            <p style={{ textAlign: 'left' }}> - Adapt and react: Adjust your approach based on your opponent's moves and market fluctuations.</p>
          </>
        )}
        {currentPage === 6 && (
          <>
            <h1 style={{ fontSize: '2em' }}>Remember:</h1>
            <p style={{ textAlign: 'left' }}> - This is a game of skill and strategy, not pure luck.</p>
            <p style={{ textAlign: 'left' }}> - Knowledge of chess combined with financial understanding will give you an edge.</p>
            <p style={{ textAlign: 'left' }}> - Practice and experimentation are key to mastering Trading Chess!</p>
            <p></p>
            <p>Ready to test your mettle? Gather your knowledge, sharpen your strategies, and conquer the market chessboard!</p>
          </>
        )}
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '1.5em',
        }}>
          Page {currentPage} of 6
        </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '1.5em',
        }}>
          {currentPage === 1 ? null : <button onClick={handleBackwards}>Previous page</button>}
          {currentPage === 6 ? <button onClick={onClose}>Close Tutorial</button> : <button onClick={handleForward}>Next page</button>}
        </div>
      </div>
    );
  };
  
  return (
    <Fullscreen isFullscreen={fullscreen}>
      <TutorialCanvas onClose={() => {}} />
      <ChessContainer fullscreen={fullscreen}>
        <GameContainer fullscreen={fullscreen}>
          <Header>
            {/* Place ChartContainer with charts inside the Header */}
            <ChartContainer>
              <FakeStockChart stockSymbol="MSFT" />
              <FakeStockChart stockSymbol="AAPL" /> {/* Example for another stock */}
              <FakeStockChart stockSymbol="PG" />
              <FakeStockChart stockSymbol="TSLA" />
              <FakeStockChart stockSymbol="AMZN" />

              {/* Add more FakeStockChart components as needed */}
            </ChartContainer>
          </Header>
          <RightSidebar /> {/* Existing RightSidebar */}
          <BoardContainer>
            <Chessboard />
          </BoardContainer>
          <Controls
            toggleFullscreen={() => toggleFullscreen()}
            quitGame={() => quitGame()}
          />
          <Players />
          <Moves />
          <LeftSidebar /> {/* Existing LeftSidebar */}
        </GameContainer>
      </ChessContainer>
    </Fullscreen>
  );
};
