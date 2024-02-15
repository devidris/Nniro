"use client";
import { PixelCell } from "#/context/PixelBoardContext";
import React from "react";
import { PAYPAL_CELL_PRICE_USD } from "./PaypalPaymentButtons";
import { useSearchParams } from "next/navigation";

type PixelInfoProps = {
  data: PixelCell;
  isOwner: boolean;
};

const PixelInfo = ({ data, isOwner }: PixelInfoProps) => {
  const params = useSearchParams();

  const debug = params.get("debug");

  return (
    <>
      <ul className="text-black flex flex-col gap-4">
        <li className="flex justify-between">
          <span className="font-bold">Availability</span>
          <div className="text-sm">
            {data?.userId ? (isOwner ? "Owned by You" : "Sold") : "Available"}
          </div>
        </li>
        {/* TODO: remove coords when finish */}
        {debug && (
          <li className="flex justify-between">
            <span className="font-bold">Coords</span>
            <div className="text-sm">{JSON.stringify(data.id)}</div>
          </li>
        )}

        <li className="flex justify-between">
          <span className="font-bold">Price</span>
          <div className="text-sm">{`$ ${PAYPAL_CELL_PRICE_USD}`}</div>
        </li>
        {/* <li className="flex justify-between">
        <span className="font-bold">Color</span>
        <div className="text-sm">
        {data.color ? (
          <span className='w-[20px] h-[20px] rounded-sm block' style={{ background: `rgb(${data.color.split(' ').join(',')})` }} />
          ) : "-"}
          </div>
        </li> */}
      </ul>
    </>
  );
};

export default PixelInfo;
