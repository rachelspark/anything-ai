'use client'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import axios, { isAxiosError } from "axios";
import Image from 'next/image'
import { ImageCanvas } from './ImageCanvas';
import { TextInput } from './TextInput';
import Dropzone from './Dropzone';
import Tabs from './Tabs';
import Instructions from './Instructions';

const inter = Inter({ subsets: ['latin'] })

const API_ENDPOINT = "https://rachelspark--replace-anything-fastapi-app-dev.modal.run";

export default function MainComponent() {
    const [file, setFile] = useState<File>();
    const [maskFile, setMaskFile] = useState<File>();
    const [uploadedImageURL, setUploadedImageURL] = useState("");
    const [prompt, setPrompt] = useState("");
    const [maskedImage, setMaskedImage] = useState("");
    const [binaryMask, setBinaryMask] = useState("");
    const [generatedImages, setGeneratedImages] = useState([]);
    const [loadingMask, setLoadingMask] = useState(false)
    const [maskState, setMaskState] = useState("replace")
    const [loadingImages, setLoadingImages] = useState(false)
    const [errorMessage, setErrorMessage] = useState("");
    const [coords, setCoords] = useState([0, 0, 0, 0])
  
    useEffect(() => {
        setMaskFile(dataURLtoFile(binaryMask, "mask.png"))
    }, [binaryMask]);

    useEffect(() => {
        setUploadedImageURL(file ? URL.createObjectURL(file) : "")
    }, [file]);
  
    const handleBoxDrawn = (rectangle: { top: number; left: number; width: number; height: number, naturalWidth: number, naturalHeight: number }) => {
      // relative coordinates of the box's corners
      const x1 = rectangle.left * rectangle.naturalWidth;
      const y1 = rectangle.top * rectangle.naturalHeight;
      const x2 = (rectangle.left + rectangle.width) * rectangle.naturalWidth;
      const y2 = (rectangle.top + rectangle.height) * rectangle.naturalHeight;
  
      setCoords([x1, y1, x2, y2]);
      console.log(`Top left corner: (${x1}, ${y1}), Bottom right corner: (${x2}, ${y2})`);
    };
  
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      await generateImages();
    }

    const startOver = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setFile(undefined);
        setMaskFile(undefined);
        setErrorMessage("");
        setPrompt("");
        setMaskedImage("");
        setBinaryMask("");
        setGeneratedImages([]);
        setLoadingMask(false);
        setLoadingImages(false);
        setCoords([0, 0, 0, 0]);
    }
  
    const dataURLtoFile = (dataurl: string, filename: string) => {
      const bstr = atob(dataurl)
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n) {
        u8arr[n - 1] = bstr.charCodeAt(n - 1)
        n -= 1 // to make eslint happy
      }
      return new File([u8arr], filename)
    }
    
    function downloadBase64File(linkSource: string) {
        // const linkSource = `data:${contentType};base64,${base64Data}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = "download.png";
        downloadLink.click();
    }
  
    const generateMask = async (coords: number[]) => {
      if (!file) {
        setErrorMessage("Please upload starting image");
        return;
      }
      if (file && coords.every(coord => coord === 0)) {
        setErrorMessage("Please select object");
        return;
      }
      try {
        setLoadingMask(true)
        setErrorMessage("")
        const formData = new FormData();
        const headers = {
          accept: "application/json",
          "Content-Type": "multipart/form-data",
        };
        formData.append("file", file!);
        formData.append("point_coords", coords.join(','));
        formData.append("mask_state", maskState.toString()); 
        console.log(formData) 
        const axiosResponse = await axios.post(API_ENDPOINT + "/generate-mask", formData, {
          headers: headers,
        })
        console.log(axiosResponse.data!)
        setMaskedImage(axiosResponse.data!['colored_mask'])
        setBinaryMask(axiosResponse.data!['binary_mask'])
        // resetting error and loading states
        setLoadingMask(false)
        setErrorMessage("")
      } catch (e: unknown) {
            setLoadingMask(false)
            if (isAxiosError(e)) {
            setErrorMessage("Sorry, we're running into an issue. Try again in a bit!")
            }
      }
    }
  
    const generateImages = async () => {
      if (!file) {
        setErrorMessage("Please upload front image");
        return;
      }
      try {
        setLoadingImages(true)
        setErrorMessage("")
        setPrompt(prompt)
        console.log(prompt)
        const formData = new FormData();
        const headers = {
          accept: "application/json",
          "Content-Type": "multipart/form-data",
        };
        formData.append("mask_img", maskFile!)
        formData.append("img", file!);
        formData.append("prompt", prompt)
        const axiosResponse = await axios.post(API_ENDPOINT + "/generate-image", formData, {
          headers: headers,
        })
        console.log(axiosResponse.data!)
        setGeneratedImages(axiosResponse.data!['images'])
  
        // resetting error and loading states
        setLoadingImages(false)
        setErrorMessage("")
      } catch (e: unknown) {
        setLoadingImages(false)
        if (isAxiosError(e)) {
          setErrorMessage("Sorry, we're running into an issue. Try again in a bit!")
        }
      }
    }
  
    return (
      <main
        className={`flex w-full items-center justify-between py-10 ${inter.className}`}
      >
        <div className="relative w-full">
          <div className="flex flex-col justify-center sm:flex-row">
            <div className="flex justify-center bg-white w-full sm:w-3/4 h-full sm:min-h-[512px] shadow-md border border-gray-200 rounded-md p-10 mb-4 sm:mb-auto">
                {!file && (
                    <Dropzone onImageDropped={setFile} userUploadedImage={file}/>
                )}
                {(uploadedImageURL != "" && !maskedImage) && (
                    <ImageCanvas imageUrl={uploadedImageURL} alt="UserUploadedImage" onBoxDrawn={handleBoxDrawn} isDisabled={loadingMask}/>
                )}
                {(maskedImage && generatedImages.length == 0) &&
                    <div className="relative items-center">
                        <Image src={`data:image/png;base64,${maskedImage}`} alt={''} width={512} height={512}/>
                        {loadingImages && (
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
                                    <div className="text-sm text-white p-4">Approximately 30 secs...</div>
                                </div>
                            </div>
                            
                        )}
                    </div>
                }
                {generatedImages && (
                    <div className= "grid grid-cols-2">
                    {generatedImages.map((image, index) =>
                        <div className="relative group" key={index}>
                            <Image className="p-2" src={`data:image/png;base64,${image}`} alt={''} width={512} height={512}/>
                            <div className="absolute bottom-4 right-4 rounded bg-gray-400 bg-opacity-0 text-white px-2 py-1 group-hover:bg-gray-800/50 transition duration-200">
                                <button 
                                    className="opacity-0 group-hover:opacity-100"
                                    onClick={() => {
                                        downloadBase64File(`data:image/png;base64,${image}`);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                )}
            </div>
            <div className="relative bg-white max-w-full sm:w-1/4 sm:min-w-[220px] max-h-full sm:min-h-[512px] border border-gray-200 shadow-md rounded-md sm:ml-4 p-2 justify-items-center">
              <div className="flex flex-col p-4 pb-20"> 
                {!binaryMask && (
                    <div>
                        <Instructions index={0}/>
                        <Tabs setMaskState={setMaskState}/>
                        {errorMessage ? (
                            <div className="text-red-500 text-xs text-center text-wrap my-4">{errorMessage}</div>
                            ) : <div className="m-4"/>
                        }
                        {(!loadingMask) ?  
                            <button onClick={async() => await generateMask(coords)} className="absolute inset-x-6 bottom-12 rounded px-6 py-3 text-lg text-white bg-indigo-800 hover:bg-indigo-900">Create Mask</button> 
                            : <button className="absolute inset-x-6 bottom-12 rounded px-6 py-3 text-lg text-white bg-indigo-900 " disabled>
                            Generating
                        </button>}
                    </div>
                )}
                {(binaryMask && generatedImages.length == 0) && (
                    <div className="flex flex-col h-full">
                        <Instructions index={1}/>
                        <TextInput prompt={prompt} setPrompt={setPrompt} handleSubmit={handleSubmit} loading={loadingImages} />
                    </div>
                )}
                {generatedImages.length > 0 && (
                    <div className="py-12 text-center">
                        <div className="text-black text-xl font-bold py-2">
                            Your images are ready! 🎉
                        </div>
                    </div>
                )
                }
                {generatedImages.length == 0 ? 
                    <button className="absolute inset-x-6 bottom-4 text-center text-xs text-gray-400" onClick={startOver} disabled={loadingMask || loadingImages}>
                        Start over
                    </button> : <button className="rounded px-6 py-3 text-lg text-white bg-indigo-800 hover:bg-indigo-900" onClick={startOver} disabled={loadingMask || loadingImages}>
                        Start over
                    </button>
                }
              </div>
            </div>
          </div>
      </div>
      <div>
      </div>
      </main>
    )
  }
  