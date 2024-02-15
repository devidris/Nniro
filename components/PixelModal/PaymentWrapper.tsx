'use client'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import React, { PropsWithChildren } from 'react'


const PaymentWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                currency: "USD",
                components: "applepay,buttons",
            }}
            deferLoading={false}
        >
            {children}
        </PayPalScriptProvider>
    )
}

export default PaymentWrapper