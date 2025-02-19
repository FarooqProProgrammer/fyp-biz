import mongoose, { Document, Schema, Model } from "mongoose";



const ServiceSchema = new mongoose.Schema(
    {
        serviceName : {
            type: String,
            required:true
        },
        description:{
            type: String,
            required:true
        },
         userId: mongoose.Types.ObjectId
    },
    {
        timestamps: true
    }
)

const ServiceModel = mongoose.model("Service",ServiceSchema)
export default ServiceModel