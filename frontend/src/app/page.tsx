'use client'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import axios, { isAxiosError } from "axios";
import Image from 'next/image'
import { ImageCanvas } from './components/ImageCanvas';
import { TextInput } from './components/TextInput';
import { FileUpload } from './components/FileUpload';
import MainComponent from './components/MainComponent';

const inter = Inter({ subsets: ['latin'] })

const API_ENDPOINT = "https://rachelspark--replace-anything-fastapi-app-dev.modal.run";

export default function Home() {
  const [welcome, setWelcome] = useState(true);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <div className="relative text-center pb-10">
          <div className="animate-text bg-gradient-to-r from-violet-500 via-indigo-600 to-blue-900 bg-clip-text text-transparent text-7xl px-2 pb-6 font-black">
            anything ai
          </div>
          <div className="text-xl text-black">replace something with anything in an image using Stable Diffusion</div>
        </div>
        <MainComponent/>
      </div>
    </main>
  )
}

