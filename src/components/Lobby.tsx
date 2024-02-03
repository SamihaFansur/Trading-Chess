import { useLobbyContext } from '@/providers/LobbyProvider';
import { SettingsContext } from '@/providers/SettingsProvider';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const LobbyContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const LobbyHeader = styled.div`
  display: flex;
  align-items: center;
`;

const LobbyHeaderText = styled.h1`
  color: ${props => props.theme.colors.text};
  flex: 1;
  font-size: 3em;
`;

const LobbyHeaderID = styled.input`
  font-size: 2em;
  width: 140px;
  text-align: center;
`;

const LobbyHeaderCopyID = styled.button`
  font-size: 2em;
`;

const LobbyDetails = styled.div`
`;

const LobbyControls = styled.div`
`;

const LobbyButton = styled.button`
  font-size: 2em;
`;

const LobbyText = styled.p`
  color: ${props => props.theme.colors.text};
`;

const LobbyError = styled.h1`
  color: red;
`;

export const Lobby: React.FC = () => {
  const lobby = useLobbyContext();
  const { id } = useParams();
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();
  const { hasLoaded } = useContext(SettingsContext);

  useEffect(() => {
    if (lobby.type === 'loading') return;
    if (lobby.type === 'lobby') {
      if (!id) {
        navigate(`/lobby/${lobby.lobby.lobbyId}/`);
        window.location.reload();
      }
      return;
    }
    if (lobby.type === 'ingame') {
      navigate(`/game/${lobby.lobby.lobbyId}/`);
      return;
    }
    if (!hasLoaded) return;

    if (id) {
      lobby.Connect(id, setError);
    } else {
      lobby.Create(setError);
    }
  }, [lobby.type, id, hasLoaded]);

  return (
    <LobbyContainer>
      <LobbyHeader>
        <LobbyHeaderText>lobby</LobbyHeaderText>
        {
          lobby.type === 'lobby' && (
            <>
              <LobbyHeaderID value={lobby.lobby.lobbyId} type="text" disabled />
              <LobbyHeaderCopyID
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                copy
              </LobbyHeaderCopyID>
            </>
          )
        }
      </LobbyHeader>
      {
        error ? (
          <>
            <LobbyError>{error}</LobbyError>
          </>
        ) :
          lobby.type === 'lobby' ? (<>
            <LobbyDetails>
              <LobbyText>white: {lobby.lobby.players.w.name}</LobbyText>
              {
                lobby.lobby.players.b && <LobbyText>black: {lobby.lobby.players.b.name}</LobbyText>
              }
              <LobbyText>spectators:{' '}
                {
                  (lobby && lobby.lobby.spectators && lobby.lobby.spectators.length > 0) ?
                    lobby.lobby.spectators.map(spectator => <span key={spectator.uid}>{spectator.name}</span>)
                    : <span>none</span>
                }
              </LobbyText>
              <LobbyText>game length: 5 minutes (change in settings)</LobbyText>
            </LobbyDetails>
            {
              lobby.lobby.hostUid === lobby.uid && (
                <LobbyControls
                  onClick={lobby.Start}
                >
                  <LobbyButton>start game</LobbyButton>
                </LobbyControls>
              )
            }
          </>) : (
            <LobbyText>{id ? 'connecting to' : 'creating'} lobby...</LobbyText>
          )
      }
    </LobbyContainer >
  );
};
