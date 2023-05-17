'use client'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import axios, { isAxiosError } from "axios";
import Image from 'next/image'
import { ImageCanvas } from './components/ImageCanvas';
import { TextInput } from './components/TextInput';
import { FileUpload } from './components/FileUpload';

const inter = Inter({ subsets: ['latin'] })

const API_ENDPOINT = "https://rachelspark--replace-anything-fastapi-app-dev.modal.run";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [maskFile, setMaskFile] = useState<File>();
  const [uploadedImageURL, setUploadedImageURL] = useState("");
  const [prompt, setPrompt] = useState("");
  const [maskedImage, setMaskedImage] = useState("");
  const [binaryMask, setBinaryMask] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("");
  const [coords, setCoords] = useState([0, 0])

  useEffect(() => {
    setMaskFile(dataURLtoFile(binaryMask, "mask.png"))
  }, [binaryMask]);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const imageElement = e.currentTarget.getElementsByTagName('img')[0];
    
    const rect = imageElement.getBoundingClientRect();
    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;
    const x = (e.clientX - rect.left) * scaleX; // x position within the image, scaled to natural dimensions
    const y = (e.clientY - rect.top) * scaleY;  // y position within the image, scaled to natural dimensions
    
    setCoords([x, y])
    console.log("x: " + coords[0] + " y: " + coords[1]);
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
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <div className="relative text-center pb-10">
          <div className="animate-text bg-gradient-to-r from-violet-500 via-indigo-700 to-blue-900 bg-clip-text text-transparent text-7xl px-2 pb-6 font-black">
            Anything AI
          </div>
          <div className="text-xl text-black">Replace something with anything in an image using Stable Diffusion</div>
        </div>
        <div className="flex flex-row">
          <div className="bg-gray-100 shadow-md rounded-md p-10 justify-items-center">
            <div className="">
            <form>
              <fieldset className="pb-4">
                <input onChange={(e) => {
                  setFile(e.target.files![0]);
                  setUploadedImageURL(URL.createObjectURL(e.target.files![0]))
                  }} name="image" type="file" accept='.jpeg, .png, .jpg'></input>
              </fieldset>
            </form>
            <div>
            {uploadedImageURL && (
              <ImageCanvas imageUrl={uploadedImageURL} alt="UploadedImage" width={512} height={512} className="rounded" onClick={handleClick}/>
            )}
            </div>
            {maskedImage &&
              <Image src={`data:image/png;base64,${maskedImage}`} alt={''} width={512} height={512}/>
            }
            {binaryMask &&
              <Image src={`data:image/png;base64,${binaryMask}`} alt={''} width={512} height={512}/>
            }
            </div>
          </div>
          <div className="bg-gray-100 shadow-md rounded-md ml-4 p-2 justify-items-center">
            <div className="flex flex-col">
            {!binaryMask && (!loading ? 
              <button onClick={async() => await generateMask(coords)} className="rounded m-6 px-6 py-3 mt-12 text-lg text-white bg-indigo-800">Create Mask</button> 
              : <button className="rounded m-6 px-4 py-3 mt-12 text-lg flex flex-row text-white bg-indigo-800" disabled>
                Generating
                <svg className="animate-spin ml-2 mt-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-50" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                </button>)}
            {errorMessage && (
              <div className="text-red-500 text-center text-wrap text-md pt-4 mx-4">
                {errorMessage}
              </div>
            )}
            {binaryMask && (
              <TextInput prompt={prompt} setPrompt={setPrompt} handleSubmit={handleSubmit} loading={loading} />
            )}
            {errorMessage && (
              <div className="text-red-500 text-center text-wrap text-md pt-4 mx-4">
                {errorMessage}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
      <div>
            {generatedImages && (
              <div className= "rounded bg-white shadow">
                {generatedImages.map((image, index) =>
                  <Image className="" key={index} src={`data:image/png;base64,${image}`} alt={''} width={512} height={512}/>
                )}
              </div>
            )}
          </div>
    </main>
  )
}

