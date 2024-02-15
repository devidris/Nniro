"use client";
import NextImage from "next/image";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import Button from "../UI/Button";
import { toast } from "react-toastify";
import useAxiosAuth from "#/hooks/useAuthAxios";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "../UI/Spinner";
import { PixelCell, usePixelContext } from "#/context/PixelBoardContext";
import Cropper from "react-easy-crop";
import Resizer from "react-image-file-resizer";
import { useServerLog } from "#/hooks";
import usePixel from "#/hooks/usePixel";

type PixelImageProps = {
  uploadedImage?: string;
  showUpload: boolean;
  showSelect: boolean;
  cell: PixelCell;
  isOwner: boolean;
};

const createImage = (url: string) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
  const image = (await createImage(imageSrc)) as HTMLImageElement;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.scale(1, 1);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");

  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // As Base64 string
  return croppedCanvas.toDataURL("image/png", 1);
}

const  PixelImage: React.FC<PixelImageProps> = ({
  uploadedImage,
  showUpload,
  // showSelect,
  cell,
  isOwner,
}) => {
  const axiosAuth = useAxiosAuth();
  const { sl } = useServerLog();
  const { pickedImage, handlePickImage } = usePixelContext()
  const queryClient = useQueryClient();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isLoadingUpload, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const cropRef = React.useRef<any>(null);
  const [mode, setMode] = React.useState("picture");

  const [croppedImage, setCroppedImage] = React.useState<string | null>(null);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const onImageSelect: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    e.preventDefault();
    const inputImage = e.target.files?.[0];

    if (!inputImage) {
      toast.error("Image not selected");
      return;
    }
    const sizeMax = 10 * 1024 * 1024;
    if (inputImage.size > sizeMax) {
      toast.error("Image size to big");
      return;
    }

    const imageBase64 = await resizeFile(inputImage);
    setMode("resize");

    handlePickImage(imageBase64);
  };

  const resizeFile = (file: File) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        2560,
        1440,
        "PNG",
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        "base64"
      );
    });

  sl(`pixel image ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`)
  const onUpload = async () => {
    if (!croppedImage) {
      toast.error("Image resize error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      const blob = await (await fetch(croppedImage)).blob();

      const file = new File([blob], "cell-img.png", {
        type: "image/png",
      });

      formData.append("file", file);
      // @ts-ignore
      formData.append("i", cell.y);
      // @ts-ignore
      formData.append("j", cell.x);
      await axiosAuth.post("/pixel/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Success Upload");

      await queryClient.invalidateQueries({ queryKey: ["board-segment"] });
      await queryClient.invalidateQueries({
        queryKey: [`${cell.y}-${cell.x}`],
      });

      setCroppedImage(null);
    } catch (error: any) {
      console.log("onUpdalod Error", error);
      toast.error(error?.response?.data ?? "Something went wrong");
      await queryClient.invalidateQueries({
        queryKey: [`${cell.y}-${cell.x}`],
      });
    }
    setLoading(false);
  };

  const onResizeClick = async () => {
    if (cropRef.current) {
      setCroppedImage(cropRef.current.getCanvas()?.toDataURL());
      setMode("picture");
      handlePickImage(null);
    }
    try {
      const croppedImage = await getCroppedImg(
        // @ts-ignore
        pickedImage,
        // @ts-ignore
        croppedAreaPixels
      );
      // @ts-ignore
      setCroppedImage(croppedImage);
      handlePickImage(null);
      setMode("picture");
    } catch (e) {
      console.error(e);
      toast.error("Resize error");
    }
  };

  const onSelectClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const showResize = mode === "resize";

  const showSelect = isOwner && !uploadedImage;

  return (
    <div className="flex flex-col gap-2 mb-3">
      <div
        className={classNames(
          "relative min-w-[300px] w-full min-h-[300px] overflow-hidden mx-auto"
        )}
      >
        <input
          ref={inputRef}
          disabled={isLoadingUpload}
          type="file"
          accept="image/png, image/jpeg"
          name="image"
          className="absolute inset-0 opacity-0 hidden"
          onChange={onImageSelect}
          // capture="environment"
        />
        {uploadedImage ? (
          <div className="relative w-[300px] h-[300px] mx-auto">
            <NextImage alt="" src={uploadedImage} width={300} height={300} />
          </div>
        ) : pickedImage || croppedImage ? (
          <div className="w-full flex justify-center min-h-[300px]">
            {pickedImage && !croppedImage ? (
              <div className="relative inset-0 w-[300px] min-h-[300px] h-full">
                <Cropper
                  image={pickedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 3}
                  objectFit="contain"
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-[300px] h-[300px] mx-auto"
                alt=""
                // @ts-ignore
                src={croppedImage}
                width={300}
                height={300}
              />
            )}
          </div>
        ) : (
          <div
            className={classNames(
              "w-[300px] h-[300px] mx-auto",
              !uploadedImage && !pickedImage && !croppedImage && "bg-gray-400"
            )}
          />
        )}
      </div>
      {showUpload && (
        <>
          {pickedImage && !croppedImage && (
            <Button
              size="xs"
              disabled={isLoadingUpload}
              className="relative"
              onClick={onResizeClick}
            >
              Crop
            </Button>
          )}
          {showSelect && (
            <Button
              size="xs"
              disabled={isLoadingUpload}
              className="relative"
              type="button"
              onClick={onSelectClick}
            >
              <span>Select your picture</span>
            </Button>
          )}
        </>
      )}
      {showUpload && (
        <Button
          onClick={onUpload}
          disabled={!croppedImage || mode === "resize"}
          className="flex justify-center gap-3 items-center"
        >
          {isLoadingUpload ? (
            <>
              <Spinner />
              <span>Loading...</span>
            </>
          ) : (
            "Upload Pixel"
          )}
        </Button>
      )}
    </div>
  );
}

export default PixelImage;
