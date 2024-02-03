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

const Container = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 10px;
  display: flex;
  flex-direction: column;

  // min-height: 100vh; /* Full viewport height */
  width: 100%;
  justify-content: flex-start;
  
  background: ${props => props.theme.colors.background};
  position: fixed;
  top: 50%;
  left: 50%;
  
  transform: translate(-50%, -50%);
`;



const useHashRouter: boolean = true;
const Router = useHashRouter ? HashRouter : BrowserRouter;

function App(): JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onClickSettings = () => setSettingsOpen(v => !v);

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
                <ChessProvider>
                  <Chess type="local" />
                </ChessProvider>
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