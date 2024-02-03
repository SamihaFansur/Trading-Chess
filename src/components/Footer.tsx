import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color: orange;
  justify-content: center;
  margin: 0; /* Add this line to reset margins */
`;

const FooterText = styled.p`
  font-weight: normal;
  text-align: center; /* Center text within the container */
  color: ${props => props.theme.colors.text};
  /* Add flex: 1; to distribute multiple FooterText components */
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
