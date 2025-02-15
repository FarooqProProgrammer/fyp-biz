import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateServiceMutation } from "@/redux/services/apiSlice";
import { toast } from "@/hooks/use-toast";

const UpdateService = ({ open, onClose, service }) => {
  const [serviceName, setServiceName] = useState(service?.serviceName || "");
  const [updateService, { isLoading }] = useUpdateServiceMutation();

  useEffect(() => {
    setServiceName(service?.serviceName || "");
  }, [service]);

  const handleUpdate = async () => {
    try {
      await updateService({
        data: { serviceName: serviceName },
        id: service.id,
      }).unwrap();
      toast({ title: "Service Updated", description: "Success" });
      onClose(); // Close modal after success
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Update Service</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Enter service name"
          />
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateService;
