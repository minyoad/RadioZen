import React, { useState, useRef, useEffect, useMemo } from 'react';
import Hls from 'hls.js';
import { Sidebar } from './components/Sidebar';
import { StationCard } from './components/StationCard';
import { PlayerBar } from './components/PlayerBar';
import { Playlist } from './components/Playlist';
import { BottomNav } from './components/BottomNav';
import { MobileFullPlayer } from './components/MobileFullPlayer';
import { StationDetail } from './components/StationDetail';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { AddStationModal } from './components/AddStationModal';
import { STATIONS, CATEGORIES } from './constants';
import { Station, UserProfile } from './types';
import { Search, Bell, Menu, Heart, History, X, Plus } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Music Lover',
  bio: '热爱音乐，热爱生活',
  avatarUrl: 'https://picsum.photos/seed/user/200/200',
  joinDate: new Date().getFullYear().toString(),
  isPro: false,
  level: 1,
  listeningMinutes: 0
};

// Helper for initial validation
const validateStation = (station: Station): boolean => {
  if (!station.streamUrl || typeof station.streamUrl !== 'string') return false;
  try {
    // Basic URL structure check
    const url = new URL(station.streamUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    
    // Check fallback if exists
    if (station.fallbackStreamUrl) {
       new URL(station.fallbackStreamUrl);
    }
    return true;
  } catch (e) {
    console.warn(`Skipping invalid station URL [${station.name}]:`, station.streamUrl);
    return false;
  }
};

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Custom Stations State (Persisted)
  const [customStations, setCustomStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem('customStations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load custom stations", e);
      return [];
    }
  });

  // Modal State
  const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false);

  // Initialize stations with validation, merging default and custom
  const stations = useMemo(() => {
    return [...STATIONS, ...customStations].filter(validateStation);
  }, [customStations]);
  
  // Track unplayable stations (runtime errors)
  const [unplayableStationIds, setUnplayableStationIds] = useState<Set<string>>(new Set());

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch (e) {
      console.error("Failed to load user profile", e);
      return DEFAULT_PROFILE;
    }
  });

  // Playlist State
  const [playlist, setPlaylist] = useState<Station[]>([]);
  // 'all' means playing from the main list/grid. 'playlist' means playing from the user queue.
  const [playContext, setPlayContext] = useState<'all' | 'playlist'>('all');

  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [detailViewStation, setDetailViewStation] = useState<Station | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Recent Stations State
  const [recentStationIds, setRecentStationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentStations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load recent stations", e);
      return [];
    }
  });

  // Fallback & Upgrade state
  const [useFallback, setUseFallback] = useState(false);
  const [autoHttpsUpgrade, setAutoHttpsUpgrade] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCount = useRef(0);
  const fadeIntervalRef = useRef<number | null>(null);

  // --- Volume Fading Logic ---
  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const startFadeIn = () => {
    const audio = audioRef.current;
    if (!audio) return;

    clearFade();

    const stationGain = currentStation?.gain ?? 1.0;
    const targetVol = isMuted ? 0 : Math.min(1.0, Math.max(0, volume * stationGain));

    // Start from 0 for soft start
    audio.volume = 0;

    const duration = 1500; // 1.5s
    const stepTime = 50;
    const step = targetVol / (duration / stepTime);

    fadeIntervalRef.current = window.setInterval(() => {
      if (!audio) return;
      const newVol = audio.volume + step;
      if (newVol >= targetVol) {
        audio.volume = targetVol;
        clearFade();
      } else {
        audio.volume = newVol;
      }
    }, stepTime);
  };

  const fadeOut = async () => {
    const audio = audioRef.current;
    if (!audio || audio.paused || audio.volume === 0) return;

    clearFade();

    return new Promise<void>(resolve => {
      const duration = 500; // 0.5s fade out
      const stepTime = 30;
      const startVol = audio.volume;
      const step = startVol / (duration / stepTime);

      fadeIntervalRef.current = window.setInterval(() => {
        if (!audio) { resolve(); return; }
        const newVol = audio.volume - step;
        if (newVol <= 0) {
          audio.volume = 0;
          clearFade();
          resolve();
        } else {
          audio.volume = newVol;
        }
      }, stepTime);
    });
  };

  // Effect: Theme Management
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Effect: Save User Profile
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Effect: Save Custom Stations
  useEffect(() => {
    localStorage.setItem('customStations', JSON.stringify(customStations));
  }, [customStations]);

  // Effect: Track Listening Time (run every minute if playing)
  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setUserProfile(prev => ({
          ...prev,
          listeningMinutes: prev.listeningMinutes + 1,
          // Simple level up logic: 1 level every 60 minutes
          level: Math.floor((prev.listeningMinutes + 1) / 60) + 1
        }));
      }, 60000); // 1 minute
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Effect: Volume control with Station Gain Normalization
  useEffect(() => {
    if (audioRef.current) {
      // If user adjusts volume manually, stop fading and apply immediately
      clearFade();
      
      if (isMuted) {
        audioRef.current.volume = 0;
      } else {
        // Apply station specific gain. Default to 1.0 if not set.
        const stationGain = currentStation?.gain ?? 1.0;
        // Calculate effective volume
        const effectiveVolume = volume * stationGain;
        // Clamp result between 0 and 1
        audioRef.current.volume = Math.min(1.0, Math.max(0, effectiveVolume));
      }
    }
  }, [volume, isMuted]); // Removed currentStation dependency to avoid conflict with fade-in

  // Effect: Switch to discover tab when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      setActiveTab('discover');
    }
  }, [searchQuery]);

  // Effect: Handle Source Loading (Normal vs HLS)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStation) return;

    // Check if station is already marked as unplayable to prevent repeated failed attempts
    if (unplayableStationIds.has(currentStation.id)) {
      setIsPlaying(false);
      return;
    }

    // Determine which URL to use (primary or fallback)
    let src = useFallback && currentStation.fallbackStreamUrl 
      ? currentStation.fallbackStreamUrl 
      : currentStation.streamUrl;

    // Logic: If automatic upgrade is triggered and the URL is http, switch to https
    if (autoHttpsUpgrade && src.startsWith('http:')) {
      src = src.replace('http:', 'https:');
    }

    const isM3u8 = src.includes('.m3u8') || src.includes('application/x-mpegurl');

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
      retryCount.current = 0; // Reset retry count on source change
    }

    // Prepare audio element for fade in (start silent)
    audio.volume = 0;

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        // Increase timeout settings for slow connections
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 3,
      });
      hlsRef.current = hls;
      
      hls.loadSource(src);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        retryCount.current = 0; // Reset retry count on successful load
        if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
             playPromise.then(() => {
                 startFadeIn();
             }).catch(error => {
                if (error.name === 'AbortError') return;
                console.error("HLS Auto-play failed:", error instanceof Error ? error.message : String(error));
             });
          }
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error(`HLS Network error: ${data.details}`);
              
              if (!autoHttpsUpgrade && src.startsWith('http:')) {
                console.log('HLS Network Error: Attempting auto-upgrade to HTTPS...');
                setAutoHttpsUpgrade(true);
                return;
              }

              if (retryCount.current < 2) {
                retryCount.current++;
                console.log(`Attempting to recover from network error (attempt ${retryCount.current}/2)...`);
                hls.startLoad();
              } else {
                if (!useFallback && currentStation.fallbackStreamUrl) {
                  console.warn("HLS Network error: Max retries reached. Switching to fallback stream...");
                  setUseFallback(true);
                  setAutoHttpsUpgrade(false);
                } else {
                  console.error("HLS Network error: Max retries reached. Marking station as unplayable.");
                  hls.destroy();
                  setIsPlaying(false);
                  
                  setUnplayableStationIds(prev => {
                      const next = new Set(prev);
                      next.add(currentStation.id);
                      return next;
                  });
                }
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS Media error, recovering...");
              hls.recoverMediaError();
              break;
            default:
              console.error(`HLS Fatal error: ${data.details}`);
              hls.destroy();
              setIsPlaying(false);
               setUnplayableStationIds(prev => {
                  const next = new Set(prev);
                  next.add(currentStation.id);
                  return next;
              });
              break;
          }
        }
      });
    } else {
      // Native Audio (MP3 or Native HLS on Safari)
      audio.src = src;
      audio.load();
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
           playPromise.then(() => {
               startFadeIn();
           }).catch(error => {
              if (error.name === 'AbortError') return;
              console.error("Playback failed:", error instanceof Error ? error.message : String(error));
              setIsPlaying(false);
           });
        }
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      clearFade();
    };
  }, [currentStation?.id, useFallback, autoHttpsUpgrade, unplayableStationIds]);

  // Effect: Handle Play/Pause toggling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStation) return;

    if (isPlaying) {
      if (audio.paused) {
        if (audio.src || (hlsRef.current && audio.src)) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
                startFadeIn();
            }).catch(error => {
              if (error.name === 'AbortError' || error.name === 'NotSupportedError') return;
              console.error("Play toggle failed:", error instanceof Error ? error.message : String(error));
            });
          }
        }
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying]);


  // --- Handlers ---

  const handleAddCustomStation = (newStation: Station) => {
    setCustomStations(prev => [...prev, newStation]);
    setFavorites(prev => [...prev, newStation.id]);
    setActiveTab('favorites');
  };

  const handleDeleteCustomStation = (id: string) => {
    if (window.confirm("确定要删除这个自定义电台吗？")) {
       setCustomStations(prev => prev.filter(s => s.id !== id));
       setFavorites(prev => prev.filter(fid => fid !== id));
       setRecentStationIds(prev => prev.filter(rid => rid !== id));
       setPlaylist(prev => prev.filter(s => s.id !== id));
       
       if (currentStation?.id === id) {
           setIsPlaying(false);
           setCurrentStation(null);
       }
    }
  };

  const addToRecent = (station: Station) => {
    setRecentStationIds(prev => {
      const newRecents = [station.id, ...prev.filter(id => id !== station.id)].slice(0, 20);
      try {
        localStorage.setItem('recentStations', JSON.stringify(newRecents));
      } catch (e) {
        console.error("Failed to save recent stations", e);
      }
      return newRecents;
    });
  };

  const handleReorderPlaylist = (fromIndex: number, toIndex: number) => {
    setPlaylist(prev => {
        const newPlaylist = [...prev];
        const [movedItem] = newPlaylist.splice(fromIndex, 1);
        newPlaylist.splice(toIndex, 0, movedItem);
        return newPlaylist;
    });
  };

  const handlePlayStation = async (station: Station, context: 'all' | 'playlist' = 'all') => {
    if (unplayableStationIds.has(station.id)) return;

    if (currentStation?.id === station.id) {
      // Toggle Play/Pause
      if (isPlaying) {
         await fadeOut();
         setIsPlaying(false);
      } else {
         setIsPlaying(true);
      }
    } else {
      // Switch Station
      if (isPlaying) {
         await fadeOut();
      }
      
      setPlayContext(context);
      setUseFallback(false);
      setAutoHttpsUpgrade(false);
      setCurrentStation(station);
      setIsPlaying(true);
      addToRecent(station);
    }
  };

  const handleNext = async () => {
    if (!currentStation) return;
    
    setUseFallback(false);
    setAutoHttpsUpgrade(false);

    let listToUse = stations.filter(s => !unplayableStationIds.has(s.id));
    if (playContext === 'playlist' && playlist.length > 0) {
      listToUse = playlist.filter(s => !unplayableStationIds.has(s.id));
    }

    if (listToUse.length === 0) return;

    const currentIndex = listToUse.findIndex(s => s.id === currentStation.id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % listToUse.length;
    
    if (isPlaying) await fadeOut();

    const nextStation = listToUse[nextIndex];
    setCurrentStation(nextStation);
    setIsPlaying(true);
    addToRecent(nextStation);
  };

  const handlePrev = async () => {
    if (!currentStation) return;

    setUseFallback(false);
    setAutoHttpsUpgrade(false);

    let listToUse = stations.filter(s => !unplayableStationIds.has(s.id));
    if (playContext === 'playlist' && playlist.length > 0) {
      listToUse = playlist.filter(s => !unplayableStationIds.has(s.id));
    }

    if (listToUse.length === 0) return;

    const currentIndex = listToUse.findIndex(s => s.id === currentStation.id);
    const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + listToUse.length) % listToUse.length;
    
    if (isPlaying) await fadeOut();

    const prevStation = listToUse[prevIndex];
    setCurrentStation(prevStation);
    setIsPlaying(true);
    addToRecent(prevStation);
  };

  // Playlist Management
  const handleAddToPlaylist = (station: Station) => {
    setPlaylist(prev => {
      if (prev.some(s => s.id === station.id)) {
        return prev; 
      }
      return [...prev, station];
    });
    setShowPlaylist(true);
  };

  const handleRemoveFromPlaylist = (id: string) => {
    setPlaylist(prev => prev.filter(s => s.id !== id));
  };


  const handleStationClick = (station: Station) => {
    setDetailViewStation(station);
  };

  const handleBackToDiscover = () => {
    setDetailViewStation(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setDetailViewStation(null);
    setShowMobileSidebar(false);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setActiveTab('discover');
    setDetailViewStation(null);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  // --- Media Session API Integration ---
  useEffect(() => {
    if ('mediaSession' in navigator && currentStation) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: currentStation.description || 'RadioZen Online Radio',
        album: currentStation.category || 'RadioZen',
        artwork: [
          { src: currentStation.coverUrl, sizes: '96x96', type: 'image/png' },
          { src: currentStation.coverUrl, sizes: '128x128', type: 'image/png' },
          { src: currentStation.coverUrl, sizes: '192x192', type: 'image/png' },
          { src: currentStation.coverUrl, sizes: '256x256', type: 'image/png' },
          { src: currentStation.coverUrl, sizes: '384x384', type: 'image/png' },
          { src: currentStation.coverUrl, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', async () => {
          await fadeOut();
          setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('stop', async () => {
          await fadeOut();
          setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    }
  }, [currentStation, isPlaying, handleNext, handlePrev]); // Dependencies updated

  // Derived Data
  const filteredStations = stations.filter(station => {
    if (unplayableStationIds.has(station.id)) return false;
    if (selectedCategory !== 'all' && station.category !== selectedCategory) return false;
    if (selectedTag && !station.tags.includes(selectedTag)) return false;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = station.name.toLowerCase().includes(query);
      const matchesDesc = station.description.toLowerCase().includes(query);
      const matchesTags = station.tags.some(tag => tag.toLowerCase().includes(query));
      return matchesName || matchesDesc || matchesTags;
    }

    return true;
  });

  const favoriteStations = stations.filter(s => favorites.includes(s.id));
  const recentStations = recentStationIds
    .map(id => stations.find(s => s.id === id))
    .filter((s): s is Station => !!s);

  // Helper for rendering content based on activeTab
  const renderContent = () => {
    if (detailViewStation) {
      return (
        <StationDetail 
          station={detailViewStation} 
          isPlaying={currentStation?.id === detailViewStation.id && isPlaying}
          onTogglePlay={() => handlePlayStation(detailViewStation, 'all')}
          onAddToPlaylist={handleAddToPlaylist}
          onBack={handleBackToDiscover}
          onTagClick={handleTagClick}
        />
      );
    }

    switch (activeTab) {
      case 'discover':
        return (
            <>
              {/* Hero / Featured */}
              {!searchQuery && !selectedTag && stations.length > 0 && !unplayableStationIds.has(stations[0].id) && (
                <div className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                   <div className="relative z-10 max-w-lg">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/10">今日推荐</span>
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">城市晚高峰</h2>
                      <p className="text-violet-100 mb-6 text-sm md:text-lg">最好的音乐陪伴你的归途，实时路况与好歌同行。</p>
                      <button 
                        onClick={() => handlePlayStation(stations[0], 'all')}
                        className="bg-white text-violet-700 px-6 py-3 rounded-full font-bold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg text-sm md:text-base"
                      >
                        <Menu className="w-4 h-4 rotate-90" /> 立即收听
                      </button>
                   </div>
                </div>
              )}

              {/* Categories */}
              <div className="mb-8">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedTag(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                        selectedCategory === cat.id && !selectedTag
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-600 dark:hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filter Indicator */}
              {selectedTag && (
                <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-2">
                  <span className="text-slate-400 text-sm">正在浏览标签:</span>
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="flex items-center gap-1 px-3 py-1 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors"
                  >
                    #{selectedTag} <X size={14} />
                  </button>
                </div>
              )}

              {/* Station Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredStations.map(station => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isPlaying={currentStation?.id === station.id && isPlaying}
                    isCurrent={currentStation?.id === station.id}
                    isFavorite={favorites.includes(station.id)}
                    isUnplayable={unplayableStationIds.has(station.id)}
                    onPlay={(s) => handlePlayStation(s, 'all')}
                    onClick={handleStationClick}
                    onToggleFavorite={toggleFavorite}
                    onAddToPlaylist={handleAddToPlaylist}
                    onTagClick={handleTagClick}
                    onDelete={handleDeleteCustomStation}
                  />
                ))}
                {filteredStations.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-500">
                    {searchQuery ? (
                        <>
                            <p className="text-lg text-slate-400 mb-2">没有找到与 "{searchQuery}" 相关的电台</p>
                            <button onClick={() => setSearchQuery('')} className="text-violet-400 hover:underline">清除搜索</button>
                        </>
                    ) : selectedTag ? (
                         <>
                            <p className="text-lg text-slate-400 mb-2">没有找到标签为 "#{selectedTag}" 的电台</p>
                            <button onClick={() => setSelectedTag(null)} className="text-violet-400 hover:underline">查看全部</button>
                        </>
                    ) : (
                        "没有找到该分类下的电台"
                    )}
                  </div>
                )}
              </div>
            </>
        );
      case 'favorites':
        return (
            <div className="pb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                   <Heart className="text-rose-500 fill-rose-500" /> 我的收藏
                </h2>
                <button 
                   onClick={() => setIsAddStationModalOpen(true)}
                   className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                   <Plus size={16} /> 添加电台
                </button>
              </div>

              {favoriteStations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {favoriteStations.map(station => (
                    <StationCard
                      key={station.id}
                      station={station}
                      isPlaying={currentStation?.id === station.id && isPlaying}
                      isCurrent={currentStation?.id === station.id}
                      isFavorite={true}
                      isUnplayable={unplayableStationIds.has(station.id)}
                      onPlay={(s) => handlePlayStation(s, 'all')}
                      onClick={handleStationClick}
                      onToggleFavorite={toggleFavorite}
                      onAddToPlaylist={handleAddToPlaylist}
                      onTagClick={handleTagClick}
                      onDelete={handleDeleteCustomStation}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                   <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                     <Heart size={32} className="opacity-20" />
                   </div>
                   <p className="text-lg">暂无收藏电台</p>
                   <div className="flex gap-4 mt-4">
                      <button onClick={() => setActiveTab('discover')} className="px-6 py-2 bg-violet-600/10 text-violet-400 rounded-full text-sm font-medium hover:bg-violet-600/20 transition-colors">
                          去发现更多
                      </button>
                      <button onClick={() => setIsAddStationModalOpen(true)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          手动添加
                      </button>
                   </div>
                </div>
              )}
            </div>
        );
      case 'recent':
        return (
            <div className="pb-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                 <History className="text-slate-900 dark:text-slate-100" /> 最近播放
              </h2>
              {recentStations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {recentStations.map(station => (
                    <StationCard
                      key={station.id}
                      station={station}
                      isPlaying={currentStation?.id === station.id && isPlaying}
                      isCurrent={currentStation?.id === station.id}
                      isFavorite={favorites.includes(station.id)}
                      isUnplayable={unplayableStationIds.has(station.id)}
                      onPlay={(s) => handlePlayStation(s, 'all')}
                      onClick={handleStationClick}
                      onToggleFavorite={toggleFavorite}
                      onAddToPlaylist={handleAddToPlaylist}
                      onTagClick={handleTagClick}
                      onDelete={handleDeleteCustomStation}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                   <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                     <History size={32} className="opacity-20" />
                   </div>
                   <p className="text-lg">暂无最近播放记录</p>
                   <button onClick={() => setActiveTab('discover')} className="mt-4 px-6 py-2 bg-violet-600/10 text-violet-400 rounded-full text-sm font-medium hover:bg-violet-600/20 transition-colors">
                       去听听看
                   </button>
                </div>
              )}
            </div>
        );
      case 'profile':
        return (
          <ProfileView 
            profile={userProfile} 
            favoritesCount={favorites.length}
            onUpdateProfile={setUserProfile}
            onNavigate={setActiveTab} 
          />
        );
      case 'settings':
        return <SettingsView isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} onNavigate={setActiveTab} />;
      case 'about':
        return <AboutView onBack={() => setActiveTab('settings')} />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-4">
                <Menu size={48} className="opacity-20" />
              </div>
              <h3 className="text-xl font-medium text-slate-400 mb-2">即将推出</h3>
              <p>该功能正在开发中...</p>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {/* Hidden Audio Element - Remove src prop as it's handled in useEffect */}
      <audio 
        ref={audioRef} 
        onEnded={handleNext} // Auto-play next when stream/track ends (mostly for mp3 files)
        onError={(e) => {
            const target = e.currentTarget;
            console.error("Native Audio Error:", target.error?.code, target.error?.message);
            
            if (!autoHttpsUpgrade && currentStation?.streamUrl.startsWith('http:') && !useFallback) {
                console.warn("Native playback failed on HTTP, upgrading to HTTPS...");
                setAutoHttpsUpgrade(true);
                return;
            }

            if (!useFallback && currentStation?.fallbackStreamUrl && isPlaying) {
                 console.warn("Native playback failed, attempting switch to fallback stream...");
                 setUseFallback(true);
                 setAutoHttpsUpgrade(false);
                 return;
            }

            if (!hlsRef.current) {
               setIsPlaying(false);
               if (currentStation) {
                 setUnplayableStationIds(prev => {
                   const next = new Set(prev);
                   next.add(currentStation.id);
                   return next;
                 });
               }
            }
        }}
      />

      <AddStationModal 
        isOpen={isAddStationModalOpen} 
        onClose={() => setIsAddStationModalOpen(false)} 
        onAdd={handleAddCustomStation} 
      />

      {/* Mobile Sidebar (Optional/Secondary) */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/80 z-50 md:hidden" onClick={() => setShowMobileSidebar(false)}>
           <div className="w-64 h-full bg-white dark:bg-slate-900" onClick={e => e.stopPropagation()}>
             <Sidebar 
                activeTab={activeTab} 
                setActiveTab={handleTabChange} 
                onAddStation={() => { setIsAddStationModalOpen(true); setShowMobileSidebar(false); }}
             />
           </div>
        </div>
      )}
      
      {/* Sidebar (Desktop) */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40">
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            onAddStation={() => setIsAddStationModalOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative md:pl-64">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm z-10 sticky top-0 transition-colors">
          {isMobileSearchOpen ? (
            <div className="flex items-center w-full gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                 <input 
                   autoFocus
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="搜索电台..."
                   className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-8 py-2 text-sm text-slate-900 dark:text-slate-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                 />
                 {searchQuery && (
                     <button 
                       onClick={() => setSearchQuery('')}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                     >
                       <X size={14} />
                     </button>
                   )}
               </div>
               <button 
                 onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
                 className="text-slate-500 dark:text-slate-400 text-sm font-medium whitespace-nowrap"
               >
                 取消
               </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {/* Show Logo on mobile since Sidebar is hidden */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M9 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">RadioZen</span>
                </div>

                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索电台、节目..." 
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-8 py-2 text-sm text-slate-900 dark:text-slate-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 w-64 transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="sm:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                 >
                   <Search size={20} />
                 </button>

                 <button className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                   <Bell size={20} />
                   <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                 </button>
                 <button 
                  onClick={() => setShowMobileSidebar(true)}
                  className="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                 >
                   <Menu size={18} />
                 </button>
                 <div 
                   className="hidden md:block w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 cursor-pointer"
                   onClick={() => setActiveTab('profile')}
                 >
                   <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                 </div>
              </div>
            </>
          )}
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-32 scrollbar-hide">
          {renderContent()}
        </main>
        
        {/* Playlist Sidebar (Overlay) */}
        <Playlist 
          isOpen={showPlaylist}
          onClose={() => setShowPlaylist(false)}
          playlist={playlist}
          currentStation={currentStation}
          onPlay={(s) => handlePlayStation(s, 'playlist')}
          onRemove={handleRemoveFromPlaylist}
          onReorder={handleReorderPlaylist}
          isPlaying={isPlaying}
        />

        {/* Player Bar (Mini Player on Mobile) */}
        <PlayerBar 
          currentStation={currentStation}
          isPlaying={isPlaying}
          onTogglePlay={() => {
              // Trigger play toggle logic which handles fadeOut/fadeIn
              handlePlayStation(currentStation!, playContext);
          }}
          volume={volume}
          onVolumeChange={setVolume}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onNext={handleNext}
          onPrev={handlePrev}
          togglePlaylist={() => setShowPlaylist(!showPlaylist)}
          showPlaylist={showPlaylist}
          onOpenFullPlayer={() => setShowFullPlayer(true)}
        />
        
        {/* Bottom Nav (Mobile Only) */}
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Full Screen Player (Mobile Only) */}
        {showFullPlayer && (
          <MobileFullPlayer 
            station={currentStation}
            isPlaying={isPlaying}
            onTogglePlay={() => {
                 handlePlayStation(currentStation!, playContext);
            }}
            onClose={() => setShowFullPlayer(false)}
            onNext={handleNext}
            onPrev={handlePrev}
            volume={volume}
            onVolumeChange={setVolume}
            onTogglePlaylist={() => setShowPlaylist(!showPlaylist)}
          />
        )}
      </div>
    </div>
  );
};

export default App;