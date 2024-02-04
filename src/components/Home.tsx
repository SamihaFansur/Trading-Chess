import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  background-image: url('../public/bg.png');
  background-repeat: no-repeat;
  background-size: 100% auto;
  // height: 70vh;
  margin: 0; /* Add this line to reset margins */
  background-color: #DAE3F3;
`;

const HomeHeader = styled.h1`
  text-align: center;
  color: ${props => props.theme.colors.text};
  margin: 3% 0;
  font-family: 'Courier New', monospace;
  font-size: 5.5em;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.5); // Adds shadow to the text
`;

const HomeParagraph = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.text};
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.5rem;
  margin: -10px 35%;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.5); // Adds shadow to the text
`;

const HomeButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between; 
  padding: 0 30%;
  margin: 10% auto 6% auto;
  align-items: center;
  background-color: transparent; 
  max-width: 600px; 
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 51.5%;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #000;
  }
`;



const HomeButton = styled(Link)`
  background: #8FAADC; // Set the background color to #8FAADC
  color: black; // Set the font color to black
  font-family: 'Courier New', monospace;
  font-weight: bold;
  padding: 10px 15px;
  border-radius: 5px; // Remove border-radius for square edges
  border: 2px solid #000;
  font-size: 2rem; // Set the font size to 2rem
  margin: 0.5em;
  text-align: center;
  text-decoration: none; // Remove underline
  display: block; // Ensure it's treated as a block element for alignments

  &:hover {
    text-decoration: underline; // Add underline on hover
  }
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
      <HomeParagraph>
        Learn about Financial Markets and techniques by playing chess, BUT with a twist!
      </HomeParagraph>
      <HomeButtonContainer>
        <HomeButton to="/game">Local</HomeButton>
        <HomeButton to="/game/bot">Bot</HomeButton>
      </HomeButtonContainer>
    </HomeContainer>
  );
};
