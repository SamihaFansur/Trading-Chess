import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  background-image: url('../public/bg.png');
  background-repeat: no-repeat;
  background-size: 100% auto;
  border: 2px solid black;
  height: 70vh;
  margin: 0; /* Add this line to reset margins */
`;


const HomeHeader = styled.h1`
  text-align: center;
  color: ${props => props.theme.colors.text};
  background-color: blue;
  margin: 8% 0;
`;

const HomeParagraph = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.text};
`;

const HomeButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  max-width: 200px;
  padding: 100px;
  margin: 0 auto;
  align-items: center;
`;

const HomeButton = styled(Link)`
  background: ${props => props.theme.colors.primary};
  padding: 10px;
  border-radius: 10px;
  border: 2px solid #000;
  font-size: 2em;
  margin: 0.5em;
  text-align: center;
`;

const HomeInput = styled.input`
  font-size: 2em;
  width: 140px;
  text-align: center;
  padding: 10px;
  border-radius: 10px;
`;

export const Home: React.FC = () => {
  const idRef = useRef<HTMLInputElement>(null);
  const [id, setId] = useState('');

  return (
    <HomeContainer>
      <HomeHeader>CREATE A GAME</HomeHeader>
      <HomeButtonContainer>
        <HomeButton to="/game">Local</HomeButton>
        <HomeButton to="/game/bot">Bot</HomeButton>
      </HomeButtonContainer>
      <HomeParagraph>
        Play chess against a local player or a bot.
      </HomeParagraph>
    </HomeContainer>
  );
};
