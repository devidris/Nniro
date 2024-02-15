import {
    PaymentElement,
} from '@stripe/react-stripe-js'
import { useState } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../UI/Button';
import Spinner from '../UI/Spinner';
import { toast } from 'react-toastify';

const StripeCheckout: React.FC<{ onSuccess: (order: any) => void }> = ({ onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    //   @ts-ignore
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error('Script is not loaded yet.')
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}`,
            },
            redirect: "if_required"
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        
        if (error) {
            // @ts-ignore
            // setMessage(error.message);
            toast.error(error.message)
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success('Payment success.')
            onSuccess(paymentIntent)
        } else {
            toast.error('An unexpected error occured.')
        }

        setIsLoading(false);
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={{ layout: "accordion" }} />

            <Button disabled={isLoading || !stripe || !elements} id="submit" className='my-4'>
                <span id="button-text" className='flex items-center gap-2 justify-center'>
                    {isLoading ? (
                            <>
                                <Spinner />
                                <span>
                                    Processing...
                                </span>
                            </>
                        ) : "Pay now"}
                </span>
            </Button>
        </form>
    )
}

export default StripeCheckout