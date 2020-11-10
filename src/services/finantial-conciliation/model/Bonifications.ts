import mongoose, { Schema, Document } from "mongoose";

interface IBonifications extends Document {
    title: string;
    createdAt: string;
    value: number;
    bonificationId: string;
    affiliateId: string;
    organizationId: string;
    isPaid: boolean;
}

const BonificationSchema = new Schema<IBonifications>({
    title: { type: String, required: true },
    createdAt: { type: String, required: true },
    value: { type: Number, required: true },
    bonificationId: { type: String, required: true },
    affiliateId: { type: String, required: true },
    organizationId: { type: String, required: true },
    isPaid: { type: Boolean, required: true },
});

export default mongoose.model<IBonifications>(
    "Bonification",
    BonificationSchema,
    "Bonifications"
);
