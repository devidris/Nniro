"use client";
import { useRef, useState, useEffect, Key } from "react";
import Konva from "konva";
import { Stage, Layer, Line, Image, Rect } from "react-konva";
import { usePixelContext } from "#/context/PixelBoardContext";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import CanvasVisibleCells from "./CanvasVisiblePixels";
import CanvasVisibleBoard from "./CanvasVisibleBoard";
import GridLinesLayout from "./CanvasGrid";
import { useSearchParams } from "next/navigation";
import { useServerLog } from "#/hooks";
import isEqual from "lodash/isEqual";

const borderPX = 0.01;

const MAX_SCALE = 350;
const MIN_SCALE = 0.378;
const ZOOM_THRESHOLD = 1;

function CanvasStage() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEventBlock, setBlock] = useState(false);
  const [newScale, setNewScale] = useState(0);
  const { sl } = useServerLog();
  const {
    setVisibleSegment,
    selected: selectedCell,
    setSelectedPixel,
    checkAllowedHiRes,
    checkAllowedLowRes,
    checkAllowedLowResToRender,
    visibleSegmentCoords,
    mainImage,
    isLoading,
    boardConfig: { cellSize, scaleBy, maxScale, minScale, boardSize },
    setBoardConfig,
    availbleImgsInLowRes,
    // isLoading,
    canvasCell,
    canvasesLoading,
  } = usePixelContext();

  const params = useSearchParams();

  const debug = params.get("debug");

  const [fullPxImage] = useImage(mainImage || "");

  const windowArea = {
    width: containerRef.current?.clientWidth,
    height: containerRef.current?.clientHeight,
    // round to bigger min pixelRatio for full screen
    minScale: minScale,
  };

  const [{ scale, ...position }, setStageGlobe] = useState<{
    scale: number;
    x: number;
    y: number;
  }>({
    scale: minScale,
    x: 0,
    y: 0,
  });

  const setStage = (config: any) => {
    if (config.scale) {
      setBoardConfig({ scale: config.scale });
    }

    setStageGlobe((p) => ({ ...p, ...config }));
  };
  // prevent defaults
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", handler);
    document.addEventListener("gesturechange", handler);
    document.addEventListener("gestureend", handler);
    return () => {
      document.removeEventListener("gesturestart", handler);
      document.removeEventListener("gesturechange", handler);
      document.removeEventListener("gestureend", handler);
    };
  }, []);

  useEffect(() => {
    const initialMinScale = (window.innerWidth + 1) / boardSize || 1;
    setBoardConfig({
      minScale: initialMinScale,
      scale: initialMinScale,
      maxScale: window.innerWidth,
    });
    setStage({ scale: initialMinScale });
    // if (containerRef.current?.clientWidth) {
    //   setMounted(true);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateVisibleArea = (stage: Konva.Stage, scale: number) => {
    if (!windowArea.width || !windowArea.height) {
      return;
    }

    const { x: visibleX1, y: visibleY1 } = stage?.position();
    const { x: visibleX2, y: visibleY2 } = {
      // @ts-ignore
      x: visibleX1 + windowArea.width,
      // @ts-ignore
      y: visibleY1 + windowArea.height,
    };

    const xStart = Math.floor(
      Math.max(Math.abs(visibleX1 / cellSize / scale), 0)
    );

    const yStart = Math.floor(
      Math.max(Math.abs(visibleY1 / cellSize / scale), 0)
    );

    const cellCountX = Math.round(
      (visibleX2 - visibleX1) / (cellSize + borderPX) / scale
    );

    const cellCountY = Math.round(
      (visibleY2 - visibleY1) / (cellSize + borderPX) / scale
    );

    const koefMinusX = Math.floor(
      Math.abs(stage.getAbsolutePosition().x / 1000 / scale)
    );
    const koefMinusY = Math.floor(
      Math.abs(stage.getAbsolutePosition().y / 1000 / scale)
    );
    const koefPlusX = 5;
    const koefPlusY = 5;

    const xStartWithKoef = xStart > 400 ? xStart - koefMinusX : xStart;
    const yStartWithKoef = yStart > 400 ? yStart - koefMinusY : yStart;

    const xEnd = xStart + cellCountX + koefPlusX;
    const yEnd = yStart + cellCountY + koefPlusY;

    setVisibleSegment({
      x1: xStartWithKoef,
      x2: xEnd,
      y1: yStartWithKoef,
      y2: yEnd,
    });
  };
  let lastCenter: any = null;
  let lastDist = 0;

  function getDistance(p1: { x: any; y: any }, p2: { x: any; y: any }) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCenter(p1: { x: any; y: any }, p2: { x: any; y: any }) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  // scale logic for mobile
  const handleMultiTouch = (e: any) => {
    if (isLoading || canvasesLoading) return;
    e.evt.preventDefault();

    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];
    const stage = e.target.getStage();

    if (touch1 && touch2) {
      if (stage.isDragging()) {
        stage.stopDrag();
      }

      var p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      var p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      if (!lastCenter) {
        lastCenter = getCenter(p1, p2);
        return;
      }
      var newCenter = getCenter(p1, p2);

      var dist = getDistance(p1, p2);

      if (!lastDist) {
        lastDist = dist;
      }

      // local coordinates of center point
      var pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleX(),
      };

      var distChange = Math.abs(dist - lastDist);

      // Set a threshold for distance change to avoid small fluctuations
      if (distChange > ZOOM_THRESHOLD) {
        var scale =
          dist > lastDist
            ? stage.scaleX() * (dist / lastDist) > MAX_SCALE
              ? MAX_SCALE
              : stage.scaleX() * (dist / lastDist)
            : stage.scaleX() * (dist / lastDist) < MIN_SCALE
            ? MIN_SCALE
            : stage.scaleX() * (dist / lastDist);

        stage.scaleX(scale);
        stage.scaleY(scale);

        // calculate new position of the stage
        var dx = newCenter.x - lastCenter.x;
        var dy = newCenter.y - lastCenter.y;

        var newPos = {
          x: newCenter.x - pointTo.x * scale + dx,
          y: newCenter.y - pointTo.y * scale + dy,
        };

        stage.position(newPos);
        stage.batchDraw();

        calculateVisibleArea(stage, scale);

        setNewScale(scale);

        lastDist = dist;
        lastCenter = newCenter;
      }
    }
    if (touch1 && !touch2) {
      if (stage.isDragging()) {
        stage.stopDrag();
      }

      const newCenter = {
        x: touch1.clientX,
        y: touch1.clientY,
      };

      if (!lastCenter) {
        lastCenter = newCenter;
        return;
      }

      const dx = newCenter.x - lastCenter.x;
      const dy = newCenter.y - lastCenter.y;

      const newPos = {
        x: stage.x() + dx,
        y: stage.y() + dy,
      };
      stage.position(newPos);
      stage.batchDraw();

      lastCenter = newCenter;
      calculateVisibleArea(stage, newScale);
    }
  };

  const multiTouchEnd = () => {
    setSelectedPixel(null);
    lastCenter = null;
    lastDist = 0;
  };

  const onWheelChange = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    // e
    const stage = stageRef.current?.getStage();

    if (!stage) {
      return;
    }
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x:
        Number(stage.getPointerPosition()?.x) / oldScale - stage.x() / oldScale,
      y:
        Number(stage.getPointerPosition()?.y) / oldScale - stage.y() / oldScale,
    };

    const calcScale =
      e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const newScale =
      calcScale >= maxScale
        ? maxScale
        : calcScale <= windowArea.minScale
        ? windowArea.minScale
        : calcScale;

    let scaledPointerArea = {
      x:
        -(mousePointTo.x - Number(stage.getPointerPosition()?.x) / newScale) *
        newScale,
      y:
        -(mousePointTo.y - Number(stage.getPointerPosition()?.y) / newScale) *
        newScale,
    };

    if (e.evt.deltaY > 0) {
      scaledPointerArea = {
        x:
          scaledPointerArea.x > 0
            ? 0
            : scaledPointerArea.x < -(boardSize * newScale)
            ? -(boardSize * newScale)
            : scaledPointerArea.x,
        y:
          scaledPointerArea.y > 0
            ? 0
            : scaledPointerArea.y < -(boardSize * newScale)
            ? -(boardSize * newScale)
            : scaledPointerArea.y,
      };
    }

    setStage({
      scale: newScale,
      ...scaledPointerArea,
    });
    calculateVisibleArea(stage, oldScale);
  };

  const onStageClick = (
    e: KonvaEventObject<MouseEvent | TouchEvent | Event>
  ) => {
    const relativePointerPosition = e.target.getRelativePointerPosition();

    if (e.target.attrs.id === "no-action" || isEventBlock) {
      return;
    }

    if (e.target.attrs.cellId) {
      return setSelectedPixel(e.target.attrs.cellId);
    }

    let cell = {
      x: Math.floor(Number(relativePointerPosition?.x)) + canvasCell.x,
      y: Math.floor(Number(relativePointerPosition?.y)) + canvasCell.y,
    };

    const cellId = `${cell.x}-${cell.y}`;

    if (
      cell.x >= boardSize ||
      cell.y >= boardSize ||
      cell.x < 0 ||
      cell.y < 0
    ) {
      // toast.warning(`"Incorrect cell selected." cellId:${cellId}`);
      return;
    }
    setSelectedPixel(cellId);
  };

  const onDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (!stage) {
      return;
    }
    calculateVisibleArea(stage, scale);
  };

  const calculateAllowedCanvasDragPositions = (vector: Vector2d) => {
    const minDraggableArea = {
      x: 0,
      y: 0,
    };

    const maxDraggableArea = {
      x: boardSize * (scale - 1.89) * -1,
      y: boardSize * (scale - 0.8) * -1,
    };

    const allowedCoords = {
      x:
        vector.x > minDraggableArea.x
          ? minDraggableArea.x
          : vector.x < maxDraggableArea.x
          ? maxDraggableArea.x
          : vector.x,
      y:
        vector.y > minDraggableArea.y
          ? minDraggableArea.y
          : vector.y < maxDraggableArea.y
          ? maxDraggableArea.y
          : vector.y,
    };

    return allowedCoords;
  };

  const [allowedCanvases, setAllowedCanvases] = useState<any[]>([]);

  useEffect(() => {
    const arraysAreDifferent =
      JSON.stringify(allowedCanvases) !== JSON.stringify(availbleImgsInLowRes);
    if (availbleImgsInLowRes && arraysAreDifferent) {
      setAllowedCanvases(availbleImgsInLowRes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availbleImgsInLowRes]);

  // console.log(allowedCanvases); window.innerWidth < mobileScreen ? centerForMobile : position.y

  const dragEnabled = scale !== minScale && !selectedCell;

  const centerForMobile = 115;

  const mobileScreen = 768;

  const lengthToBorder = window.innerWidth < mobileScreen ? 2000 : boardSize;

  const imageParams = window.innerWidth < mobileScreen ? 2000 : 1000;

  const [boolObj, setBoolObj] = useState<any>();

  type Point = { x: number; y: number };

  function arrayToObject(points: Point[]): { [key: string]: boolean } {
    const result: { [key: string]: boolean } = {};

    points.forEach((point) => {
      const key = `${point.x}-${point.y}`;
      result[key] = false;
    });

    return result;
  }

  type Data = { key: string; value: boolean };

  const updateState = ({ key, value }: Data) => {
    if (!boolObj[key]) {
      setBoolObj((prev: any) => ({ ...prev, [key]: value }));
    }
  };

  const checkAllTrue = (obj: any) => {
    if (obj && Object.keys(obj).length === 0) {
      return false;
    }

    for (const key in obj) {
      if (!obj[key]) {
        return false;
      }
    }
    return true;
  };

  // console.log(checkAllTrue(boolObj))

  // console.log("update state", boolObj);

  useEffect(() => {
    const res = arrayToObject(allowedCanvases);
    setBoolObj(res);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedCanvases]);

  return (
    <div
      ref={containerRef}
      className="absolute mt-[80px] max-h-[calc(100vh-80px) z-[19] inset-0 h-full w-full "
      style={
        scale >= 6 || newScale > 2
          ? { backgroundColor: "white" }
          : { backgroundColor: "rgb(243, 244, 246, 1)" }
      }
    >
      <Stage
        id="stage"
        className="cursor-pointer z-50 absolute"
        ref={stageRef}
        width={windowArea.width}
        height={windowArea.height}
        x={position.x}
        y={window.innerWidth < mobileScreen ? centerForMobile : position.y}
        onWheel={onWheelChange}
        onDragEnd={onDragEnd}
        onMouseDown={(e) => {
          // just double click handle
          e.evt.stopPropagation();
          if (e.evt.detail === 2) {
            onStageClick(e);
          }
        }}
        onTouchMove={handleMultiTouch}
        onTouchEnd={multiTouchEnd}
        onDblTap={(e) => {
          e.evt.stopPropagation();
          if (!isEventBlock) {
            onStageClick(e);
          }
        }}
        scaleX={scale}
        scaleY={scale}
        draggable={dragEnabled}
        dragBoundFunc={calculateAllowedCanvasDragPositions}
        offsetX={-0.28}
        offsetY={-0.28}
      >
        <Layer>
          {/* lines on grid, important for zoom on mobile */}
          <GridLinesLayout />

          {!checkAllowedHiRes(visibleSegmentCoords) && (
            <Image
              key={`board-img`}
              opacity={0.8}
              x={0}
              y={0}
              width={1000}
              height={1000}
              image={fullPxImage}
              alt=""
            />
          )}

          {(checkAllowedLowRes(visibleSegmentCoords) ||
            (allowedCanvases && allowedCanvases.length > 0)) &&
            allowedCanvases?.map(
              (item: { x: number; y: number }, key: number) => (
                <CanvasVisibleBoard
                  key={key}
                  x={item.x}
                  y={item.y}
                  updateState={updateState}
                />
              )
            )}

          {checkAllowedHiRes(visibleSegmentCoords) &&
            !checkAllowedLowRes(visibleSegmentCoords) && <CanvasVisibleCells />}

          {selectedCell && (
            <Line
              // strokeEnabled
              strokeWidth={0.02}
              closed
              points={[
                selectedCell.x,
                selectedCell.y,
                selectedCell.x + cellSize,
                selectedCell.y,
                selectedCell.x + cellSize,
                selectedCell.y + cellSize,
                selectedCell.x,
                selectedCell.y + cellSize,
                selectedCell.x,
                selectedCell.y,
              ]}
              stroke={"rgb(37 99 235 / 1)"}
            />
          )}
          {/* Border on canvas */}
          <Line
            id="no-action"
            strokeWidth={0.2}
            closed={false}
            points={[
              0 - 0.2,
              0 - 0.2,
              0 + 0.2 + lengthToBorder,
              0 - 0.2,
              0 + 0.2 + lengthToBorder,
              0 + 0.2 + lengthToBorder,
              0 - 0.2,
              0 + 0.2 + lengthToBorder,
              0 - 0.2,
              0 - 0.3,
            ]}
            stroke={"rgb(0 0 0 / 0.5)"}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasStage;
