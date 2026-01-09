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
import { DEFAULT_STATIONS, CATEGORIES } from './constants';
import { Station, UserProfile, PlaybackStatus } from './types';
import { Search, Bell, Menu, Heart, History, X, Plus, AlertTriangle, Info, Wifi, Loader2 } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Music Lover',
  bio: '热爱音乐，热爱生活',
  avatarUrl: 'https://picsum.photos/seed/user/200/200',
  joinDate: new Date().getFullYear().toString(),
  isPro: false,
  level: 1,
  listeningMinutes: 0
};

const REMOTE_STATIONS_URL = 'https://gist.githubusercontent.com/minyoad/3fd7fabeb218a7677356af44d21dcb3d/raw/radio_stations.json';

const validateStation = (station: Station): boolean => {
  if (!station.streamUrl || typeof station.streamUrl !== 'string') return false;
  try {
    const url = new URL(station.streamUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (station.fallbackStreamUrl) {
       new URL(station.fallbackStreamUrl);
    }
    return true;
  } catch (e) {
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
  
  // Data Loading State
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [remoteStations, setRemoteStations] = useState<Station[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Custom Stations State
  const [customStations, setCustomStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem('customStations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Modal State
  const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);

  // Data Fetching
  useEffect(() => {
    const loadStations = async () => {
      setIsDataLoading(true);
      try {
        const cachedRaw = localStorage.getItem('cached_remote_stations');
        if (cachedRaw) {
            try {
                const parsed = JSON.parse(cachedRaw);
                setRemoteStations(parsed);
                setIsDataLoading(false);
            } catch (e) {
                localStorage.removeItem('cached_remote_stations');
                setRemoteStations(DEFAULT_STATIONS);
            }
        } else {
            setRemoteStations(DEFAULT_STATIONS);
            setIsDataLoading(false);
        }

        try {
            const response = await fetch(REMOTE_STATIONS_URL, {
                signal: AbortSignal.timeout(15000),
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const json = await response.json();
            
            if (!Array.isArray(json)) {
                throw new Error('Invalid data format: expected array');
            }
            
            const freshStations: Station[] = json.map((s: any, index: number) => {
                if (!s.streamUrl) {
                    console.warn(`Station at index ${index} missing streamUrl, skipping`);
                    return null;
                }
                
                const station: Station = {
                    id: s.id || `remote-${index}`,
                    name: s.name || 'Unknown Station',
                    description: s.description || '',
                    streamUrl: s.streamUrl,
                    coverUrl: s.coverUrl || `https://picsum.photos/seed/${s.id || index}/400/400`,
                    tags: Array.isArray(s.tags) ? s.tags : [],
                    category: s.category || 'talk',
                    frequency: s.frequency || 'WEB',
                    gain: typeof s.gain === 'number' ? s.gain : 1.0,
                    isCustom: false,
                    fallbackStreamUrl: s.fallbackStreamUrl
                };
                
                if (!validateStation(station)) {
                    console.warn(`Station "${station.name}" failed validation, skipping`);
                    return null;
                }
                
                return station;
            }).filter((s): s is Station => s !== null);

            if (freshStations.length === 0) {
                throw new Error('No valid stations found in response');
            }
            
            setRemoteStations(freshStations);
            localStorage.setItem('cached_remote_stations', JSON.stringify(freshStations));
            setFetchError(null);
            
            if (!cachedRaw) {
                showToast(`成功加载 ${freshStations.length} 个电台`, 'success');
            } else {
                const diffCount = freshStations.length - (cachedRaw ? JSON.parse(cachedRaw).length : 0);
                if (diffCount !== 0) {
                    showToast(`电台列表已更新 (${diffCount > 0 ? '+' : ''}${diffCount})`, 'info');
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Failed to fetch remote stations:', errorMessage);
            setFetchError(errorMessage);
            
            if (!cachedRaw) {
                showToast('无法加载电台列表，正在使用默认电台', 'error');
            } else {
                showToast('无法更新电台列表，使用缓存数据', 'warning');
            }
        }
      } catch (e) {
        setRemoteStations(DEFAULT_STATIONS);
      } finally {
        setIsDataLoading(false);
      }
    };
    loadStations();
  }, []);

  const stations = useMemo(() => {
    const all = [...remoteStations, ...customStations];
    return all.filter(validateStation);
  }, [remoteStations, customStations]);
  
  const [unplayableStationIds, setUnplayableStationIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('unplayableStations');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('unplayableStations', JSON.stringify(Array.from(unplayableStationIds)));
    } catch (e) {}
  }, [unplayableStationIds]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  });

  const [playlist, setPlaylist] = useState<Station[]>([]);
  const [playContext, setPlayContext] = useState<'all' | 'playlist'>('all');
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle'); // Detailed status

  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [detailViewStation, setDetailViewStation] = useState<Station | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // *** KEY FIX FOR iOS: Force remount of Audio element on every new play session ***
  const [playerKey, setPlayerKey] = useState(0); 

  const [recentStationIds, setRecentStationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentStations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [useFallback, setUseFallback] = useState(false);
  const [autoHttpsUpgrade, setAutoHttpsUpgrade] = useState(false);
  const [useCorsProxy, setUseCorsProxy] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCount = useRef(0);
  const fadeIntervalRef = useRef<number | null>(null);

  const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url='
  ];

  const getProxiedUrl = (url: string): string => {
    return CORS_PROXIES[0] + encodeURIComponent(url);
  };

  const parseStreamUrls = (streamUrl: string): string[] => {
    if (!streamUrl) return [];
    return streamUrl.split('#').map(url => url.trim()).filter(url => url.length > 0);
  };

  const getCurrentStreamUrl = (station: Station): string => {
    const urls = parseStreamUrls(station.streamUrl);
    const index = Math.min(currentStreamIndex, urls.length - 1);
    return urls[index] || urls[0];
  };

  const hasMoreStreams = (station: Station): boolean => {
    const urls = parseStreamUrls(station.streamUrl);
    return currentStreamIndex < urls.length - 1;
  };

  const tryNextStream = (): boolean => {
    if (currentStation && hasMoreStreams(currentStation)) {
      setCurrentStreamIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ message, type });
  };

  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const startFadeIn = () => {
    // Volume fading is problematic on some mobile devices (read-only volume).
    // We only attempt it, but if it fails or is ignored, that's fine.
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    
    const stationGain = currentStation?.gain ?? 1.0;
    const targetVol = isMuted ? 0 : Math.min(1.0, Math.max(0, volume * stationGain));
    
    // Check if we can actually set volume (some browsers ignore this)
    const originalVol = audio.volume;
    audio.volume = 0;
    if (audio.volume !== 0) {
        // Browser didn't allow setting volume (likely iOS), skip fade
        return; 
    }

    const duration = 1500;
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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('customStations', JSON.stringify(customStations));
  }, [customStations]);

  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setUserProfile(prev => ({
          ...prev,
          listeningMinutes: prev.listeningMinutes + 1,
          level: Math.floor((prev.listeningMinutes + 1) / 60) + 1
        }));
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      // Don't clear fade here to avoid interrupting startFadeIn
      if (isMuted) {
        audioRef.current.volume = 0;
      } else {
        // Only apply volume if we are not currently fading in (simple check)
        if (!fadeIntervalRef.current) {
            const stationGain = currentStation?.gain ?? 1.0;
            const effectiveVolume = volume * stationGain;
            audioRef.current.volume = Math.min(1.0, Math.max(0, effectiveVolume));
        }
      }
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setActiveTab('discover');
    }
  }, [searchQuery]);

  // --- CORE PLAYBACK LOGIC ---
  useEffect(() => {
    const audio = audioRef.current;
    
    // Event Handlers for Status Updates
    const onWaiting = () => setPlaybackStatus('buffering');
    const onPlaying = () => setPlaybackStatus('playing');
    const onPause = () => {
        // Only set to idle if we aren't recovering or switching
        if (!isPlaying) setPlaybackStatus('idle');
    };
    const onStalled = () => {
        if (isPlaying) setPlaybackStatus('buffering');
    };
    const onError = () => setPlaybackStatus('error');
    const onCanPlay = () => {
        // Optional: could set to idle or ready, but 'playing' event is better
    };

    if (audio) {
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('stalled', onStalled);
        audio.addEventListener('error', onError);
        audio.addEventListener('canplay', onCanPlay);
    }

    const stopPlayback = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audio) {
        audio.pause();
        audio.removeEventListener('waiting', onWaiting);
        audio.removeEventListener('playing', onPlaying);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('stalled', onStalled);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('canplay', onCanPlay);
      }
      clearFade();
    };

    if (!isPlaying || !currentStation || !audio) {
      if (!isPlaying) setPlaybackStatus('idle');
      stopPlayback();
      return;
    }
    
    // Start Loading
    setPlaybackStatus('buffering');

    if (unplayableStationIds.has(currentStation.id)) {
      setIsPlaying(false);
      setPlaybackStatus('error');
      showToast('该电台暂时无法播放', 'error');
      return;
    }

    // Get current stream URL from multiple sources
    let src = useFallback && currentStation.fallbackStreamUrl 
      ? currentStation.fallbackStreamUrl 
      : getCurrentStreamUrl(currentStation);

    if (autoHttpsUpgrade && src.startsWith('http:')) {
      src = src.replace('http:', 'https:');
    }

    // Force cache bust to prevent iOS from playing stale buffer
    const separator = src.includes('?') ? '&' : '?';
    const finalSrc = `${src}${separator}t=${Date.now()}`;

    const isM3u8 = src.includes('.m3u8') || src.includes('application/x-mpegurl');

    // Reset retry count on new station/play
    retryCount.current = 0;

    if (isM3u8 && Hls.isSupported()) {
      // HLS Playback (Desktop / Android)
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 3,
      });
      hlsRef.current = hls;
      
      hls.loadSource(finalSrc);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        retryCount.current = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
           playPromise.then(() => startFadeIn()).catch(error => {
              console.error("HLS Auto-play failed:", error);
              setPlaybackStatus('error');
           });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error(`HLS Network error: ${data.details}`);
              setPlaybackStatus('buffering'); // Keep spinning while retrying
              if (!autoHttpsUpgrade && src.startsWith('http:')) {
                showToast('正在尝试切换 HTTPS 连接...', 'info');
                setAutoHttpsUpgrade(true);
                return;
              }
              if (retryCount.current < 2) {
                retryCount.current++;
                setTimeout(() => {
                   if (hlsRef.current) hlsRef.current.startLoad();
                }, 1000 * retryCount.current);
              } else {
                if (!useFallback && currentStation.fallbackStreamUrl) {
                  showToast('连接失败，切换至备用线路...', 'info');
                  setUseFallback(true);
                  setAutoHttpsUpgrade(false);
                } else {
                  showToast('无法连接该电台', 'error');
                  hls.destroy();
                  setIsPlaying(false);
                  setPlaybackStatus('error');
                  setUnplayableStationIds(prev => new Set(prev).add(currentStation.id));
                }
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setIsPlaying(false);
              setPlaybackStatus('error');
              showToast('播放器发生错误', 'error');
              setUnplayableStationIds(prev => new Set(prev).add(currentStation.id));
              break;
          }
        }
      });
    } else {
      // Native Audio Playback (iOS Safari / MP3)
      setPlaybackStatus('buffering');
      
      const finalUrl = useCorsProxy ? getProxiedUrl(finalSrc) : finalSrc;
      console.log('Playing URL:', finalUrl);
      
      audio.src = finalUrl;
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
         playPromise.then(() => {
           console.log('Audio playback started successfully:', finalUrl);
           setPlaybackStatus('playing');
           startFadeIn();
         }).catch(error => {
            console.error("Playback failed:", error);
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            setPlaybackStatus('error');
            // Don't auto-stop here, let user retry or browser events handle 'error'
         });
      }
    }

    return () => {
      stopPlayback();
    };
  }, [currentStation?.id, isPlaying, useFallback, autoHttpsUpgrade, unplayableStationIds, playerKey]);

  // Handlers
  const handleAddCustomStation = (newStation: Station) => {
    setCustomStations(prev => [...prev, newStation]);
    setFavorites(prev => [...prev, newStation.id]);
    setActiveTab('favorites');
    showToast('自定义电台已添加', 'success');
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
       showToast('电台已删除', 'success');
    }
  };

  const addToRecent = (station: Station) => {
    setRecentStationIds(prev => {
      const newRecents = [station.id, ...prev.filter(id => id !== station.id)].slice(0, 20);
      try { localStorage.setItem('recentStations', JSON.stringify(newRecents)); } catch (e) {}
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

  const handlePlayStation = (station: Station, context: 'all' | 'playlist' = 'all') => {
    if (unplayableStationIds.has(station.id)) {
        showToast('该电台暂时无法播放', 'error');
        return;
    }

    if (currentStation?.id === station.id) {
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        // RESUME: Increment key to force new audio element
        setPlayerKey(k => k + 1);
        setIsPlaying(true);
        setPlaybackStatus('buffering');
      }
    } else {
      // SWITCH: Increment key to force new audio element
      setPlayerKey(k => k + 1);
      setPlayContext(context);
      setUseFallback(false);
      setAutoHttpsUpgrade(false);
      setUseCorsProxy(false); // Reset CORS proxy for new station
      setCurrentStreamIndex(0); // Reset stream index for new station
      setCurrentStation(station);
      setIsPlaying(true);
      setPlaybackStatus('buffering');
      addToRecent(station);
    }
  };

  const handleNext = () => {
    if (!currentStation) return;
    setUseFallback(false);
    setAutoHttpsUpgrade(false);
    setUseCorsProxy(false); // Reset CORS proxy
    let listToUse = stations.filter(s => !unplayableStationIds.has(s.id));
    if (playContext === 'playlist' && playlist.length > 0) {
      listToUse = playlist.filter(s => !unplayableStationIds.has(s.id));
    }
    if (listToUse.length === 0) return;
    const currentIndex = listToUse.findIndex(s => s.id === currentStation.id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % listToUse.length;
    
    setIsPlaying(false);
    setTimeout(() => {
        setPlayerKey(k => k + 1);
        const nextStation = listToUse[nextIndex];
        setCurrentStation(nextStation);
        setIsPlaying(true);
        setPlaybackStatus('buffering');
        addToRecent(nextStation);
    }, 50);
  };

  const handlePrev = () => {
    if (!currentStation) return;
    setUseFallback(false);
    setAutoHttpsUpgrade(false);
    setUseCorsProxy(false); // Reset CORS proxy
    let listToUse = stations.filter(s => !unplayableStationIds.has(s.id));
    if (playContext === 'playlist' && playlist.length > 0) {
      listToUse = playlist.filter(s => !unplayableStationIds.has(s.id));
    }
    if (listToUse.length === 0) return;
    const currentIndex = listToUse.findIndex(s => s.id === currentStation.id);
    const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + listToUse.length) % listToUse.length;
    
    setIsPlaying(false);
    setTimeout(() => {
        setPlayerKey(k => k + 1);
        const prevStation = listToUse[prevIndex];
        setCurrentStation(prevStation);
        setIsPlaying(true);
        setPlaybackStatus('buffering');
        addToRecent(prevStation);
    }, 50);
  };

  const handleAddToPlaylist = (station: Station) => {
    setPlaylist(prev => {
      if (prev.some(s => s.id === station.id)) {
        showToast('电台已在播放列表中', 'info');
        return prev; 
      }
      showToast('已添加至播放列表', 'success');
      return [...prev, station];
    });
    setShowPlaylist(true);
  };

  const handleRemoveFromPlaylist = (id: string) => {
    setPlaylist(prev => prev.filter(s => s.id !== id));
    showToast('已从播放列表移除', 'success');
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
    setFavorites(prev => {
        const isFav = prev.includes(id);
        if (isFav) {
            showToast('已取消收藏', 'info');
            return prev.filter(pid => pid !== id);
        } else {
            showToast('已添加至收藏', 'success');
            return [...prev, id];
        }
    });
  };

  // --- Media Session API ---
  useEffect(() => {
    if ('mediaSession' in navigator && currentStation) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: currentStation.description || 'RadioZen Online Radio',
        album: currentStation.category || 'RadioZen',
        artwork: [
          { src: currentStation.coverUrl, sizes: '96x96', type: 'image/png' },
          { src: currentStation.coverUrl, sizes: '512x512', type: 'image/png' },
        ]
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setActionHandler('play', () => {
          setPlayerKey(k => k + 1);
          setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('stop', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    }
  }, [currentStation, isPlaying]);

  // Derived Data (same as before)
  const filteredStations = stations.filter(station => {
    if (unplayableStationIds.has(station.id)) return false;
    if (selectedCategory !== 'all' && station.category !== selectedCategory) return false;
    if (selectedTag && !station.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return station.name.toLowerCase().includes(query) || 
             station.description.toLowerCase().includes(query) || 
             station.tags.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  const favoriteStations = stations.filter(s => favorites.includes(s.id) && !unplayableStationIds.has(s.id));
  const recentStations = recentStationIds.map(id => stations.find(s => s.id === id)).filter((s): s is Station => !!s && !unplayableStationIds.has(s.id));

  const renderContent = () => {
    if (isDataLoading && stations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
           <Loader2 className="w-10 h-10 animate-spin mb-4 text-violet-600" />
           <p>正在加载电台列表...</p>
           {fetchError && (
             <p className="text-sm text-rose-500 mt-2 max-w-md text-center">{fetchError}</p>
           )}
        </div>
      );
    }

    if (detailViewStation) {
      return (
        <StationDetail 
          station={detailViewStation} 
          isPlaying={currentStation?.id === detailViewStation.id && isPlaying}
          playbackStatus={playbackStatus}
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

              {selectedTag && (
                <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-2">
                  <span className="text-slate-400 text-sm">正在浏览标签:</span>
                  <button onClick={() => setSelectedTag(null)} className="flex items-center gap-1 px-3 py-1 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors">
                    #{selectedTag} <X size={14} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredStations.map(station => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isPlaying={currentStation?.id === station.id && isPlaying}
                    playbackStatus={playbackStatus}
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
                    <p>没有找到相关电台</p>
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
                <button onClick={() => setIsAddStationModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
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
                      playbackStatus={playbackStatus}
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
                   <Heart size={32} className="opacity-20 mb-4" />
                   <p>暂无收藏电台</p>
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
                      playbackStatus={playbackStatus}
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
                   <History size={32} className="opacity-20 mb-4" />
                   <p>暂无最近播放记录</p>
                </div>
              )}
            </div>
        );
      case 'profile':
        return <ProfileView profile={userProfile} favoritesCount={favorites.length} onUpdateProfile={setUserProfile} onNavigate={setActiveTab} />;
      case 'settings':
        return <SettingsView isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} onNavigate={setActiveTab} allStations={stations} />;
      case 'about':
        return <AboutView onBack={() => setActiveTab('settings')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-white/10 ${
          toast.type === 'error' ? 'bg-rose-600/90 text-white' : 
          toast.type === 'success' ? 'bg-emerald-600/90 text-white' :
          'bg-slate-800/90 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : 
           toast.type === 'success' ? <Wifi size={18} /> :
           <Info size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* 
         NUCLEAR OPTION: Changing the key forces React to completely destroy and recreate the Audio element.
         This is the most reliable way to clear stale HLS buffers on iOS Safari when "resuming" a live stream.
      */}
      <audio 
        key={playerKey} 
        ref={audioRef} 
        crossOrigin="anonymous"
        preload="none"
        onEnded={handleNext}
        onCanPlay={() => {
          console.log('Audio can play');
          setPlaybackStatus('playing');
        }}
        onWaiting={() => {
          console.log('Audio waiting/buffering');
          setPlaybackStatus('buffering');
        }}
        onStalled={() => {
          console.log('Audio stalled');
          setPlaybackStatus('buffering');
        }}
        onError={(e) => {
            const target = e.currentTarget;
            console.error('Audio error event:', e);
            console.error('Audio error code:', target.error?.code);
            console.error('Audio error message:', target.error?.message);
            console.error('Current src:', target.src);
            console.error('Network state:', target.networkState);
            console.error('Ready state:', target.readyState);
            
            setPlaybackStatus('error');
            
            // Try next stream source if available
            if (tryNextStream()) {
                console.log('Trying next stream source...');
                showToast('正在切换播放源...', 'info');
                return;
            }
            
            // Try CORS proxy if not already using it
            if (!useCorsProxy && target.error?.code === 4) {
                console.log('Trying CORS proxy...');
                showToast('正在尝试使用代理连接...', 'info');
                setUseCorsProxy(true);
                return;
            }
            
            if (!autoHttpsUpgrade && currentStation?.streamUrl.startsWith('http:') && !useFallback) {
                console.log('Trying HTTPS upgrade...');
                showToast('正在尝试切换 HTTPS 连接...', 'info');
                setAutoHttpsUpgrade(true);
                return;
            }
            
            if (!useFallback && currentStation?.fallbackStreamUrl && isPlaying) {
                console.log('Trying fallback stream...');
                showToast('连接失败，切换至备用线路...', 'info');
                setUseFallback(true);
                setAutoHttpsUpgrade(false);
                return;
            }
            
            // Native Audio Error Handling (Retry Logic)
            if (!hlsRef.current) {
               setPlaybackStatus('buffering');
               if (retryCount.current < 2) {
                   retryCount.current++;
                   console.log(`Retrying playback (attempt ${retryCount.current})...`);
                   setTimeout(() => {
                       if (audioRef.current && isPlaying) {
                           audioRef.current.load();
                           audioRef.current.play().catch(e => console.error("Retry play failed", e));
                       }
                   }, 1500 * retryCount.current);
                   return;
               }

               setIsPlaying(false);
               setPlaybackStatus('error');
               showToast('无法播放该电台 (可能受地区或防盗链限制)', 'error');
               if (currentStation) {
                 setUnplayableStationIds(prev => new Set(prev).add(currentStation.id));
               }
            }
        }}
      />

      <AddStationModal isOpen={isAddStationModalOpen} onClose={() => setIsAddStationModalOpen(false)} onAdd={handleAddCustomStation} />

      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/80 z-50 md:hidden" onClick={() => setShowMobileSidebar(false)}>
           <div className="w-64 h-full bg-white dark:bg-slate-900" onClick={e => e.stopPropagation()}>
             <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} onAddStation={() => { setIsAddStationModalOpen(true); setShowMobileSidebar(false); }} />
           </div>
        </div>
      )}
      
      <div className="hidden md:block fixed inset-y-0 left-0 z-40">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} onAddStation={() => setIsAddStationModalOpen(true)} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative md:pl-64">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 pt-safe-top bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm z-10 sticky top-0 transition-colors">
          {isMobileSearchOpen ? (
            <div className="flex items-center w-full gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                 <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索电台..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-8 py-2 text-sm text-slate-900 dark:text-slate-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                 {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"><X size={14} /></button>}
               </div>
               <button onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }} className="text-slate-500 whitespace-nowrap">取消</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M9 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">RadioZen</span>
                </div>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索电台、节目..." className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-8 py-2 text-sm text-slate-900 dark:text-slate-300 focus:outline-none focus:border-violet-500 w-64 transition-all" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"><X size={14} /></button>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setIsMobileSearchOpen(true)} className="sm:hidden text-slate-500 dark:text-slate-400"><Search size={20} /></button>
                 <button className="relative text-slate-500 dark:text-slate-400"><Bell size={20} /><span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span></button>
                 <button onClick={() => setShowMobileSidebar(true)} className="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"><Menu size={18} /></button>
                 <div className="hidden md:block w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 cursor-pointer" onClick={() => setActiveTab('profile')}>
                   <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                 </div>
              </div>
            </>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-32 scrollbar-hide">
          {renderContent()}
        </main>
        
        <Playlist isOpen={showPlaylist} onClose={() => setShowPlaylist(false)} playlist={playlist} currentStation={currentStation} onPlay={(s) => handlePlayStation(s, 'playlist')} onRemove={handleRemoveFromPlaylist} onReorder={handleReorderPlaylist} isPlaying={isPlaying} />
        
        <PlayerBar 
            currentStation={currentStation} 
            isPlaying={isPlaying} 
            playbackStatus={playbackStatus}
            onTogglePlay={() => handlePlayStation(currentStation!, playContext)} 
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
        
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

        {showFullPlayer && <MobileFullPlayer station={currentStation} isPlaying={isPlaying} playbackStatus={playbackStatus} onTogglePlay={() => handlePlayStation(currentStation!, playContext)} onClose={() => setShowFullPlayer(false)} onNext={handleNext} onPrev={handlePrev} volume={volume} onVolumeChange={setVolume} onTogglePlaylist={() => setShowPlaylist(!showPlaylist)} />}
      </div>
    </div>
  );
};

export default App;