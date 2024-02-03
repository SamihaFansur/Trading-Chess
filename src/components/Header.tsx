import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-content: center;
  background-image: url('../public/headerBg.png');
  background-repeat: no-repeat;
  background-size: 100% auto;
  padding: 0 30px;
  margin: 0; /* Add this line to reset margins */
`;


const HeaderText = styled.h1`
  font-weight: normal;
  color: ${props => props.theme.colors.text};
`;

const HeaderSpacer = styled.div`
  flex-grow: 1;
`;

const HeaderButton = styled.h1`
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  color: ${props => props.theme.colors.text};
`;

const HeaderLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.theme.colors.text};
`;

interface Props {
  onClickSettings: () => void;
}

export const Header: React.FC<Props> = ({ onClickSettings }) => {
  return (
    <HeaderContainer>
      <HeaderText>
        <HeaderLink to="/">♘</HeaderLink> The Code Fathers
      </HeaderText>
      <HeaderSpacer />
      <HeaderButton onClick={onClickSettings}>
        <FontAwesomeIcon icon={faCog} style={{ margin: 'auto', color: 'white' }} />
      </HeaderButton>
    </HeaderContainer>
  );
};