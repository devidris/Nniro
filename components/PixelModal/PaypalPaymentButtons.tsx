"use client";
import { PixelCell } from "#/context/PixelBoardContext";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import React from "react";
import Spinner from "../UI/Spinner";

type PaypalPaymentButtonsProps = {
  cellId: string;
  onSuccess: (order: any) => void;
  handler: (order: any) => void;
};

export const PAYPAL_CELL_PRICE_USD = "1.99";
const PAYPAL_CELL_CURRENCY = "USD";

const PaypalPaymentButtons = ({
  cellId,
  onSuccess,
  handler,
}: PaypalPaymentButtonsProps) => {
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

  return (
    <>
      {isPending ? (
        // <Spinner />
        <></>
      ) : (
        <PayPalButtons
          style={{
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 50,
          }}
          fundingSource="paypal"
          createOrder={async (data, actions) => {
            // console.log("createOrder", data, actions);
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: PAYPAL_CELL_CURRENCY,
                    value: PAYPAL_CELL_PRICE_USD,
                    breakdown: {
                      item_total: {
                        currency_code: PAYPAL_CELL_CURRENCY,
                        value: PAYPAL_CELL_PRICE_USD,
                      },
                    },
                  },
                  custom_id: cellId,
                  items: [
                    {
                      name: cellId,
                      description: cellId,
                      sku: cellId,
                      unit_amount: {
                        currency_code: PAYPAL_CELL_CURRENCY,
                        value: PAYPAL_CELL_PRICE_USD,
                      },
                      quantity: "1",
                    },
                  ],
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            const order = await actions.order?.capture();
            if (order?.status === "COMPLETED") {
              return onSuccess(data);
            }
            return handler(order);
          }}
        />
      )}
    </>
  );
};

export default PaypalPaymentButtons;
