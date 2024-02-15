"use client";
import { PixelCell } from "#/context/PixelBoardContext";
import axiosInstance from "#/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

type usePixelArg = {
  x?: number;
  y?: number;
};

export type PixelResponse = {
  pixel: {
    position: string;
    user_id: string;
    icon?: string;
    main_color?: string;
  };
  free: boolean;
};

function usePixel({ x, y }: usePixelArg) {
  return useQuery<PixelResponse, any, PixelCell>({
    queryKey: [`${y}-${x}`],
    queryFn: async () => {
      const resp = await axiosInstance.get("/pixel", {
        params: {
          i: y,
          j: x,
        },
      });
      return resp.data;
    },

    select: (data) => {
      const cellData: PixelCell = {
        id: `${x}-${y}`,
        x: Number(x),
        y: Number(y),
        userId: data?.pixel?.user_id,
        free: data?.free,
        image: data?.pixel?.icon,
        color: data?.pixel?.main_color,
      };
      return cellData;
    },
    enabled: typeof x === "number" && typeof y === "number",
  });
}

export default usePixel;
