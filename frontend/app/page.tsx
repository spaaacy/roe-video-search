"use client";

import VideoUploader from "@/components/VideoUploader";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useState } from "react";
import Loader from "@/components/Loader";
import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
  const [video, setVideo] = useState<string>();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen px-8">
      <NavBar />
      {loading ? (
        <Loader />
      ) : video ? (
        <VideoPlayer video={video} />
      ) : (
        <VideoUploader setVideo={setVideo} setLoading={setLoading} />
      )}
      <Footer />
    </div>
  );
}
