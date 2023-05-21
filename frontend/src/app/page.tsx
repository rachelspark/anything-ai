'use client'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import axios, { isAxiosError } from "axios";
import Image from 'next/image'
import { ImageCanvas } from './components/ImageCanvas';
import { TextInput } from './components/TextInput';
import MainComponent from './components/MainComponent';
import Welcome from './components/Welcome';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [welcome, setWelcome] = useState(true);

  const handleClose = () => {
    setWelcome(false);
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <Welcome open={welcome} onClose={handleClose}/>
      <div>
        <div className="absolute inset-x-0 top-10 text-center">
          <button className="text-4xl sm:text-5xl fontvar-heading mb-2 sm:mb-4" onClick={() => setWelcome(true)}>
            anything ai
          </button>
        </div>
        <MainComponent/>
      </div>
    </main>
  )
}

