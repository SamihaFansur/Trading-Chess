import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { pieceToFilename } from '../../game/piece';
import { PieceSymbol } from 'chess.js';

export type MapCoordinateFunc = (x: number, y: number) => [number, number];
export type OnPlaceFunc = (grid_x: number, grid_y: number) => void;
export type OnSelectChangedFunc = (selected: boolean) => void;

interface PieceProps {
  type: PieceSymbol,
  grid_x: number,
  grid_y: number,
  is_white: boolean,
  on_place: OnPlaceFunc;
  pixels_to_grid: MapCoordinateFunc;
  grid_to_pixels: MapCoordinateFunc;
  on_select_change: OnSelectChangedFunc;
  can_click: boolean;
}

interface DragState {
  x: number,
  y: number,
  relx: number,
  rely: number,
}

interface PieceImageProps {
  drag_state: DragState | null;
  moved: boolean;
  gx: number,
  gy: number,
}

const PieceImage = styled.img.attrs((props: PieceImageProps) => {
  if (props.drag_state) return ({
    style: {
      'transform': `translate(${props.drag_state.x - props.drag_state.relx}px, ${props.drag_state.y - props.drag_state.rely}px)`,
      'transition': 'none',
      'zIndex': 15,
    }
  });

  let inject = {};
  if (props.moved) {
    inject = {
      'zIndex': 10,
    }
  }
  return ({
    style: {
      'transform': `translate(${props.gx * 100}%, ${props.gy * 100}%)`,
      ...inject,
    }
  });
}) <PieceImageProps>`
  position: absolute;
  width: 12.5%;
  height: 12.5%;
  top: 0px;
  left: 0px;
  transition: transform 0.5s;
  touch-action: none;
`;

export const ChessPiece: React.FC<PieceProps> = (props) => {
  const pieceRef = useRef<HTMLImageElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [moved, setMoved] = useState<boolean>(false);

  const onMouseDown: React.MouseEventHandler<HTMLImageElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button != 0 || !props.can_click) return;
    const bound = (e.target as HTMLImageElement).getBoundingClientRect();
    const parent = (e.target as HTMLImageElement).parentElement;
    if (parent === null) return;

    const relx = e.pageX - bound.x + parent.offsetLeft;
    const rely = e.pageY - bound.y + parent.offsetTop - window.scrollY;

    props.on_select_change(true);

    setDrag({
      x: e.pageX,
      y: e.pageY,
      relx,
      rely,
    });
  };

  const onTouchDown: React.TouchEventHandler<HTMLImageElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!props.can_click || e.touches.length === 0) return;
    const bound = (e.target as HTMLImageElement).getBoundingClientRect();
    const parent = (e.target as HTMLImageElement).parentElement;
    if (parent === null) return;

    const relx = e.touches[0].pageX - bound.x + parent.offsetLeft;
    const rely = e.touches[0].pageY - bound.y + parent.offsetTop;

    props.on_select_change(true);

    setDrag({
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
      relx: relx,
      rely: rely,
    });
  };

  const onMouseMove = (e: MouseEvent) => {
    if (drag === null) return;
    setDrag(drag => ({
      x: e.pageX,
      y: e.pageY,
      relx: drag !== null ? drag.relx : 0,
      rely: drag !== null ? drag.rely : 0,
    }));

    e.stopPropagation();
    e.preventDefault();
  };

  const onTouchMove = (e: TouchEvent) => {
    if (drag === null && e.touches.length > 0) return;
    setDrag(drag => ({
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
      relx: drag !== null ? drag.relx : 0,
      rely: drag !== null ? drag.rely : 0,
    }));

    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = (e: MouseEvent) => {
    if (drag !== null) {
      props.on_select_change(false);
      setDrag(null);
      const grid_pos = props.pixels_to_grid(e.pageX, e.pageY);
      props.on_place(grid_pos[0], grid_pos[1]);
    }
  };

  const onTouchEnd = () => {
    if (drag !== null) {
      const [pos_x, pos_y] = [drag.x, drag.y];
      props.on_select_change(false);
      setDrag(null);
      const grid_pos = props.pixels_to_grid(pos_x, pos_y);
      props.on_place(grid_pos[0], grid_pos[1]);
    }
  };

  useEffect(() => {
    // start dragging
    if (drag !== null) {
      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp, { passive: false });
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd, { passive: false });
    }

    return () => {
      // stop dragging
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [drag]);

  useEffect(() => {
    // if a piece has moved, this will temporarily give it higher z index
    // this ensures that moving pieces render above their neighbours
    setMoved(true);
    setTimeout(() => {
      setMoved(false);
    }, 500);
  }, [props.grid_x, props.grid_y])

  return (
    <PieceImage
      drag_state={drag}
      moved={moved}
      gx={props.grid_x}
      gy={props.grid_y}
      ref={pieceRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchDown}
      src={pieceToFilename(props.type, props.is_white)}
    />
  );
};