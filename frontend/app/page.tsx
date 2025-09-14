"use client";

import VideoUploader from "@/components/VideoUploader";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [video, setVideo] = useState<{ url: string; name: string }>();

  return (
    <div className="flex flex-col min-h-screen px-8">
      <NavBar />
      {video ? <VideoPlayer video={video} setVideo={setVideo} /> : <VideoUploader setVideo={setVideo} />}
      <Footer />
      <Toaster />
    </div>
  );
}
