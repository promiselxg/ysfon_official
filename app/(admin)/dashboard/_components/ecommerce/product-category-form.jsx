"use client";
import React, { useEffect, useState } from "react";
import FormWrapper from "./form-wrapper";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useFormData } from "@/context/form.context";
import { getProductCategories } from "@/service/ecommerce/productService";
import { capitalizeFirstLetter } from "@/lib/utils/regExpression";

const formSchema = z.object({
  product_category: z.string(),
});

const ProductCategoryForm = () => {
  const { formData, updateFormData, formErrors } = useFormData();
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_category: formData.product_category || "",
    },
  });

  useEffect(() => {
    form.reset({ product_category: formData.product_category || "" });
  }, [form, formData, form.reset]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData({ product_category: value.product_category });
    });

    return () => subscription.unsubscribe();
  }, [form, form.watch, updateFormData]);

  const fetchProductCategories = async () => {
    try {
      const response = await getProductCategories();
      setProductCategories(response.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCategories();
  }, []);
  return (
    <>
      <FormWrapper title="Product Category" label="Select product category">
        <Form {...form}>
          <FormField
            control={form.control}
            name="product_category"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger disabled={loading}>
                      <SelectValue placeholder="Select product category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productCategories?.map((category) => (
                      <SelectItem value={category?.id} key={category?.id}>
                        {capitalizeFirstLetter(category?.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage>
                  {formErrors
                    .filter((error) => error.path === "product_category")
                    .map((error, index) => (
                      <span key={index}>{error.message}</span>
                    ))}
                </FormMessage>
              </FormItem>
            )}
          />
        </Form>
      </FormWrapper>
    </>
  );
};

export default ProductCategoryForm;
