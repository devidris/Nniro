import { usePixelContext } from "#/context/PixelBoardContext";
import useImage from "use-image";
import { Group, Image, Layer, Rect, Stage } from "react-konva";
import { createRef, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Konva from "konva";
import { useOnScreen } from "#/hooks/useOnScreen";

type Data = { key: string; value: boolean };

interface props {
  x: number;
  y: number;
  updateState: ({ key, value }: Data) => void;
}

const CanvasVisibleBoard = ({ x, y, updateState }: props) => {
  const refImage = useRef<any>(null);
  const isOnScreen = useOnScreen(refImage);
  const { handleSelectBlock, handleCanvasesLoading } = usePixelContext();
  if (x >= 1000) x = 950;
  if (y >= 1000) y = 950;

  const imgURL = `${process.env.NEXT_PUBLIC_API}/pixels-small?leftTopX=${x}&leftTopY=${y}`;

  const [fullPxImage, fullPxImageStatus] = useImage(imgURL || "");

  const handleClick = (e: any) => {
    handleSelectBlock(e.target.attrs.x, e.target.attrs.y);
  };

  if (fullPxImageStatus === "loading") {
    handleCanvasesLoading(true);
  } else {
    handleCanvasesLoading(false);
  }

  useEffect(() => {
    const key = `${x}-${y}`
    updateState({key, value: isOnScreen});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnScreen]);


  return (
    <Image
      opacity={1}
      x={x}
      y={y}
      width={50}
      height={50}
      image={fullPxImage}
      alt=""
      onClick={handleClick}
      ref={refImage}
    />
  );
};

export default CanvasVisibleBoard;
