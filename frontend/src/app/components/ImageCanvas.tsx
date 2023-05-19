import Image from "next/image";
import { useState, useRef, useEffect } from 'react';

export const ImageCanvas = ({
    imageUrl,
    alt,
    className,
    onClick,
    onBoxDrawn,
}: {
    imageUrl: string;
    alt: string;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onBoxDrawn?: (coordinates: { top: number; left: number; width: number; height: number, naturalWidth: number, naturalHeight: number }) => void;
}) => {
    const [drawing, setDrawing] = useState(false);
    const [rectangle, setRectangle] = useState<{ top: number; left: number; width: number; height: number }>({ top: 0, left: 0, width: 0, height: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [showCursor, setShowCursor] = useState(false);
    const [clickPos, setClickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current) return;
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
        setCursorPos({ x: e.clientX, y: e.clientY });

        if (!drawing || !imgRef.current || !originalDims.width || !originalDims.height) return;
        const rect = imgRef.current.getBoundingClientRect();
        const newWidth = (e.clientX - rect.left) / rect.width - rectangle.left;
        const newHeight = (e.clientY - rect.top) / rect.height - rectangle.top;
        setRectangle((r) => ({ ...r, width: newWidth, height: newHeight }));
    };

    const handleMouseUp = () => {
        if (!drawing || !imgRef.current || !originalDims.width || !originalDims.height) return;
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
        
        <div className={`${className ? className : "relative inline-block"}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onDragStart={handleDragStart}>
            <div className="relative w-full h-full">
                <Image src={imageUrl} ref={imgRef} alt={alt} width="0" height="0" className="w-full h-auto"/>
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
                

            </div>
        </div>
    );
};