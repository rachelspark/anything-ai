import Image from "next/image";
import { useState, useRef, useEffect } from 'react';

export const ImageCanvas = ({
    imageUrl,
    alt,
    className,
    onBoxDrawn,
    isDisabled,
}: {
    imageUrl: string;
    alt: string;
    className?: string;
    onBoxDrawn?: (coordinates: { top: number; left: number; width: number; height: number, naturalWidth: number, naturalHeight: number }) => void;
    isDisabled?: boolean;
}) => {
    const [drawing, setDrawing] = useState(false);
    const [rectangle, setRectangle] = useState<{ top: number; left: number; width: number; height: number }>({ top: 0, left: 0, width: 0, height: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [showCursor, setShowCursor] = useState(false);
    const [clickPos, setClickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDisabled || !imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();

        setOriginalDims({ width: rect.width, height: rect.height });
        setDrawing(true);
        setRectangle({ 
            top: (e.clientY - rect.top) / rect.height, 
            left: (e.clientX - rect.left) / rect.width, 
            width: 0, 
            height: 0 
        });

        setClickPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        setCursorPos({ x: e.clientX, y: e.clientY });

        if (!drawing || !imgRef.current || !originalDims.width || !originalDims.height) return;
        const rect = imgRef.current.getBoundingClientRect();
        const newWidth = (e.clientX - rect.left) / rect.width - rectangle.left;
        const newHeight = (e.clientY - rect.top) / rect.height - rectangle.top;
        setRectangle((r) => ({ ...r, width: newWidth, height: newHeight }));
    };

    const handleMouseUp = () => {
        if (isDisabled || !drawing || !imgRef.current || !originalDims.width || !originalDims.height) return;
        setDrawing(false);

        console.log(imgRef.current.naturalWidth)
        console.log(imgRef.current.naturalHeight)

        if (onBoxDrawn) onBoxDrawn({
            top: rectangle.top,
            left: rectangle.left,
            width: rectangle.width,
            height: rectangle.height,
            naturalWidth: imgRef.current.naturalWidth,
            naturalHeight: imgRef.current.naturalHeight,
        });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // add mouse enter and leave event handlers
    const handleMouseEnter = () => {
        setShowCursor(true);
    };

    const handleMouseLeave = () => {
        setTimeout(() => setShowCursor(false), 300);
    };

    useEffect(() => {
        const img = new window.Image();
        img.src = imageUrl;
        img.onload = () => {
        if (imgRef.current) {
            imgRef.current.width = img.width;
            imgRef.current.height = img.height;
        }
        };
    }, [imageUrl]);


    return (
        
        <div className={`${className ? className : "flex items-center max-w-full max-h-full justify-center"}`}>
            <div className="relative w-auto h-auto inline-block">
                <Image src={imageUrl} ref={imgRef} alt={alt} width={768} height={512} className="object-contain w-full h-full" 
                    onMouseDown={!isDisabled ? handleMouseDown : undefined} 
                    onMouseMove={!isDisabled ? handleMouseMove : undefined} 
                    onMouseUp={!isDisabled ? handleMouseUp: undefined} 
                    onMouseEnter={!isDisabled ? handleMouseEnter : undefined} 
                    onMouseLeave={!isDisabled ? handleMouseLeave : undefined} 
                    onDragStart={handleDragStart}/>
                {showCursor && (
                    <div
                        style={{
                            position: 'fixed',
                            top: cursorPos.y,
                            left: cursorPos.x,
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 255, 0.5)',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',

                        }}
                    />
                )}
                {(rectangle.width !== 0 || rectangle.height !== 0) && (
                    <div
                        style={{
                            position: 'absolute',
                            border: '2px dashed rgba(0, 0, 255, 0.5)',
                            backgroundColor: 'rgba(0, 0, 255, 0.1)',
                            top: `${rectangle.top * 100}%`,
                            left: `${rectangle.left * 100}%`,
                            width: `${rectangle.width * 100}%`,
                            height: `${rectangle.height * 100}%`,
                            pointerEvents: 'none',
                        }}
                    />
                )}
                {(rectangle.width == 0 && rectangle.height == 0 && rectangle.top != 0 && rectangle.left != 0) && (
                    <div
                        style={{
                            position: 'absolute',
                            top: `${rectangle.top * 100}%`,
                            left: `${rectangle.left * 100}%`,
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 255, 0.5)',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                        }}
                    />
                )}
                {isDisabled && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.5rem',
                        zIndex: 2
                    }}>
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin ml-2 mt-1 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-50" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="text-sm text-center text-white p-4">Approximately 2 minutes...</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};