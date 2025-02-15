import { Request, Response } from "express";
import ServiceModel from "../models/service.model";

export const createService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { serviceName } = req.body;

        const service = new ServiceModel({ serviceName })

        await service.save();
        res.status(200).json({ message: true, serviceName })

    } catch (error) {
        res.status(200).json({ message: false, error })

    }
}