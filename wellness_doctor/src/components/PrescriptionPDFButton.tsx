'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown, Loader2 } from 'lucide-react';
import PrescriptionPDF from './PrescriptionPDF';

interface PrescriptionPDFButtonProps {
    appointment: any;
    existingPrescription: any;
    medicines: any[];
    vitals: any;
    notes: string;
    diagnosis: string;
    investigations: string;
    advice: string;
    patientAddress: string;
    qualification: string;
    speciality: string;
    regNo: string;
    followUp: string;
    fileName?: string;
    date?: string;
    patientName?: string;
    patientAge?: string;
    patientGender?: string;
    patientId?: string;
    doctorName?: string;
}

const PrescriptionPDFButton: React.FC<PrescriptionPDFButtonProps> = (props) => {
    return (
        <PDFDownloadLink
            document={<PrescriptionPDF {...props} />}
            fileName={props.fileName || 'prescription.pdf'}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 shadow-sm transition-all text-sm font-medium"
        >
            {({ blob, url, loading, error }) => (
                loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                    </>
                ) : (
                    <>
                        <FileDown className="w-4 h-4" /> Download PDF
                    </>
                )
            )}
        </PDFDownloadLink>
    );
};

export default PrescriptionPDFButton;
