import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useCreateServiceMutation } from "@/redux/services/apiSlice";

const AddService = () => {
  const { register, handleSubmit, reset } = useForm();
  const [open, setOpen] = useState(false);



  const [createService,{ isLoading }] = useCreateServiceMutation();

  const onSubmit = async (data) => {

    const response = await createService(data)
    console.log("Form Data:", data);
    reset(); // Reset form fields
    setOpen(false); // Close dialog
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>Add Service</Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add a New Service</DialogTitle>
            <DialogDescription>
              <form onSubmit={handleSubmit(onSubmit)} className="grid w-full max-w-sm gap-2">
                <div>
                  <Label htmlFor="service">Service Name</Label>
                  <Input type="text" id="service" placeholder="Service Name" {...register("serviceName")} />
                </div>
                <Button type="submit" className="mt-2">Submit</Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddService;
