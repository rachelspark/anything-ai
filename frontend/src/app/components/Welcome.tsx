import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '@mui/material';

export default function Welcome(props:{ open: boolean, onClose: any }) {
  const [height, setHeight] = useState(0);
  const [init, setInit] = useState(false);
  const welcomeEl = useRef(null);

  useEffect(() => {
    setInit(true);
  }, []);



  function handleWheel(event: { deltaY: number; }) {
    if (props.open) {
      if (event.deltaY > 0) {
        props.onClose();
      }
    }
  }

  return (
    <div>
        <Slide direction="down" in={props.open} mountOnEnter unmountOnExit>
        <div
          className="fixed z-40 inset-3 sm:inset-6 md:inset-8 rounded-2xl border border-gray-300 bg-white px-4 sm:px-6 overflow-y-auto"
          onWheel={handleWheel}
          ref={welcomeEl}
        >
          {init && (
            <div className="relative grid grid-rows-6 grid-flow-col max-w-full max-h-full justify-items-center content-center">
                <header className="row-start-1">
                    <div className="font-heading font-sans text-center text-3xl sm:text-4xl m-4 sm:m-8">
                        anything
                    </div>
                </header>
                <div className="row-start-2 row-span-4 text-center items-center mx-12 my-8">
                  <div className="max-w-[800px]">
                    <p className="font-medium text-4xl md:text-5xl md:leading-12">
                            Replace anything in your image, with just a click
                    </p>
                  </div>
                  <div className="relative h-full flex flex-col items-center">
                    <button className="rounded-full w-[180px] h-[56px] px-5 py-3 m-12 bg-gradient-to-r from-violet-800 via-indigo-700 to-blue-700 text-white text-lg
                     hover:shadow-2xl hover:shadow-indigo-600/50"
                      onClick={() => props.onClose()}>
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
                      <div className="flex justify-center items-center relative sm:h-[400px]">
                      <video autoPlay loop muted playsInline className="object-contain max-w-full max-h-full rounded-md">
                        <source src="/anything-demo.mp4" />
                      </video>
                    </div>
                  </div>
                </div>
            </div>
          )}

        </div>
        </Slide>
    </div>
  );
}