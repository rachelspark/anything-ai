'use client'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import axios, { isAxiosError } from "axios";
import Image from 'next/image'
import { ImageCanvas } from './ImageCanvas';
import { TextInput } from './TextInput';
import Dropzone from './Dropzone';

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
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("");
    const [coords, setCoords] = useState([0, 0, 0, 0])
  
    useEffect(() => {
      setMaskFile(dataURLtoFile(binaryMask, "mask.png"))
    }, [binaryMask]);

    useEffect(() => {
        setUploadedImageURL(file ? URL.createObjectURL(file) : "")
    }, [file]);
  
    const handleBoxDrawn = (rectangle: { top: number; left: number; width: number; height: number, naturalWidth: number, naturalHeight: number }) => {
      // these are the relative coordinates of the box's corners
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
        setErrorMessage("Please upload front image");
        return;
      }
      try {
        setLoading(true)
        setErrorMessage("")
        const formData = new FormData();
        const headers = {
          accept: "application/json",
          "Content-Type": "multipart/form-data",
        };
        formData.append("file", file!);
        formData.append("point_coords", coords.join(','));
        console.log(formData) 
        const axiosResponse = await axios.post(API_ENDPOINT + "/generate-mask", formData, {
          headers: headers,
        })
        console.log(axiosResponse.data!)
        setMaskedImage(axiosResponse.data!['colored_mask'])
        setBinaryMask(axiosResponse.data!['binary_mask'])
        // resetting error and loading states
        setLoading(false)
        setErrorMessage("")
      } catch (e: unknown) {
        setLoading(false)
        if (isAxiosError(e)) {
          setErrorMessage("Sorry, we're running into an issue. Please try again in a bit!")
        }
      }
    }
  
    const generateImages = async () => {
      if (!file) {
        setErrorMessage("Please upload front image");
        return;
      }
      try {
        setLoading(true)
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
        setLoading(false)
        setErrorMessage("")
      } catch (e: unknown) {
        setLoading(false)
        if (isAxiosError(e)) {
          setErrorMessage("Sorry, we're running into an issue. Please try again in a bit!")
        }
      }
    }
  
    return (
      <main
        className={`flex max-h-screen flex-col items-center justify-between p-8 ${inter.className}`}
      >
        <div>
          <div className="flex flex-row">
            <div className="bg-gray-100 w-[512px] h-[512px] shadow-md rounded-md p-10 justify-items-center">
                {!file && <Dropzone onImageDropped={setFile} userUploadedImage={file}/>}
                {(uploadedImageURL != "" && !maskedImage) && (
                    <ImageCanvas imageUrl={uploadedImageURL} alt="UserUploadedImage" onBoxDrawn={handleBoxDrawn}/>
                )}
                {(maskedImage && generatedImages.length == 0) &&
                    <Image src={`data:image/png;base64,${maskedImage}`} alt={''} width={512} height={512}/>
                }
                {generatedImages && (
                    <div className= "grid grid-cols-2">
                    {generatedImages.map((image, index) =>
                        <div className="relative group" key={index}>
                            <Image className="p-2" src={`data:image/png;base64,${image}`} alt={''} width={512} height={512}/>
                            <div className="absolute bottom-4 right-4 bg-gray-500 bg-opacity-0 text-white px-2 py-1 group-hover:bg-gray-800/50 transition duration-200">
                                <button 
                                    className="opacity-0 group-hover:opacity-100"
                                    onClick={() => {
                                        downloadBase64File(`data:image/png;base64,${image}`);
                                    }}
                                >
                                    Download 
                                    {/* TODO: Replace with svg of download button */}
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                )}
            </div>
            <div className="bg-gray-100 h-[512px] shadow-md rounded-md ml-4 p-2 justify-items-center">
              <div className="flex flex-col">
              {!binaryMask && (!loading ? 
                <button onClick={async() => await generateMask(coords)} className="rounded m-6 px-6 py-3 mt-12 text-lg text-white bg-indigo-800 hover:bg-indigo-900">Create Mask</button> 
                : <button className="rounded m-6 px-4 py-3 mt-12 text-lg flex flex-row text-white bg-indigo-800" disabled>
                  Generating
                  <svg className="animate-spin ml-2 mt-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-50" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  </button>)}
              {/* {errorMessage && (
                <div className="text-red-500 text-center text-wrap text-md pt-4 mx-4">
                  {errorMessage}
                </div>
              )} */}
              {binaryMask && (
                <TextInput prompt={prompt} setPrompt={setPrompt} handleSubmit={handleSubmit} loading={loading} />
              )}
              </div>
            </div>
          </div>
      </div>
      <div>
      </div>
      </main>
    )
  }
  