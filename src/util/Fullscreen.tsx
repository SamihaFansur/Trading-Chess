import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import fscreen from 'fscreen';
import { Error } from './Error';

const FullscreenContainer = styled.div<{ fullscreen: boolean }>`
  overflow: ${props => props.fullscreen ? 'scroll' : 'default'};
  padding: 0;
  margin: 0;
`;

interface Props {
  isFullscreen: boolean;
  children?: React.ReactNode;
}

export const Fullscreen: React.FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  const [error, setError] = useState('');

  const fscreenChange = () => {
    if (fscreen.fullscreenElement !== null) {
      setFull(true);
    } else {
      setFull(false);
    }
  };

  useEffect(() => {
    fscreen.addEventListener('fullscreenchange', fscreenChange, false);
    return () => fscreen.removeEventListener('fullscreenchange', fscreenChange, false);
  }, []);

  useEffect(() => {
    if (containerRef.current === null || !fscreen.fullscreenEnabled) {
      if (props.isFullscreen)
        setError('fullscreen is not available!');
      return;
    }

    if (props.isFullscreen && !full) {
      fscreen.requestFullscreen(containerRef.current);
    } else if (!props.isFullscreen && full) {
      fscreen.exitFullscreen();
    }
  }, [props.isFullscreen]);

  return (
    <FullscreenContainer ref={containerRef} fullscreen={full}>
      {props.children}
      <Error error={error} duration={1000} onErrorClose={() => setError('')} />
    </FullscreenContainer>
  );
};
