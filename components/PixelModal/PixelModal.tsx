"use client";
import { PixelCell } from "#/context/PixelBoardContext";
import React, { useMemo, useState } from "react";
import Modal from "../Modal";
import Link from "next/link";
import Button from "../UI/Button";
import PaypalPaymentButtons from "./PaypalPaymentButtons";
import { useSession } from "next-auth/react";
import usePixel from "#/hooks/usePixel";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "#/hooks/useAuthAxios";
import PixelInfo from "./PixelInfo";
import Spinner from "../UI/Spinner";
import StripePayment from "./StripePayment";
import { toast } from "react-toastify";
import PaymentWrapper from "./PaymentWrapper";
import PixelImage from "./PixelImage";
import { useServerLog } from "#/hooks";

type PixelModalProps = {
  canvasCell: PixelCell;
  onClose: () => void;
  isOpen: boolean;
};

function PixelModal({ onClose, isOpen, canvasCell: cell }: PixelModalProps) {
  // const [cellImage, setImage] = useState<File | null>(null);
  const session = useSession();
  const { sl } = useServerLog();

  const [error, setError] = useState("");
  const isLoggedIn = session.status === "authenticated";
  const loggedInUserId = session.data?.user.userId;
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data, isFetching: isLoading } = usePixel({ x: cell.x, y: cell.y });

  const onBuy = async (order: any) => {
    try {
      await axiosAuth.post("/pixel/buy", {
        i: cell.y,
        j: cell.x,
        order,
      });
      toast.success("Success Bought");
      await queryClient.invalidateQueries({ queryKey: ["board-segment"] });
      await queryClient.invalidateQueries({
        queryKey: [`${cell.y}-${cell.x}`],
      });
    } catch (error: any) {
      console.log("onBuy", error);
      toast.error(error?.response?.data?.message ?? "Something went wrong.");
    }
  };
  const isOwner = loggedInUserId === data?.userId;

  //   const MemoImage = useMemo(() => (<PixelImage
  //   uploadedImage={data?.image}
  //   isOwner={isOwner}
  //   showSelect={isOwner && !data?.image}
  //   showUpload={isOwner && !data?.image}
  //   cell={cell}
  // />), [data?.image])

  sl(
    `pixel modal ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
  );

  return (
    <Modal title="Pixel" isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <div className="mb-5">
          {!isLoading && data ? (
            <>
              <PixelImage
                uploadedImage={data?.image}
                isOwner={isOwner}
                showSelect={isOwner && !data?.image}
                showUpload={isOwner && !data?.image}
                cell={cell}
              />
              <PixelInfo data={data} isOwner={isOwner} />
            </>
          ) : (
            <div className="flex items-center justify-center">
              {/* <Spinner /> */}
            </div>
          )}
        </div>

        {error && (
          <div className="my-4">
            <div className=" text-red-900 bg-red-300 rounded-lg p-2 text-sm font-bold">
              {error}
            </div>
          </div>
        )}

        {isLoggedIn ? (
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto overflow-x-hidden">
            {!isLoading && !data?.userId && !isOwner && (
              <PaymentWrapper>
                <StripePayment onSuccess={onBuy} />

                <PaypalPaymentButtons
                  onSuccess={onBuy}
                  handler={(order) =>
                    setError(`Unhandled status, [${order.status}].`)
                  }
                  cellId={cell.id}
                />
              </PaymentWrapper>
            )}
            {/* {isOwner && !data?.image && (
              <Button
                onClick={onUpload}
                disabled={!cellImage || isLoadingUpload}
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
            )} */}
          </div>
        ) : (
          <Link href={"/login"}>
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </Modal>
  );
}

export default PixelModal;
