import React, { createContext, useEffect, useState } from 'react';

export interface Settings {
  hasLoaded: boolean;
  isDarkTheme: boolean;
  darkTheme: boolean;
  useSystemTheme: boolean;
  allowPause: boolean;
  useChessNotation: boolean;
  gameLength: number;
  defaultUsername: string;
}

const InitialSettings: Settings = {
  hasLoaded: false,
  isDarkTheme: false,
  darkTheme: false,
  useSystemTheme: true,
  allowPause: true,
  useChessNotation: false,
  gameLength: 10,
  defaultUsername: 'online player',
};

const colourSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const findExistingSettings = (): Settings => {
  const settings = { ...InitialSettings };

  settings.hasLoaded = true;

  const darkTheme = localStorage.getItem('react-chess.darkTheme');
  darkTheme && (settings.darkTheme = darkTheme === 'true');
  const useSystemTheme = localStorage.getItem('react-chess.useSystemTheme');
  useSystemTheme && (settings.useSystemTheme = useSystemTheme === 'true');
  const allowPause = localStorage.getItem('react-chess.allowPause');
  allowPause && (settings.allowPause = allowPause === 'true');
  const useChessNotation = localStorage.getItem('react-chess.useChessNotation');
  useChessNotation && (settings.useChessNotation = useChessNotation === 'true');

  const length = localStorage.getItem('react-chess.gameLength');
  length && (settings.gameLength = parseInt(length));

  const username = localStorage.getItem('react-chess.defaultUsername');
  username && (settings.defaultUsername = username);

  return settings;
};

const saveSettings = (settings: Settings) => {
  if (!settings.hasLoaded) return;

  for (const [key, value] of Object.entries(settings)) {
    localStorage.setItem(`react-chess.${key}`, value);
  }
  return;
};


type UpdateSettings = React.Dispatch<React.SetStateAction<Settings>>;

export const SettingsContext = createContext<Settings & { updateSettings: UpdateSettings }>({ ...InitialSettings, updateSettings: () => undefined });

interface SettingsProviderProps {
  children?: React.ReactNode,
}

export const SettingsProvider: React.FC<SettingsProviderProps> = (props) => {
  const [settings, setSettings] = useState<Settings>(InitialSettings);
  const [systemDarkMode, setSystemDarkMode] = useState(colourSchemeMediaQuery.matches);

  const updateBrowserTheme = (event: MediaQueryListEvent) => {
    setSystemDarkMode(event.matches);
  };

  useEffect(() => {
    setSettings(findExistingSettings());

    colourSchemeMediaQuery.addEventListener('change', updateBrowserTheme);

    return () => {
      saveSettings(settings);
      colourSchemeMediaQuery.removeEventListener('change', updateBrowserTheme);
    };
  }, []);

  useEffect(() => {
    if (settings.useSystemTheme) {
      if (systemDarkMode !== settings.isDarkTheme)
        setSettings(s => {
          const state = { ...s };
          state.isDarkTheme = systemDarkMode;
          return state;
        });
    } else {
      if (settings.darkTheme !== settings.isDarkTheme)
        setSettings(s => {
          const state = { ...s };
          state.isDarkTheme = settings.darkTheme;
          return state;
        });
    }
  }, [settings.darkTheme, settings.useSystemTheme, systemDarkMode]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings: setSettings }}>
      {props.children}
    </SettingsContext.Provider>
  );
};