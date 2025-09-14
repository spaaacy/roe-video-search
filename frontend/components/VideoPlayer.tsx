import formatTime from "@/utils/formatTime";
import { Dispatch, FormEvent, SetStateAction, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";

interface VideoPlayerProps {
  video: { url: string; name: string };
  setVideo: Dispatch<
    SetStateAction<
      | {
          url: string;
          name: string;
        }
      | undefined
    >
  >;
}

type Chunk = {
  start: number;
  end: number;
  text: string;
};

const VideoPlayer = ({ video, setVideo }: VideoPlayerProps) => {
  const [search, setSearch] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState<string>("");

  const queryVideo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query-video/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: search, videoName: video.name }),
      });
      if (response.ok) {
        const { chunk }: { chunk: Chunk } = await response.json();
        if (videoRef.current) videoRef.current.currentTime = chunk.start;
        toast.success(`Redirecting to ${formatTime(chunk.start)}`);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: search, videoName: video.name }),
      });

      if (response.ok) {
        const { message } = await response.json();
        setMessage(message);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 m-auto w-full max-w-[90rem]">
      <div className="flex gap-2 items-center w-full">
        <button className="hover:cursor-pointer" onClick={() => setVideo(undefined)} type="button">
          <BiArrowBack size={20} />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            queryVideo();
            fetchChat();
          }}
          className="rounded-full bg-gray-200 py-2 px-4 border-2 border-white focus:border-primary flex items-center gap-2 w-full"
        >
          <FaSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search something"
            className="focus:ring-0 focus:outline-none w-full"
          />
        </form>
      </div>
      <p className="mr-auto px-10">{message}</p>

      <video
        autoPlay
        ref={videoRef}
        className="max-h-[675px] max-w-[1200px] rounded-xl w-full"
        controls
        src={video.url}
      />
    </div>
  );
};

export default VideoPlayer;
