'use client'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import axios, { isAxiosError } from "axios";
import Image from 'next/image'
import Head from "next/head"
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
      className={`flex min-h-screen flex-col items-center justify-between p-12 sm:p-24 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-100 via-sky-50 to-white ${inter.className}`}
    >
      <Welcome open={welcome} onClose={handleClose}/>
      <div className="w-full">
        <header className="absolute inset-x-0 top-10 text-center">
          <button className="font-heading font-sans text-4xl pb-10 hover:[text-shadow:_0_0_2px_rgb(0_0_255_/_25%)]" onClick={() => setWelcome(true)}>
            anything
          </button>
        </header>
        <div className="m-auto">
          <MainComponent/>
        </div>
      </div>
      <footer className="w-full text-center text-xs text-gray-400 p-4">
          Built by <a className="hover:text-gray-500 underline" target="_blank" rel="noopener noreferref" href="https://twitter.com/rachelsupark">Rachel Park</a> with <a className="underline hover:text-gray-500" target="_blank" rel="noopener noreferref" href="https://github.com/rachelspark/anything-ai">code</a> on Github
        </footer>
    </main>
  )
}

