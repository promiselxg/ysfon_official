import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatCurrency } from "@/lib/utils/formatCurrency";

const CartPriceSummary = ({ subtotal, isValid, router, invalidItems }) => {
  return (
    <>
      <div className="w-full md:w-[30%] bg-white h-fit shadow-sm border border-[#eee] sticky top-[100px]">
        <div className="p-3 border-b-[1px] border-[#eee] flex items-center w-full">
          <h1 className="font-euclid text-[16px] font-[400]">CART SUMMARY</h1>
        </div>
        <div className="w-full flex justify-between p-3 border-b-[1px] border-[#eee]">
          <span>Subtotal</span>
          <span className="font-[600]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="w-full flex gap-3 my-3 px-3">
          <Input placeholder="coupon code" />
          <Button className="text-sm font-light bg-[--app-primary-color]">
            Apply
          </Button>
        </div>
        <div className="w-full my-3 px-3">
          <Button
            disabled={!isValid}
            onClick={() => router.push("/store/checkout")}
            className="w-full bg-[--app-bg-red] shadow-md flex items-center justify-center gap-2 py-3 rounded text-white disabled:cursor-not-allowed"
          >
            {!isValid ? (
              <span className="text-xs text-white">
                You have {invalidItems.length} item
                {invalidItems.length > 1 ? "s" : ""} out of stock.
              </span>
            ) : (
              <>
                Checkout
                <span className="font-semibold">
                  ({formatCurrency(subtotal)})
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CartPriceSummary;
