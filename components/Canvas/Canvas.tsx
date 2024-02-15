"use client";
import React from "react";
import { usePixelContext } from "#/context/PixelBoardContext";
import Spinner from "../UI/Spinner";
import CanvasStage from "./CanvasStage";
import CanvasState from "./CanvasState";
import { useSearchParams } from "next/navigation";
import { useServerLog } from "#/hooks";

function Canvas() {
  const { isLoading, canvasesLoading } = usePixelContext();
  const params = useSearchParams();
  const { sl } = useServerLog();

  const debug = params.get("debug");

  return (
    <>
      {/* {isLoading && (
        <div className="absolute z-50 left-4 top-[95px]">
          <Spinner className="z-50" />
        </div>
      )} */}
      {/* display page info */}
      {debug && <CanvasState />}
      {/* <div className="bg-gray-100"> */}
        <CanvasStage />
      {/* </div> */}
    </>
  );
}

export default Canvas;
