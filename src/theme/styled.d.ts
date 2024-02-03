import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      text: string;
      background: string;
      grid: string;
      primary: string;
    };
    menus: {
      controls: {
        background: string;
        button: string;
        button_hover: string;
      };
      players: {
        background: string;
      };
      moves: {
        background: string;
        white: string;
        black: string;
        hover: string;
      };
    };
    chess: {
      board_light: string;
      board_dark: string;
      board_text: string;
      move: string;
      move_castle: string;
      move_takes: string;
    };
  }
}