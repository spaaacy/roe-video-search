"use client";

import { Dispatch, SetStateAction, useState } from "react";
import toast from "react-hot-toast";
import Loader from "./Loader";

interface VideoUploaderProps {
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

type Update = { status: string; message: string | undefined; file: { name: string } | undefined }

export default function VideoUploader({ setVideo }: VideoUploaderProps) {
  const [status, setStatus] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Upload file to api endpoint
  const uploadFile = async (file: File) => {
    if (!file) return;

    setLoading(true);

    try {
      const videoElement = document.createElement("video");
      const videoURL = URL.createObjectURL(file);
      videoElement.src = videoURL;

      // Limit duration to 3 minutes
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          if (videoElement.duration > 180) {
            reject(toast.error("Video duration exceeds 3 minutes."));
          } else {
            resolve(null);
          }
        };
        videoElement.onerror = () => {
          throw Error("Failed to load metadata");
        };
      });

      setStatus(`Uploading ${file.name}`);

      // Call endpoint passing video
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-video/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw error;
      }

      // Listen to progress updates
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response stream");

      const decoder = new TextDecoder("utf-8");
      let streamedData = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        streamedData += decoder.decode(value, { stream: !done });

        const chunks = streamedData.split("\n");
        for (let i = 0; i < chunks.length - 1; i++) {
          const chunk = chunks[i];
          if (chunk.trim()) {
            const update: Update = JSON.parse(chunk);
            // Set video if successful
            if (update.status === "success") {
              setVideo({ url: videoURL, name: file.name });
              // Throw error
            } else if (update.status === "error") {
              toast.error(update.message!);
              break;
              // Set updates
            } else {
              setStatus(update.message!);
            }
          }
        }
        streamedData = chunks[chunks.length - 1]; // Keep the last incomplete chunk
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 m-auto flex flex-col items-center justify-center">
        <p className="text-sm font-semibold text-primary">{status}</p>
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="flex-1 m-auto w-full hover:cursor-pointer hover:bg-primary max-h-[675px] max-w-[1200px] flex flex-col items-center justify-center text-white bg-primary-dark rounded-xl"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
          uploadFile(file);
        }
      }}
      onClick={() => {
        const inputElement = document.getElementById("video-upload-input");
        if (inputElement) {
          inputElement.click();
        }
      }}
    >
      <p className="text-center">Drag and drop a video file here, or click to upload</p>
      <input
        id="video-upload-input"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadFile(file);
          }
        }}
      />
    </div>
  );
}
