import { Chunk } from "@/types/Chunk";
import formatTime from "@/utils/formatTime";
import { Dispatch, SetStateAction, useRef, useState } from "react";
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

const VideoPlayer = ({ video, setVideo }: VideoPlayerProps) => {
  const [search, setSearch] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState<string>("");
  const [query, setQuery] = useState("");
  const [timestamp, setTimestamp] = useState<number | undefined>();

  // Fetch timestamp and redirect
  const queryVideo = async () => {
    try {
      setMessage("")
      setTimestamp(undefined)
      setSearch("");
      setQuery(search);
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
        setTimestamp(chunk.start);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch a chat response
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
        const { message }: { message: string } = await response.json();
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
    <div className="flex flex-col items-center justify-center gap-4 m-auto w-full max-w-[70rem]">
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
            className="focus:ring-0 focus:outline-none w-full max-h-[500px]"
          />
        </form>
      </div>

      <video
        autoPlay
        ref={videoRef}
        style={{ maxHeight: "500px" }}
        className="rounded-xl w-full"
        controls
        src={video.url}
      />

      {message.length > 0 && (timestamp || timestamp === 0) && query && (
        <div className="mr-auto py-4 px-8 rounded-xl border border-gray-200 w-full flex flex-col gap-2">
          <p className="flex items-center gap-2 font-semibold">
            <span className="px-2 rounded-full border border-gray-300 font-normal">{formatTime(timestamp!)}</span>
            {query.charAt(0).toUpperCase() + query.slice(1)}
          </p>
          {message}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
