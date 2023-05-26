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
      className={`flex min-h-screen flex-col items-center justify-between p-24 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-100 via-sky-50 to-white ${inter.className}`}
    >
      <Welcome open={welcome} onClose={handleClose}/>
      <div className="w-full">
        <header className="absolute inset-x-0 top-10 text-center">
          <button className="text-4xl font-medium mb-10 sm:mb-10 hover:[text-shadow:_0_0_2px_rgb(0_0_255_/_25%)]" onClick={() => setWelcome(true)}>
            anything
          </button>
        </header>
        <div className="m-auto">
          <MainComponent/>
        </div>
      </div>
      <footer className="pt-12 w-full text-center text-xs text-gray-400">
          Built by <a className="hover:text-gray-500" target="_blank" rel="noopener noreferref" href="https://twitter.com/rachelsupark">Rachel Park</a>
          <span className="mx-1.5">|</span>
          <a className="hover:text-gray-500" target="_blank" rel="noopener noreferref" href="https://twitter.com/rachelsupark">Details + Code</a>
        </footer>
    </main>
  )
}

