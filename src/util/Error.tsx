import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props {
  error: string;
  duration: number;
  onErrorClose: () => void;
}

const ErrorText = styled.p<{ opacity: number }>`
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background: #000000AA;
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  opacity: ${props => props.opacity};
  transition: opacity 0.5s;
`;

export const Error: React.FC<Props> = ({ error, duration, onErrorClose }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [errorOpac, setErrorOpac] = useState(1);

  useEffect(() => {
    setErrorMsg(error);

    if (error != '') {
      setTimeout(() => {
        setErrorOpac(0);
      }, duration);
      const errorTimeout = setTimeout(() => {
        setErrorOpac(1);
        setErrorMsg('');
        onErrorClose();
      }, duration + 500);
      return () => clearTimeout(errorTimeout);
    }
  }, [error]);

  return (
    <>
      {errorMsg !== '' && <ErrorText opacity={errorOpac}>{errorMsg}</ErrorText>}
    </>
  );
};