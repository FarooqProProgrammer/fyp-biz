import { Request, Response } from "express";
import ServiceModel from "../models/service.model";

export const createService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { serviceName } = req.body;
        const userId = req.user?.id;

        const service = new ServiceModel({ serviceName ,userId })

        await service.save();
        res.status(200).json({ message: true, serviceName })

    } catch (error) {
        res.status(200).json({ message: false, error })

    }
}


export const updateService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { serviceName } = req.body;

        // Find service by ID and update it
        const updatedService = await ServiceModel.findByIdAndUpdate(
            id, 
            { serviceName }, 
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            res.status(404).json({ message: false, error: "Service not found" });
            return;
        }

        res.status(200).json({ message: true, service: updatedService });
    } catch (error) {
        res.status(500).json({ message: false, error: error });
    }
};


export const getAllService = async (req: Request, res: Response): Promise<void> => {
    try {

        const userId = req.user?.id;



            const service = await ServiceModel.find({ userId:userId });
            res.status(200).json({ message: true, service })

    } catch (error) {
        res.status(200).json({ message: true, error })

    }
}


export const deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const service = await ServiceModel.findById(id);

        if (!service) {
            res.status(404).json({ message: false, error: "Service not found" });
            return;
        }

        await service.deleteOne();
        res.status(200).json({ message: true, id });
    } catch (error) {
        res.status(500).json({ message: false, error: error });
    }
};