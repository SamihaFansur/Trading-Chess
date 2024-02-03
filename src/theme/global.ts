import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
body, html {
  margin: 0;
  font-family: 'Consolas',
    monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  background: ${props => props.theme.colors.background};
}

#root {
  height: 100%;
}

::-webkit-scrollbar{
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-thumb{
  background: #B3AFB3;
  border-radius: 9px;
}
::-webkit-scrollbar-thumb:hover{
  background: #B3AFB3;
}
::-webkit-scrollbar-track{
  background: #FFFFFF00;
  border-radius: 9px;
  box-shadow: inset 0px 0px 0px 0px #F0F0F000;
}
`;