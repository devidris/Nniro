"use client";
import { useSearchParams } from "next/navigation";
// import Konva from "konva";
import { Line, Group, Image } from "react-konva";

const cellPX = 1;
const borderPX = 0.01;
const maxPixels = 1000;


const GridLinesLayout = ({ }) => {
  // const [image] = useImage("https://fakeimg.pl/2000x2000/?text=1000-1000&font=lobster");
  // to hide the lines on grid change stroke to 0, without that component zoom on mobile will not work

  const params = useSearchParams();

  const debug = params.get("debug");
  return (
    <>
      {new Array(1001).fill(0).map((v, i) => {
        const x = i === 0 ? 0 : (i - borderPX) * cellPX;
        return (
          <Group key={i}>
            {/* line to bottom */}
            <Line
              key={`${i}-col`}
              strokeWidth={borderPX}
              closed
              points={[
                x + borderPX,
                0,
                x + borderPX,
                cellPX * maxPixels,
              ]}
              // points={[x + borderPX, 0, x + borderPX, cellPX * maxPixels]}
              stroke={"rgba(0,0,0,0)"}
            />
            {/* line to right */}
            <Line
              key={`${i}-row`}
              strokeWidth={borderPX}
              closed
              points={[
                0,
                x + borderPX,
                cellPX * maxPixels,
                x + borderPX,
              ]}
              // points={[0, x + borderPX, cellPX * maxPixels, x + borderPX]}
              stroke={"rgba(0,0,0,0)"}
            />
          </Group>
        );
      })}
    </>
  );
};

export default GridLinesLayout;
