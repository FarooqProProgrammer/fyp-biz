import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { useGetAllCustomerQuery } from "@/redux/services/customerApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCreateInvoiceMutation } from "@/redux/services/invoice";
import { useSession } from "next-auth/react";

const AddInvoice = () => {
  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      clientName: "",
      invoiceDate: new Date(),
      invoiceNumber: "",
      items: [{ description: "", quantity: 1, price: 0 }],
    },
  });

  const { data } = useGetAllCustomerQuery();

  useEffect(() => {
    console.log(data);
  }, [data]);

  const { fields, append } = useFieldArray({
    control,
    name: "items",
  });

  const date = watch("invoiceDate");
  const items = watch("items");

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const session = useSession();

  const onSubmit = async (formData) => {
    console.log("Invoice Data:", formData);

    const data = {
      invoiceAmount: calculateTotal().toFixed(2),
      ...formData,
    };

    const response = await createInvoice({data,token:session?.user?.token});
    console.log(response)
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Generate New Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          {/* Client Information */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Client Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <Select onValueChange={(value) => setValue("clientId", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {data?.map((item, index) => (
                    <SelectItem key={index} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => setValue("invoiceDate", newDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  {...register("invoiceNumber")}
                  placeholder="INV-001"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Items</h3>
            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <Input
                    placeholder="Item description"
                    {...register(`items.${index}.description`)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Quantity"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Price"
                    {...register(`items.${index}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ description: "", quantity: 1, price: 0 })}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-semibold text-lg">Total Amount:</span>
            <span className="text-xl font-bold">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Generate Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvoice;
