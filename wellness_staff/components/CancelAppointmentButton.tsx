'use client';

import { XCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cancelAppointment } from "@/app/actions/appointments";

type CancelAppointmentProps = {
    appointmentId: string;
};

export default function CancelAppointmentButton({ appointmentId }: CancelAppointmentProps) {
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;
        setIsCancelling(true);
        const res = await cancelAppointment(appointmentId);
        if (res.success) {
            toast.success("Appointment cancelled successfully");
        } else {
            toast.error(res.error || "Failed to cancel appointment");
        }
        setIsCancelling(false);
    };

    return (
        <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors flex items-center gap-1 text-xs font-bold disabled:opacity-50"
            title="Cancel Appointment"
        >
            <XCircle className="w-4 h-4" />
            Cancel
        </button>
    );
}
