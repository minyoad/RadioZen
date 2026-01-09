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

interface CellData {
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

  const getColumnCount = () => {
    if (containerWidth === 0) return 1;
    if (containerWidth < 640) return 1;
    if (containerWidth < 1024) return 2;
    if (containerWidth < 1280) return 3;
    return 4;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      setContainerWidth(width);
      setColumnCount(getColumnCount());
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const rowCount = Math.ceil(stations.length / columnCount);

  const cellData: CellData = useMemo(() => ({
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

  const getColumnWidth = () => {
    if (containerWidth < 640) return containerWidth - 32;
    if (containerWidth < 1024) return (containerWidth - 64) / 2;
    if (containerWidth < 1280) return (containerWidth - 64) / 3;
    return (containerWidth - 64) / 4;
  };

  const Cell = React.memo(({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
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
      cellProps={cellData}
      columnCount={columnCount}
      columnWidth={getColumnWidth()}
      rowCount={rowCount}
      rowHeight={420}
      height={Math.min(window.innerHeight - 300, rowCount * 420)}
      width="100%"
      className="scrollbar-hide"
      overscanCount={2}
    />
  );
};
