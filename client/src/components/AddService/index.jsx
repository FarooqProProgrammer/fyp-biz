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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "../ui/input";
import { useCreateServiceMutation } from "@/redux/services/apiSlice";
import { toast } from "@/hooks/use-toast";

const AddService = () => {
  const { register, handleSubmit, reset } = useForm();
  const [open, setOpen] = useState(false);
  const [createService, { isLoading }] = useCreateServiceMutation();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    // Uncomment the next lines when API integration is needed
    const response = await createService(data);
    console.log("API Response:", response);

    reset(); // Reset form fields
    setOpen(false); // Close dialog
    toast({
      title: "Service Added",
      description: "The service has been successfully added.",
    });
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
              Fill out the details below to add a new service.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Name
              </label>
              <Input
                type="text"
                placeholder="Enter service name"
                {...register("serviceName", { required: true })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                placeholder="Enter service description"
                {...register("description", { required: true })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddService;
