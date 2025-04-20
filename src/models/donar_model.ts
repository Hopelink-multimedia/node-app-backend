import mongoose, { Document, Schema } from "mongoose";

export interface IDonor extends Document {
    userId: string;
    fullName: string;
    dateOfBirth: string; // store as string or Date
    age: number;
    gender: 'Male' | 'Female';
    phoneNumber: string;
    emailAddress: string;
    address: string;
    bloodGroup: string;
    height: string;
    weight: string;
    hasMedicalConditions: boolean;
    medicalConditionDetails?: string;
    onMedication: boolean;
    medicationDetails?: string;
    donationType: 'Organ Donation' | 'Blood Donation';
    organsToDonate?: string[];
    createdAt: Date;
}

const DonorSchema: Schema = new Schema<IDonor>({
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    address: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    height: { type: String, required: true },
    weight: { type: String, required: true },
    hasMedicalConditions: { type: Boolean, required: true },
    medicalConditionDetails: { type: String },
    onMedication: { type: Boolean, required: true },
    medicationDetails: { type: String },
    donationType: { type: String, enum: ['Organ Donation', 'Blood Donation'], required: true },
    organsToDonate: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const Donor = mongoose.model<IDonor>('Donor', DonorSchema);
export default Donor;
