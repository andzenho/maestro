"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  List,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LessonInfo {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  duration?: number | null;
  courseTitle: string;
  moduleTitle: string;
}

interface LessonNav {
  id: string;
  title: string;
  moduleTitle: string;
  isCompleted: boolean;
  duration?: number | null;
}

interface VideoPlayerProps {
  lesson: LessonInfo;
  courseId: string;
  progress: { watchedSeconds: number; isCompleted: boolean };
  allLessons: LessonNav[];
  prevLesson: LessonNav | null;
  nextLesson: LessonNav | null;
}

export function VideoPlayer({
  lesson,
  courseId,
  progress,
  allLessons,
  prevLesson,
  nextLesson,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(progress.watchedSeconds);
  const [duration, setDuration] = useState(lesson.duration || 0);
  const [isCompleted, setIsCompleted] = useState(progress.isCompleted);
  const [showSidebar, setShowSidebar] = useState(true);
  const saveIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedRef = useRef(progress.watchedSeconds);

  const saveProgress = useCallback(
    async (seconds: number, completed?: boolean) => {
      try {
        await fetch(`/api/lessons/${lesson.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchedSeconds: Math.floor(seconds),
            isCompleted: completed ?? isCompleted,
          }),
        });
        lastSavedRef.current = seconds;
      } catch {}
    },
    [lesson.id, isCompleted]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      setDuration(video.duration);
      if (progress.watchedSeconds > 0) {
        video.currentTime = progress.watchedSeconds;
      }
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);

      // Mark as completed at 80%
      if (!isCompleted && video.duration > 0 && current / video.duration >= 0.8) {
        setIsCompleted(true);
        saveProgress(current, true);
        toast.success("Урок завершён! ✓");
      }
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [isCompleted, saveProgress, progress.watchedSeconds]);

  // Auto-save every 10 seconds
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      if (videoRef.current && Math.abs(videoRef.current.currentTime - lastSavedRef.current) > 5) {
        saveProgress(videoRef.current.currentTime);
      }
    }, 10000);

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [saveProgress]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        saveProgress(videoRef.current.currentTime);
      }
    };
  }, [saveProgress]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setMuted(vol === 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6b8f6b] mb-4">
        <Link href="/courses" className="hover:text-[#4ade80] transition-colors">
          Курсы
        </Link>
        <span>/</span>
        <span className="text-[#a8c8a8]">{lesson.courseTitle}</span>
        <span>/</span>
        <span className="text-[#e8f5e8]">{lesson.title}</span>
      </div>

      <div className="flex gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Video */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group">
            {lesson.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={lesson.videoUrl}
                  className="w-full h-full object-contain"
                  onClick={togglePlay}
                />
                {/* Controls overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  {/* Progress bar */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #4ade80 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                      }}
                    />
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlay}
                        className="w-9 h-9 rounded-full bg-[#4ade80] text-[#070d07] flex items-center justify-center hover:bg-[#22c55e] transition-colors"
                      >
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button onClick={toggleMute} className="text-white/80 hover:text-white">
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 appearance-none cursor-pointer"
                      />
                      <span className="text-white/80 text-xs">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-[#4ade80] text-xs">
                          <CheckCircle2 size={14} />
                          <span>Завершён</span>
                        </div>
                      )}
                      <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="text-white/80 hover:text-white"
                      >
                        <List size={16} />
                      </button>
                      <button onClick={toggleFullscreen} className="text-white/80 hover:text-white">
                        <Maximize size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Play button when paused */}
                {!playing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#4ade80]/90 flex items-center justify-center">
                      <Play size={28} className="text-[#070d07] ml-1" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#6b8f6b]">
                <Play size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Видео ещё не загружено</p>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#6b8f6b]">{lesson.moduleTitle}</span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs text-[#4ade80] bg-[rgba(74,222,128,0.1)] px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} />
                      Завершён
                    </span>
                  )}
                </div>
                <h1
                  className="text-lg font-bold text-[#e8f5e8]"
                  style={{ fontFamily: "var(--font-unbounded)" }}
                >
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="text-sm text-[#6b8f6b] mt-2 leading-relaxed">
                    {lesson.description}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(74,222,128,0.08)]">
              {prevLesson ? (
                <Link
                  href={`/courses/${courseId}/${prevLesson.id}`}
                  className="flex items-center gap-2 text-sm text-[#6b8f6b] hover:text-[#4ade80] transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="truncate max-w-[160px]">{prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link
                  href={`/courses/${courseId}/${nextLesson.id}`}
                  className="flex items-center gap-2 text-sm text-[#4ade80] hover:text-[#22c55e] transition-colors"
                >
                  <span className="truncate max-w-[160px]">{nextLesson.title}</span>
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: lesson list */}
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 shrink-0"
          >
            <div className="glass-card rounded-2xl p-4 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#a8c8a8] uppercase tracking-wider mb-3">
                Уроки курса
              </h3>
              <div className="space-y-1">
                {allLessons.map((l) => {
                  const isActive = l.id === lesson.id;
                  return (
                    <Link
                      key={l.id}
                      href={`/courses/${courseId}/${l.id}`}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.2)]"
                          : "hover:bg-[rgba(74,222,128,0.06)]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          l.isCompleted
                            ? "bg-[rgba(74,222,128,0.2)]"
                            : isActive
                            ? "bg-[rgba(74,222,128,0.15)] border border-[#4ade80]"
                            : "bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.15)]"
                        )}
                      >
                        {l.isCompleted ? (
                          <CheckCircle2 size={10} className="text-[#4ade80]" />
                        ) : isActive ? (
                          <Play size={8} className="text-[#4ade80] ml-0.5" />
                        ) : (
                          <Play size={8} className="text-[#6b8f6b] ml-0.5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs truncate",
                          isActive ? "text-[#4ade80] font-medium" : "text-[#a8c8a8]"
                        )}
                      >
                        {l.title}
                      </span>
                      {l.duration && (
                        <span className="text-[10px] text-[#3d5c3d] ml-auto shrink-0">
                          {Math.round(l.duration / 60)}м
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
