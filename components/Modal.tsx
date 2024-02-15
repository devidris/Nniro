'use client'
import React, { PropsWithChildren } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { createPortal } from 'react-dom'


type Props = {
    title?: string
    onClose?: () => void
    isOpen: boolean
}

const Modal: React.FC<Props & PropsWithChildren> = ({ title, children, onClose, isOpen }) => {
    const ref = React.useRef<Element | null>(null)
    const [mounted, setMounted] = React.useState(false)
    
    React.useEffect(() => {
        ref.current = document.querySelector<HTMLElement>("#portal")
        setMounted(true)
    }, [])
    return (mounted && ref.current && isOpen) ? createPortal(
        <div className='relative select-none'>
            <div className='fixed w-full h-full inset-0 flex bg-black opacity-50 z-[150]' />
            <div
                id="authentication-modal"
                tabIndex={-1}
                aria-hidden="false"
                className="mx-auto flex-grow fixed top-[40%] translate-y-[-50%] z-[151] justify-center items-center w-full ma inset-0 px-2"
            >
                <div className="relative w-full max-w-md mx-auto max-h-full">
                    <div className="relative rounded-lg shadow bg-gray-100">
                        <div className="flex items-center justify-between px-4 py-2 border-b rounded-t border-gray-200">
                            <h3 className="text-xl font-medium text-black">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                type="button"
                                className="text-black bg-transparent hover:bg-black hover:text-white rounded-md text-sm w-10 h-10 ms-auto inline-flex justify-center items-center" data-modal-hide="small-modal"
                            >
                                <XMarkIcon className='w-6 h-6' />
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[500px] sm:max-h-[700px]">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    , ref.current) : null
}

export default Modal