import React, { useState } from 'react';
import styled from 'styled-components';
import { faUndo, faRedo, faPause, faExpandAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChessContext } from '../../providers/ChessProvider';
import { Error } from '../../util/Error';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background: ${props => props.theme.menus.controls.background};
  user-select: none;
`;

const ControlsButton = styled(FontAwesomeIcon)`
  background: ${props => props.theme.menus.controls.button};
  padding: 9px;
  border-radius: 10px;
  box-shadow: 1px 1px 5px ${props => props.theme.menus.controls.background};
  border: 1px solid #ffffffff;
  transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  cursor: pointer;

  &:hover {
    border: 1px solid #777;
    box-shadow: 1px 1px 5px #aeaeae;
  }

  &:active {
    background: #eee;
  }
`;

interface Props {
  toggleFullscreen: () => void;
  quitGame: () => void;
}

export const Controls: React.FC<Props> = ({ toggleFullscreen, quitGame }) => {
  const { UndoMove, RedoMove, Pause } = useChessContext();
  const [error, setError] = useState('');

  return (
    <ControlsContainer>
      <ControlsButton
        onClick={() => UndoMove() || setError('Undo is disabled')}
        icon={faUndo}
        title="Undo move"
      />
      <ControlsButton
        onClick={() => RedoMove() || setError('Redo is disabled')}
        icon={faRedo}
        title="Redo move"
      />
      <ControlsButton
        onClick={() => Pause() || setError('Pause is disabled')}
        icon={faPause}
        title="Pause"
      />
      <ControlsButton
        onClick={() => toggleFullscreen()}
        icon={faExpandAlt}
        title="Fullscreen"
      />

      <ControlsButton
        onClick={() => quitGame()}
        icon={faSignOutAlt}
        title="Leave game"
      />

      <Error error={error} duration={1000} onErrorClose={() => setError('')} />
    </ControlsContainer>
  );
};
