import React, { useContext } from 'react';
import { ThemeProvider as Theme } from 'styled-components';
import { DarkTheme, LightTheme } from '../theme/themes';
import { SettingsContext } from './SettingsProvider';

interface ThemeProviderProps {
  children?: React.ReactNode,
}

export const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  const settings = useContext(SettingsContext);

  return (
    <Theme theme={settings.isDarkTheme ? DarkTheme : LightTheme}>
      {props.children}
    </Theme>
  );
};