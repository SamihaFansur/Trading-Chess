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

  // min-height: 100vh; /* Full viewport height */
  // position: fixed;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
`;



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