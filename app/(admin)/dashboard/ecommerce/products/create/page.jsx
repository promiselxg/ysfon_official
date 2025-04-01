import React from "react";
import DashboardHeader from "../../../_components/dashboard/header";
import ProductTitleForm from "../../../_components/ecommerce/product-title-form";
import ProductDescriptionForm from "../../../_components/ecommerce/product-description-form";
import ProductImageUploadForm from "../../../_components/ecommerce/product-image-upload-form";
import ProductPriceForm from "../../../_components/ecommerce/product-price-form";
import ProductCategoryForm from "../../../_components/ecommerce/product-category-form";
import ProductTagForm from "../../../_components/ecommerce/product-tag-form";
import ProductBriefDescriptionForm from "../../../_components/ecommerce/product-brief-description-form";
import ProductManufacturerForm from "../../../_components/ecommerce/product-manufacture-form";
import ProductStockForm from "../../../_components/ecommerce/product-stock-form";
import ProductDiscountForm from "../../../_components/ecommerce/product-discount-form";
import ProductVarientForm from "../../../_components/ecommerce/product-variant-form";
import ProductSubmitButton from "../../../_components/ecommerce/product-submit-button";

const AddProduct = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Ecommerce", href: "/dashboard/ecommerce" },
    { name: "Products", href: "/dashboard/ecommerce/products" },
    { name: "Add new product" },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="p-6 bg-[whitesmoke] space-y-4">
        <h1 className="font-bold text-[20px]">Add Product</h1>
        <div className="w-full flex md:flex-row flex-col gap-5 justify-between">
          <div className="w-full md:w-2/3 space-y-5  h-fit ">
            <ProductTitleForm />
            <ProductDescriptionForm />
            <ProductImageUploadForm />
            <ProductVarientForm />
            <div className="hidden md:flex justify-end pb-7">
              <ProductSubmitButton />
            </div>
          </div>
          <div className="w-full md:w-2/6 h-fit space-y-5">
            <ProductPriceForm />
            <ProductStockForm />
            <ProductCategoryForm />
            <ProductTagForm />
            <ProductBriefDescriptionForm />
            <ProductManufacturerForm />
            <ProductDiscountForm />
            <div className="flex md:hidden justify-end pb-7">
              <ProductSubmitButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
