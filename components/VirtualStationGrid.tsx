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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  const getColumnCount = (width: number) => {
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount(window.innerWidth));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const width = container.offsetWidth || window.innerWidth;
      setContainerWidth(width);
      setColumnCount(getColumnCount(width));
    };

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);
    updateWidth();

    return () => {
      resizeObserver.disconnect();
    };
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
    const padding = 16 * 2;
    const gap = 16 * (columnCount - 1);
    return (width - padding - gap) / columnCount;
  };

  if (stations.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-slate-500">
        <p>没有找到相关电台</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex-1 overflow-y-auto scrollbar-hide">
      <Grid
        cellComponent={Cell}
        cellProps={cellProps}
        columnCount={columnCount}
        columnWidth={getColumnWidth(containerWidth)}
        rowCount={rowCount}
        rowHeight={420}
        height={Math.min(window.innerHeight - 280, rowCount * 420 + 20)}
        width={containerWidth}
        style={{ overflow: 'hidden' }}
        overscanCount={2}
      />
    </div>
  );
};
