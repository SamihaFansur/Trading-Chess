import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Chess } from './components/Chess';
import { Settings } from './components/Settings';
import { Home } from './components/Home';
import { SettingsProvider } from './providers/SettingsProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { GlobalStyles } from './theme/global';
import { ChessProvider } from './providers/ChessProvider';
import { LobbyProvider } from './providers/LobbyProvider';
import TextComponent from './components/TextComponent';

const Container = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: flex-start;
  
  background: ${props => props.theme.colors.background};

  // Scale down to 70%
  transform: scale(0.8);
  transform-origin: top center; // Adjust as needed to change the pivot point of the scaling

  // Center the content horizontally after scaling
  width: 125%; // Increase width to fill the space left by scaling (may need adjustment)
  margin-left: auto;
  margin-right: auto;
`;

// Other styles remain the same



const useHashRouter: boolean = true;
const Router = useHashRouter ? HashRouter : BrowserRouter;

function App(): JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onClickSettings = () => setSettingsOpen(v => !v);
  const ParentContainer = styled.div`
  display: flex;
  justify-content: center; // Center children horizontally
  align-items: center; // Center children vertically
  height: 100vh; // Make the container fill the full viewport height
`;

  return (
    <SettingsProvider>
      <ThemeProvider>
        <Router>
          <GlobalStyles />
          <Container className='App'>
            <Header onClickSettings={onClickSettings} />
            <Routes>
              <Route path="/" element={
                <Home />
              } />
              <Route path="/game/bot" element={
                <ChessProvider>
                  <Chess type='bot' />
                </ChessProvider>
              } />
              <Route path="/game" element={
                <div>
                <ChessProvider>
                  <Chess type="local" />
                </ChessProvider>
                <TextComponent />
              </div>
              } />
            </Routes>
            <Footer />
            {
              settingsOpen && <Settings onClickSettings={onClickSettings} />
            }
          </Container>
        </Router>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;