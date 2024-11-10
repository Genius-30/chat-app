import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function CustomAudioPlayer({
  src = "",
  audioDuration = 0,
  fileName = "",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(audioDuration);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekingTime, setSeekingTime] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration !== Infinity ? audio.duration : duration);
      }
    };

    const setAudioTime = () => {
      if (audio.currentTime && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleAudioEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("durationchange", setAudioData);
    audio.addEventListener("ended", handleAudioEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("durationchange", setAudioData);
      audio.removeEventListener("ended", handleAudioEnd);
    };
  }, [duration]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSliderChange = (newValue) => {
    const [value] = newValue;
    setSeekingTime(value);
  };

  const handleSliderCommit = () => {
    const audio = audioRef.current;
    if (audio && seekingTime !== null) {
      audio.currentTime = (seekingTime / 100) * duration;
      setCurrentTime(audio.currentTime);
      setSeekingTime(null);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-300 dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-[#323232] dark:bg-slate-900 border-gray-600 hover:bg-zinc-700 dark:hover:bg-slate-800"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white dark:text-gray-100" />
            ) : (
              <Play className="h-4 w-4 text-white dark:text-gray-100" />
            )}
          </Button>
          <div className="text-xs sm:text-base font-semibold text-wrap mx-2 max-w-[30%] sm:max-w-[45%] whitespace-normal break-words">
            <span>{fileName}</span>
          </div>
          <div className="text-xs sm:text-sm font-medium">
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
        <Slider
          value={[
            seekingTime !== null ? seekingTime : (currentTime / duration) * 100,
          ]}
          max={100}
          step={0.1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full custom-slider dark:bg-blue-950"
          aria-label="Audio progress"
        />
      </div>
    </div>
  );
}
