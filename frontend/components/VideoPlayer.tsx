import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface VideoPlayerProps {
  video: string;
}

const VideoPlayer = ({ video }: VideoPlayerProps) => {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col items-center justify-center gap-4 m-auto">
      <div className="rounded-full bg-gray-200 py-2 px-4 border-2 border-white focus:border-primary flex items-center gap-2 w-full">
        <FaSearch />
        <input type="text" placeholder="Search something" className="focus:ring-0 focus:outline-none w-full" />
      </div>
      <video className="max-h-[675px] max-w-[1200px] rounded-xl w-full" controls src={video} />
    </div>
  );
};

export default VideoPlayer;
