import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Grid } from 'react-window';
import { StationCard } from './StationCard';
import { Station, PlaybackStatus } from '../types';

interface VirtualStationGridProps {
  stations: Station[];
  currentStation: Station | null;
  isPlaying: boolean;
  playbackStatus: PlaybackStatus;
  favorites: string[];
  unplayableStationIds: Set<string>;
  onPlay: (station: Station) => void;
  onClick: (station: Station) => void;
  onToggleFavorite: (id: string) => void;
  onAddToPlaylist: (station: Station) => void;
  onTagClick: (tag: string) => void;
  onDelete?: (id: string) => void;
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  stations: Station[];
  currentStation: Station | null;
  isPlaying: boolean;
  playbackStatus: PlaybackStatus;
  favorites: string[];
  unplayableStationIds: Set<string>;
  onPlay: (station: Station) => void;
  onClick: (station: Station) => void;
  onToggleFavorite: (id: string) => void;
  onAddToPlaylist: (station: Station) => void;
  onTagClick: (tag: string) => void;
  onDelete?: (id: string) => void;
  columnCount: number;
}

const Cell: React.FC<CellProps> = React.memo(({
  columnIndex,
  rowIndex,
  style,
  stations,
  currentStation,
  isPlaying,
  playbackStatus,
  favorites,
  unplayableStationIds,
  onPlay,
  onClick,
  onToggleFavorite,
  onAddToPlaylist,
  onTagClick,
  onDelete,
  columnCount
}) => {
  const index = rowIndex * columnCount + columnIndex;
  const station = stations[index];

  if (!station) return null;

  return (
    <div style={style} className="p-2">
      <StationCard
        station={station}
        isPlaying={currentStation?.id === station.id && isPlaying}
        playbackStatus={playbackStatus}
        isCurrent={currentStation?.id === station.id}
        isFavorite={favorites.includes(station.id)}
        isUnplayable={unplayableStationIds.has(station.id)}
        onPlay={onPlay}
        onClick={onClick}
        onToggleFavorite={onToggleFavorite}
        onAddToPlaylist={onAddToPlaylist}
        onTagClick={onTagClick}
        onDelete={onDelete}
      />
    </div>
  );
});

Cell.displayName = 'VirtualGridCell';

export const VirtualStationGrid: React.FC<VirtualStationGridProps> = ({
  stations,
  currentStation,
  isPlaying,
  playbackStatus,
  favorites,
  unplayableStationIds,
  onPlay,
  onClick,
  onToggleFavorite,
  onAddToPlaylist,
  onTagClick,
  onDelete
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const getColumnCount = (width: number) => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
  };

  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      setContainerWidth(width);
      setColumnCount(getColumnCount(width));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const rowCount = Math.ceil(stations.length / columnCount);

  const cellProps = useMemo(() => ({
    stations,
    currentStation,
    isPlaying,
    playbackStatus,
    favorites,
    unplayableStationIds,
    onPlay,
    onClick,
    onToggleFavorite,
    onAddToPlaylist,
    onTagClick,
    onDelete,
    columnCount
  }), [
    stations,
    currentStation,
    isPlaying,
    playbackStatus,
    favorites,
    unplayableStationIds,
    onPlay,
    onClick,
    onToggleFavorite,
    onAddToPlaylist,
    onTagClick,
    onDelete,
    columnCount
  ]);

  const getColumnWidth = (width: number) => {
    if (width < 640) return width - 32;
    if (width < 1024) return (width - 64) / 2;
    if (width < 1280) return (width - 64) / 3;
    return (width - 64) / 4;
  };

  if (stations.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-slate-500">
        <p>没有找到相关电台</p>
      </div>
    );
  }

  return (
    <Grid
      cellComponent={Cell}
      cellProps={cellProps}
      columnCount={columnCount}
      columnWidth={getColumnWidth(containerWidth)}
      rowCount={rowCount}
      rowHeight={420}
      height={Math.min(window.innerHeight - 300, rowCount * 420)}
      width="100%"
      className="scrollbar-hide"
      overscanCount={2}
    />
  );
};
