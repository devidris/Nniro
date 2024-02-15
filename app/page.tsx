"use client";
import PixelModal from "#/components/PixelModal/PixelModal";
// import SelectedCellModal from "#/components/SelectedCellModal";
import Spinner from "#/components/UI/Spinner";
import { PixelContextProvider, usePixelContext } from "#/context/PixelBoardContext";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import dynamic from "next/dynamic";
import { Metadata } from 'next'
import { useServerLog } from "#/hooks";


const NoSSRCanvasGrid = dynamic(
  () => import("#/components/Canvas/Canvas"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        {/* <Spinner /> */}
      </div>
    )
  }
);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '');

const PixelModalC = () => {
  const { selected, setSelectedPixel } = usePixelContext()
  const { sl } = useServerLog()

  // sl(`update: PixelModalC ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} selected ${selected}`)

  if (!selected) {
    return null
  }

  return <PixelModal canvasCell={selected} onClose={() => setSelectedPixel(null)} isOpen={!!selected} />
}


export default function PixelBoardPage() {
  return (
    <PixelContextProvider>
      <Elements stripe={stripePromise} >
        <PixelModalC />
      </Elements>
      <NoSSRCanvasGrid />
    </PixelContextProvider>
  );
}
