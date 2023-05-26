import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '@mui/material';

export default function Welcome({ open, onClose }) {
  const [height, setHeight] = useState(0);
  const [init, setInit] = useState(false);
  const welcomeEl = useRef(null);

  useEffect(() => {
    setInit(true);
  }, []);



  function handleWheel(event) {
    if (open) {
      if (event.deltaY > 0) {
        onClose();
      }
    }
  }

  return (
    <div>
        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
        <div
          className="fixed z-40 inset-3 sm:inset-6 md:inset-8 rounded-2xl border border-gray-300 bg-white flex flex-col justify-between items-center px-4 sm:px-6 overflow-y-auto"
          onWheel={handleWheel}
          ref={welcomeEl}
        >
          {init && (
            <div className="flex w-full h-full justify-center items-center">
                <header className="absolute inset-x-0 top-0">
                    <div className="font-medium text-center text-3xl md:text-4xl m-8">
                        anything
                    </div>
                </header>
                <div className="w-full max-h-1/2 flex flex-col justify-center items-center m-4">
                  <p className="text-center text-4xl md:text-5xl m-8">
                          Replace something with anything, with just a click.
                  </p>
                  <button className="rounded-full w-[200px] px-5 py-2 mb-4 bg-indigo-800 text-white text-lg
                    hover:bg-white hover:text-indigo-800 hover:ring-1 hover:ring-indigo-800
                    active:bg-indigo-100 active:text-indigo-800 active:ring-1 active:ring-indigo-800 transition-colors"
                    onClick={() => onClose()}>
                        Get Started
                        <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="inline pb-0.5 ml-1 -mr-1"
                        ><line x1="12" y1="5" x2="12" y2="19" /><polyline
                        points="19 12 12 19 5 12"
                        /></svg>
                    </button>
                  <div className="flex justify-center">
                    <video autoPlay loop muted playsInline className="w-2/3">
                      <source src="/anything-demo.mp4" />
                    </video>
                  </div>
                </div>
                {/* <div className="absolute inset-x-0 bottom-24 text-center">
                    
                </div> */}
            </div>
          )}

        </div>
        </Slide>
    </div>
  );
}