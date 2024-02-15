// 'use client'
// import { Roboto } from 'next/font/google'
import Header from '#/components/Header'
import { SessionProvider } from "next-auth/react"
import { ToastContainer } from "react-toastify";
import Providers from './providers'
import { Metadata, Viewport } from 'next';
// const inter = Roboto({ weight: ["500", "700"], subsets: ["latin", "cyrillic"] })
import localFont from 'next/font/local'

import "react-toastify/dist/ReactToastify.css";
import 'react-advanced-cropper/dist/style.css';
import './globals.css'

const gdSherpaFont = localFont({
  src: [
    {
      path: './GD-Sherpa-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './GD-Sherpa-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './GD-Sherpa-Bold.woff2',
      weight: '700',
      style: 'normal',
    },

  ],
})


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}


export const metadata: Metadata = {
  metadataBase:   new URL('https://nniro.com/'),
  title: "Nniro",
  description: `Discover a unique digital canvas on Nniro.com where creativity meets opportunity. Own a piece of a million-pixel masterpiece, customize your pixel with personal images, and be part of an evolving online museum. Join the new wave of digital real estate today!`,
  keywords: ['images', 'museum', 'canvas', 'pixel', 'personal images'],
  robots: "index, follow",
  openGraph: {
    title: 'Nniro',
    description: 'Discover a unique digital canvas on Nniro.com where creativity meets opportunity. Own a piece of a million-pixel masterpiece, customize your pixel with personal images, and be part of an evolving online museum. Join the new wave of digital real estate today!',
    images: '/logo.png'
  }
}


export default function RootLayout({
  children,
  parallel
}: {
  children: React.ReactNode,
  parallel: React.ReactNode,
}) {
  return (
    <html lang="en">
      <body className={gdSherpaFont.className}>
        <SessionProvider >
          <Providers>

            <div className='flex flex-col flex-grow relative '>
              <div className='top-0 sticky w-full z-[100] bg-gray-800'>
                <Header />
              </div>
              <div className='flex-grow mx-auto min-h-[calc(100vh-80px)]'>
                {children}
              </div>
              {parallel}
            </div>
            <div id="portal"></div>

            <ToastContainer
              position="bottom-right"
              autoClose={8000}
              hideProgressBar={false}
              newestOnTop={false}
              draggable={false}
              // pauseOnVisibilityChange
              closeOnClick
              pauseOnHover
            />
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
