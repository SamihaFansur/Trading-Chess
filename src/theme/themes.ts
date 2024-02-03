import { DefaultTheme } from 'styled-components';

export const LightTheme: DefaultTheme = {
  colors: {
    text: '#000',
    background: '#fff',
    grid: '#eee',
    primary: '#c4b5fd'
  },
  menus: {
    controls: {
      background: '#bbb',
      button: '#fff',
      button_hover: '#eee',
    },
    players: {
      background: '#ddd'
    },
    moves: {
      background: '',
      white: '',
      black: '',
      hover: ''
    }
  },
  chess: {
    board_light: '#e3c06f',
    board_dark: '#b88a4a',
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
    grid: '#eee',
    primary: '#c4b5fd'
  },
  menus: {
    controls: {
      background: '#1e293b',
      button: '#fff',
      button_hover: '#eee',
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
    board_light: '#e3c06f',
    board_dark: '#b88a4a',
    board_text: '#fff',
    move: '',
    move_castle: '',
    move_takes: ''
  }
};