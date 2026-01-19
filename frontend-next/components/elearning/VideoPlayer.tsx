'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';

// Types pour le provider vidéo
type VideoProvider = 'upload' | 'youtube' | 'vimeo' | 'other';

interface VideoPlayerProps {
  src: string;
  provider?: VideoProvider;
  poster?: string;
  title?: string;
  lang?: Language;
  initialPosition?: number; // Position de reprise en secondes
  minWatchPercent?: number; // % minimum à regarder pour compléter (default 80)
  onProgress?: (data: VideoProgressData) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoSaveInterval?: number; // Intervalle de sauvegarde auto en ms (default 10000)
  className?: string;
}

export interface VideoProgressData {
  currentTime: number;
  duration: number;
  watchedTime: number;
  progressPercent: number;
  isComplete: boolean;
}

// Utilitaire pour extraire l'ID YouTube
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Utilitaire pour extraire l'ID Vimeo
function getVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(?:video\/)?(\d+)/,
    /^(\d+)$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Détecter automatiquement le provider
function detectProvider(url: string): VideoProvider {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.startsWith('/uploads') || url.startsWith('http://localhost')) return 'upload';
  return 'other';
}

// Formater le temps en MM:SS ou HH:MM:SS
function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayer({
  src,
  provider: providedProvider,
  poster,
  title,
  lang = 'fr',
  initialPosition = 0,
  minWatchPercent = 80,
  onProgress,
  onComplete,
  onError,
  autoSaveInterval = 10000,
  className,
}: VideoPlayerProps) {
  const provider = providedProvider || detectProvider(src);

  // États
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchedTime, setWatchedTime] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const watchedIntervalsRef = useRef<Set<number>>(new Set());
  const youtubePlayerRef = useRef<any>(null);
  const vimeoPlayerRef = useRef<any>(null);

  // Calculer la progression
  const progressPercent = duration > 0 ? (watchedTime / duration) * 100 : 0;
  const isComplete = progressPercent >= minWatchPercent;

  // Callback de progression
  const sendProgress = useCallback(() => {
    if (onProgress && duration > 0) {
      onProgress({
        currentTime,
        duration,
        watchedTime,
        progressPercent,
        isComplete,
      });
    }
  }, [currentTime, duration, watchedTime, progressPercent, isComplete, onProgress]);

  // Sauvegarde automatique
  useEffect(() => {
    if (autoSaveInterval > 0 && isPlaying) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastSaveTimeRef.current >= autoSaveInterval) {
          sendProgress();
          lastSaveTimeRef.current = now;
        }
      }, autoSaveInterval);
      return () => clearInterval(interval);
    }
  }, [autoSaveInterval, isPlaying, sendProgress]);

  // Détecter la complétion
  useEffect(() => {
    if (isComplete && !hasCompleted) {
      setHasCompleted(true);
      onComplete?.();
    }
  }, [isComplete, hasCompleted, onComplete]);

  // Masquer les contrôles après inactivité
  useEffect(() => {
    const hideControls = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(hideControls, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Position initiale pour vidéo locale
  useEffect(() => {
    if (provider === 'upload' && videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
    }
  }, [provider, initialPosition]);

  // Handlers vidéo locale
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    setCurrentTime(video.currentTime);

    // Tracker les secondes uniques regardées
    const second = Math.floor(video.currentTime);
    if (!watchedIntervalsRef.current.has(second)) {
      watchedIntervalsRef.current.add(second);
      setWatchedTime(watchedIntervalsRef.current.size);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);

    // Restaurer la position initiale
    if (initialPosition > 0 && initialPosition < videoRef.current.duration) {
      videoRef.current.currentTime = initialPosition;
      // Pré-remplir les secondes déjà regardées
      for (let i = 0; i < Math.floor(initialPosition); i++) {
        watchedIntervalsRef.current.add(i);
      }
      setWatchedTime(watchedIntervalsRef.current.size);
    }
  }, [initialPosition]);

  const handleProgress = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered((bufferedEnd / video.duration) * 100);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    sendProgress();
  }, [sendProgress]);

  const handleError = useCallback(() => {
    const errorMsg = lang === 'fr'
      ? 'Erreur lors du chargement de la vidéo'
      : 'Error loading video';
    setError(errorMsg);
    setIsLoading(false);
    onError?.(errorMsg);
  }, [lang, onError]);

  // Contrôles
  const togglePlay = useCallback(() => {
    if (provider === 'upload' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(handleError);
      }
      setIsPlaying(!isPlaying);
    }
  }, [provider, isPlaying, handleError]);

  const toggleMute = useCallback(() => {
    if (provider === 'upload' && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [provider, isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (provider === 'upload' && videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, [provider]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (provider === 'upload' && videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  }, [provider]);

  const restart = useCallback(() => {
    if (provider === 'upload' && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, [provider]);

  // Render YouTube embed
  if (provider === 'youtube') {
    const videoId = getYouTubeId(src);
    if (!videoId) {
      return (
        <div className="aspect-video bg-black flex items-center justify-center text-white">
          {lang === 'fr' ? 'URL YouTube invalide' : 'Invalid YouTube URL'}
        </div>
      );
    }

    return (
      <div className={cn('relative aspect-video bg-black', className)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?start=${Math.floor(initialPosition)}&rel=0&modestbranding=1&enablejsapi=1`}
          title={title || 'YouTube video'}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Render Vimeo embed
  if (provider === 'vimeo') {
    const videoId = getVimeoId(src);
    if (!videoId) {
      return (
        <div className="aspect-video bg-black flex items-center justify-center text-white">
          {lang === 'fr' ? 'URL Vimeo invalide' : 'Invalid Vimeo URL'}
        </div>
      );
    }

    return (
      <div className={cn('relative aspect-video bg-black', className)}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?#t=${Math.floor(initialPosition)}s`}
          title={title || 'Vimeo video'}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Render vidéo locale/upload
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-video bg-black group overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* Vidéo */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-red-500 text-center px-4">{error}</p>
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && !isLoading && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center hover:bg-blue-500 transition-colors">
            <Play size={40} className="text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* Contrôles */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Barre de progression */}
        <div
          ref={progressRef}
          className="relative h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
          onClick={handleSeek}
        >
          {/* Buffered */}
          <div
            className="absolute h-full bg-white/40 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          {/* Progress */}
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          {/* Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 8px)` }}
          />
        </div>

        {/* Boutons de contrôle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause size={24} className="text-white" />
              ) : (
                <Play size={24} className="text-white" />
              )}
            </button>

            {/* Restart */}
            <button
              onClick={restart}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <RotateCcw size={20} className="text-white" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} className="text-white" />
                ) : (
                  <Volume2 size={20} className="text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-blue-500"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Progression regardée */}
            <span className="text-xs text-white/70 mr-2">
              {lang === 'fr' ? 'Vu' : 'Watched'}: {Math.round(progressPercent)}%
              {isComplete && (
                <span className="ml-1 text-emerald-400">✓</span>
              )}
            </span>

            {/* Settings (playback rate) */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Settings size={20} className="text-white" />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">
                    {lang === 'fr' ? 'Vitesse' : 'Speed'}
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={cn(
                        'block w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors',
                        playbackRate === rate ? 'text-blue-400 bg-slate-700/50' : 'text-white'
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Maximize size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
