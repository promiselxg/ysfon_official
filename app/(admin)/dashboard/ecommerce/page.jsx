import React from "react";
import DashboardHeader from "../_components/dashboard/header";
import ProductsTablePage from "@/components/ecommerce/table/products/product-table";

export const metadata = {
  title: "Admin Dashboard | Products",
  description: "Generated by create next app",
};

const EcommercePage = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Ecommerce" },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="p-6 bg-[whitesmoke] min-h-screen space-y-4">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Products</h1>
            </div>
          </div>
          <ProductsTablePage />
        </div>
      </div>
    </>
  );
};

export default EcommercePage;
