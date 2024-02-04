import { DefaultTheme } from 'styled-components';

export const LightTheme: DefaultTheme = {
  colors: {
    text: '#000',
    background: '#fff',
    grid: '#f9f9f9',
    primary: '#c4b5fd'
  },
  menus: {
    controls: {
      background: '#bbbb', // Light Blue
      button: '#fff',
      button_hover: '#f9f9f9',
    },
    players: {
      background: '#f0f8ff', // Alice Blue
    },
    moves: {
      background: '', // You can update these colors as needed
      white: '',
      black: '',
      hover: ''
    }
  },
  chess: {
    board_light: '#0000', // Light Blue
    board_dark: '#8FAADC', // Sky Blue
    board_text: '#fff',
    move: '',
    move_castle: '',
    move_takes: ''
  }
};

export const DarkTheme: DefaultTheme = {
  colors: {
    text: '#fff',
    background: '#0f172a',
    grid: '#f9f9f9',
    primary: '#c4b5fd'
  },
  menus: {
    controls: {
      background: '#1e293b',
      button: '#fff',
      button_hover: '#f9f9f9',
    },
    players: {
      background: '#334155'
    },
    moves: {
      background: '#475569',
      white: '#475569',
      black: '#52525b',
      hover: '#94a3b8'
    }
  },
  chess: {
    board_light: '#add8e6', // Light Blue
    board_dark: '#87cefa', // Sky Blue
    board_text: '#fff',
    move: '',
    move_castle: '',
    move_takes: ''
  }
};