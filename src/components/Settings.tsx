import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { SettingsContext } from '../providers/SettingsProvider';

const SettingsContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 85%;
  border: 2px solid #000;
  padding: 10px;
  background: ${props => props.theme.colors.background};
`;

const SettingsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;

const SettingsTitle = styled.h1`
  margin: 10px 0;
  color: ${props => props.theme.colors.text};
`;

const SettingsCloseButton = styled.h1`
  user-select: none;
  cursor: pointer;
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const SettingsText = styled.p`
  font-size: 1.2em;
  margin: 5px 0;
  color: ${props => props.theme.colors.text};
`;

const SettingsTextCheckbox = styled.input`
`;

const SettingsTextInput = styled.input`
`;

const SettingsNumberInput = styled.input`
`;

const SettingsError = styled.p`
  color: red;
`;

const SettingsInfo = styled.p`
  color: ${props => props.theme.colors.text};
`;

const SettingsLink = styled.a`
  color: ${props => props.theme.colors.text};
`;

interface Props {
  onClickSettings: () => void;
}

export const Settings: React.FC<Props> = ({ onClickSettings }) => {
  const settings = useContext(SettingsContext);

  const systemThemeCheckbox = useRef<HTMLInputElement>(null);
  const darkThemeCheckbox = useRef<HTMLInputElement>(null);
  const allowPauseCheckbox = useRef<HTMLInputElement>(null);
  const useChessNotationCheckbox = useRef<HTMLInputElement>(null);
  const defaultUsernameField = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [length, setLength] = useState(0);
  const [lengthError, setLengthError] = useState('');

  const updateSettings = () => {
    settings.updateSettings(existingState => {
      const nextState = { ...existingState };

      systemThemeCheckbox.current && (nextState.useSystemTheme = systemThemeCheckbox.current.checked);
      darkThemeCheckbox.current && (nextState.darkTheme = darkThemeCheckbox.current.checked);
      allowPauseCheckbox.current && (nextState.allowPause = allowPauseCheckbox.current.checked);
      allowPauseCheckbox.current && (nextState.allowPause = allowPauseCheckbox.current.checked);
      useChessNotationCheckbox.current && (nextState.useChessNotation = useChessNotationCheckbox.current.checked);

      return nextState;
    });
  };

  const validateUsername = (username: string): boolean => {
    return (/^[a-zA-Z0-9 _-]{1,16}$/gi).test(username);
  };

  const updateUsername = (username: string) => {
    setUsername(username);

    settings.updateSettings(existing => {
      if (validateUsername(username))
        existing.defaultUsername = username;

      return { ...existing };
    });
  };

  const updateGameLength = (length: number) => {
    if (isNaN(length) || length < 5 || length > 30) {
      setLengthError('game length must be a number between 5 and 30');
      return;
    } else {
      setLengthError('');
    }
    setLength(length);

    settings.updateSettings(existing => {
      if (length >= 5 && length <= 30)
        existing.gameLength = length;

      return { ...existing };
    });
  };

  useEffect(() => {
    if (validateUsername(username)) {
      setUsernameError('');
    } else {
      setUsernameError('username must be 1-16 characters, containing letters, numbers, spaces, underscores and dashes');
    }
  }, [username]);

  useEffect(() => {
    if (username !== settings.defaultUsername)
      setUsername(settings.defaultUsername);
  }, [settings.defaultUsername]);

  useEffect(() => {
    if (length !== settings.gameLength)
      setLength(settings.gameLength);
  }, [settings.gameLength]);

  return (
    <SettingsContainer>
      <SettingsRow>
        <SettingsTitle>settings</SettingsTitle>
        <SettingsCloseButton onClick={onClickSettings}>
          <FontAwesomeIcon icon={faWindowClose} />
        </SettingsCloseButton>
      </SettingsRow>

      <SettingsRow>
        <SettingsText>match system theme</SettingsText>
        <SettingsTextCheckbox
          type='checkbox'
          ref={systemThemeCheckbox}
          checked={settings.useSystemTheme}
          onChange={() => updateSettings()}
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsText>dark theme</SettingsText>
        <SettingsTextCheckbox
          type='checkbox'
          ref={darkThemeCheckbox}
          checked={settings.isDarkTheme}
          disabled={settings.useSystemTheme}
          onChange={() => updateSettings()}
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsText>allow pause</SettingsText>
        <SettingsTextCheckbox
          type='checkbox'
          ref={allowPauseCheckbox}
          checked={settings.allowPause}
          onChange={() => updateSettings()}
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsText>use chess notation</SettingsText>
        <SettingsTextCheckbox
          type='checkbox'
          ref={useChessNotationCheckbox}
          checked={settings.useChessNotation}
          onChange={() => updateSettings()}
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsText>game length (minutes per player)</SettingsText>
        <SettingsTextInput
          type='number'
          value={length}
          min={5}
          max={30}
          step={5}
          onChange={e => updateGameLength(parseInt(e.target.value))}
        />
      </SettingsRow>
      {lengthError !== '' && <SettingsError>{lengthError}</SettingsError>}
      <SettingsRow>
        <SettingsText>default username</SettingsText>
        <SettingsNumberInput
          ref={defaultUsernameField}
          value={username}
          onChange={e => updateUsername(e.target.value)}
        />
      </SettingsRow>
      {usernameError !== '' && <SettingsError>{usernameError}</SettingsError>}
      <SettingsInfo>
        these settings are stored in your&nbsp;
        <SettingsLink
          href='https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage'
        >
          localStorage
        </SettingsLink>
      </SettingsInfo>
    </SettingsContainer>
  );
};