import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '@mui/material';

function Welcome({ open, onClose }) {
//   const [mouseX, setMouseX] = useState(-142);
//   const [mouseY, setMouseY] = useState(-142);
  const [height, setHeight] = useState(0);
  const [init, setInit] = useState(false);
  const welcomeEl = useRef(null);

  useEffect(() => {
    setInit(true);
  }, []);

//   function handleMouse(event) {
//     if (mouseX === -142) {
//       setMouseX(event.clientX);
//       setMouseY(event.clientY);
//     }
//     setMouseX(event.clientX - welcomeEl.current.offsetLeft);
//     setMouseY(event.clientY - welcomeEl.current.offsetTop);
//   }


  function handleWheel(event) {
    if (open) {
    //   event.preventDefault();
      if (event.deltaY > 0) {
        onClose();
      }
    }
  }

  return (
    <div>
      {/* {open && mouseX !== -142 && (
        <div className="fixed z-40 inset-3 sm:inset-6 md:inset-8 rounded-2xl overflow-hidden">
          <div
            className="radial-gradient relative z-30 w-[360px] h-[360px] rounded-full"
            style={{ left: `${mouseX}px`, top: `${mouseY}px`, transform: "translate(-50%, -50%)" }}
          />
        </div>
      )} */}
        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
        <div
          className="fixed z-40 inset-3 sm:inset-6 md:inset-8 rounded-2xl border border-gray-300 bg-gray-50 flex flex-col justify-between items-center px-4 sm:px-6 overflow-y-auto"
        //   onMouseMove={handleMouse}
          onWheel={handleWheel}
          ref={welcomeEl}
        >
          {init && (
            <div>
                <div className="py-8">
                    <div className="text-center text-4xl sm:text-5xl mb-2 sm:mb-4">
                        Anything AI
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-24 text-center">
                    <button className="rounded-full px-5 py-2 bg-black text-white text-lg
                    hover:bg-white hover:text-black hover:ring-1 hover:ring-black
                    active:bg-indigo-100 active:text-black active:ring-1 active:ring-black transition-colors"
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
                </div>
            </div>
          )}

        </div>
        </Slide>
    </div>
  );
}

export default Welcome;