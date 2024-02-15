"use client";
import { usePixelContext } from "#/context/PixelBoardContext";
import { useSearchParams } from "next/navigation";
import React from "react";

function CanvasState() {
  const {
    visibleSegmentCoords,
    boardConfig: { cellSize, scale },
    // isLoading
  } = usePixelContext();

  const params = useSearchParams();

  const debug = params.get("debug");
  return (
    <div className="absolute top-[90px] right-2 text-black px-3 py-2 min-w-[100px] max-w-[200px] flex flex-col items-end justify-center bg-gray-100 shadow z-[20] rounded-xl">
      <div className="flex flex-col items-start gap-2">
        {debug && (
          <div className="flex flex-col">
            <span>{`zoom  ${scale}`}</span>
            <span>{`X: ${visibleSegmentCoords.x1} - ${visibleSegmentCoords.x2}`}</span>
            <span>{`Y: ${visibleSegmentCoords.y1} - ${visibleSegmentCoords.y2}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CanvasState;
