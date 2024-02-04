import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color:#8FAADC;
  justify-content: center;
  margin: 0;
`;

const FooterText = styled.p`
  font-weight: normal;
  text-align: center;
  color: ${props => props.theme.colors.text};
`;

const FooterSpacer = styled.div`
  flex-grow: 1;
`;

const FooterLink = styled.a`
  color: ${props => props.theme.colors.text};
`;

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterText>
        2024 IcHack Team
      </FooterText>
    </FooterContainer>
  );
};
