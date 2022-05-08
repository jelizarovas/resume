import { useState, useEffect } from "react";
import { MdVolumeMute, MdVolumeOff, MdVolumeUp } from "react-icons/md";

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
    <div>
      <button onClick={toggle}>
        {playing ? <MdVolumeOff /> : <MdVolumeUp />}
      </button>
    </div>
  );
};

export default Player;
