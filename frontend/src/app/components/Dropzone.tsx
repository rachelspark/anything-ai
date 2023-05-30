import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Dropzone(props: { onImageDropped: any; userUploadedImage: any; }) {
  const onImageDropped = props.onImageDropped;
  const onDrop = useCallback(
    (acceptedFiles: any[]) => {
      onImageDropped(acceptedFiles[0]);
    },
    [onImageDropped]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    accept: {
      'image/jpeg': [], 
      'image/png': []
    },
    onDrop 
  });

  if (props.userUploadedImage) return null;

  return (
    <div
      className="relative w-full h-full min-h-[280px] sm:min-h-[400px] flex border-4 border-dashed border-gray-200 text-gray-400 text-sm text-center cursor-pointer select-none p-4 hover:text-gray-600"
      {...getRootProps()}
    >
      <div className="m-auto">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the image here ...</p>
        ) : (
          <p>Drag and drop your starting image here</p>
        )}
      </div>
    </div>
  );
}