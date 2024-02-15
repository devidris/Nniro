'use client'
import useAxiosAuth from '#/hooks/useAuthAxios';
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect } from 'react'
import StripeCheckout from './StripeCheckout';
import Button from '../UI/Button';
import { XMarkIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify';
type Props = {
    onSuccess: (order: any) => void
}

function StripePayment({ onSuccess }: Props) {
    // const stripe = useStripe();
    // const elements = useElements();
    const [isOpen, setOpen] = React.useState(false)
    const [message, setMessage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [clientSecret, setClientSecret] = React.useState(null);
    const [stripePromise, setStripePromise] = React.useState<any>(null)
    const axiosAuth = useAxiosAuth()

    useEffect(() => {
        setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || ""))
    }, [])

    const createIntent = async () => {
        axiosAuth.post(
            '/pixels/create-intent',
            {
                // paymentMethodType: ['card', 'customer_balance', 'p24'],
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true
                }
            }
        ).then(({ data }) => {
            if (!data.secret) {
                toast.error('Something went wrong')
            } else {
                setClientSecret(data.secret)
                setOpen(true)
            }
        })
    }


    return (
        <div className='relative'>

            {isOpen ? (
                <div className='relative'>
                    <div className='absolute top-3 right-3 z-[9999999]'>
                        <button onClick={() => setOpen(false)} className='text-black hover:text-[#2f303c] w-5 h-5'>
                            <XMarkIcon className='fill-current w-full h-full' />
                        </button>
                    </div>
                    {(clientSecret && stripePromise) && (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripeCheckout onSuccess={onSuccess} />
                        </Elements>
                    )}
                </div>
            ) : (
                <Button onClick={createIntent} className='mb-3'>
                    Debit Card / Apple Pay
                </Button>
            )}
        </div>
    )
}

export default StripePayment
