"use client";

import { Dispatch, SetStateAction } from "react";

interface VideoUploaderProps {
  setVideo: Dispatch<SetStateAction<string | undefined>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function VideoUploader({ setVideo, setLoading }: VideoUploaderProps) {
  const uploadFile = async (file: File) => {
    if (!file) return;

    setLoading(true);

    try {
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
      const videoURL = URL.createObjectURL(file);
      setVideo(videoURL);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
