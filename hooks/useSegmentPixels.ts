"use client";
import { PixelCell } from "#/context/PixelBoardContext";
import axiosInstance from "#/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type useSegmentPixelsArg = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  zoomedOut?: boolean;
  rectangles?: any;
  enabled?: boolean;
};

export type PixelsResponse = {
  pixels: {
    position: string;
    user_id: string;
    icon?: string;
    main_color?: string;
  }[];
};

function useSegmentPixels({
  x1,
  y1,
  x2,
  y2,
  zoomedOut,
  rectangles,
  enabled,
}: useSegmentPixelsArg) {
  const [response, setResponse] = useState<any>();
  var resp: any[];
  var temp: any;
  return useQuery<PixelCell[]>({
    initialData: [],
    queryKey: ["board-segment", { x1, y1, x2, y2 }],
    queryFn: async () => {
      if (!zoomedOut) {
        resp = (
          await axiosInstance.get<PixelsResponse>("/pixels", {
            params: {
              startI: y1,
              endI: y2 > 1000 ? 1000 : y2,

              startJ: x1,
              endJ: x2 > 1000 ? 1000 : x2,
            },
          })
        ).data.pixels;
      } else {
        temp = await Promise.all(
          rectangles.map(async (item: any) => {
            const response = await axiosInstance.get<PixelsResponse>(
              "/pixels",
              {
                params: {
                  startI: item.y1,
                  endI: item.y2 > 1000 ? 1000 : item.y2,
                  startJ: item.x1,
                  endJ: item.x2 > 1000 ? 1000 : item.x2,
                },
              }
            );
            return response.data.pixels;
          })
        );
        resp = temp.flat()
      }
      const boardPixels = resp.map((pixel: any) => {
        const [y, x] = pixel.position.split(" ");

        return {
          userId: pixel.user_id,
          x: Number(x),
          y: Number(y),
          image: pixel.icon,
          color: pixel.main_color,
          id: `${x}-${y}`,
        };
      });
      // console.log(boardPixels,resp.data.pixels);

      return boardPixels;
    },
    enabled,
  });
}

export default useSegmentPixels;
