import { useState, useEffect } from "react";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";

const useAudio = (url: string) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, [audio]);

  return [playing, toggle] as const;
};

type PlayerProps = {
  url: string;
};

const Player = ({ url }: PlayerProps) => {
  const [playing, toggle] = useAudio(url);

  return (
    <button
      aria-label="pronunciation"
      onClick={toggle}
      className={`${
        playing ? "opacity-95" : "opacity-50"
      } print:hidden hover:opacity-100 hover:bg-indigo-200 rounded-full p-2 hover:text-indigo-800 transition-all`}
    >
      {playing ? <MdVolumeOff /> : <MdVolumeUp />}
    </button>
  );
};

export default Player;
