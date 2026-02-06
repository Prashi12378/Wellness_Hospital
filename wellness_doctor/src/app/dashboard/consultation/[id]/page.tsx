'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Printer, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getConsultationDetails, savePrescription } from '@/app/actions/consultation';
import dynamic from 'next/dynamic';

// React PDF import removed as it was unused and causing build errors
// If needed later, use a separate component to wrap PDFDownloadLink with ssr: false

// Types
interface Medicine {
    name: string;
    strength: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string;
}

interface PageProps {
    params: Promise<{
        id: string; // appointment_id
    }>;
}

// ----------------------------------------------------------------------
// CUSTOM AUTOCOMPLETE COMPONENT (For Speed & Usability)
// ----------------------------------------------------------------------
interface AutocompleteProps {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
    centerText?: boolean;
}

function AutocompleteInput({ value, onChange, options, placeholder, className, centerText }: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Filter options based on input, BUT show all if input matches exactly an option (so user can switch)
        // OR show all if input is empty.
        const lowerVal = value.toLowerCase();
        if (value === '') {
            setFilteredOptions(options);
        } else {
            // If the current value is exactly one of the options, show ALL options (user might want to change it)
            const exactMatch = options.some(opt => opt.toLowerCase() === lowerVal);
            if (exactMatch) {
                setFilteredOptions(options);
            } else {
                const filtered = options.filter(opt => opt.toLowerCase().includes(lowerVal));
                setFilteredOptions(filtered.length > 0 ? filtered : options); // Fallback to all if no match? No, let's show filtered.
            }
        }
    }, [value, options]);

    // Handle clicking outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={(e) => {
                        setIsOpen(true);
                        e.target.select(); // Auto-select text for quick overwrite
                    }}
                    placeholder={placeholder}
                    className={`${className} ${centerText ? 'text-center' : 'text-left'} w-full bg-transparent focus:outline-none pr-4`} // Room for chevron
                />
                {/* Visual Arrow */}
                <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black print:hidden"
                    onClick={() => {
                        // Toggle dropdown
                        if (isOpen) {
                            setIsOpen(false);
                        } else {
                            setIsOpen(true);
                            inputRef.current?.focus();
                            setFilteredOptions(options); // Force show all on arrow click
                        }
                    }}
                >
                    <ChevronDown className="w-3 h-3" />
                </div>
            </div>

            {/* Dropdown List */}
            {isOpen && (
                <ul className="absolute z-50 w-[150%] min-w-[120px] bg-white border border-black shadow-lg max-h-48 overflow-y-auto mt-1 left-0 print:hidden text-left">
                    {filteredOptions.length > 0 ? filteredOptions.map((opt, idx) => (
                        <li
                            key={idx}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b border-gray-100 last:border-0"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur before click processes
                                onChange(opt);
                                setIsOpen(false);
                            }}
                        >
                            {opt}
                        </li>
                    )) : (
                        <li className="px-3 py-2 text-gray-400 text-xs italic">No matches</li>
                    )}
                </ul>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default function ConsultationPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [appointment, setAppointment] = useState<any>(null);
    const [existingPrescription, setExistingPrescription] = useState<any>(null);

    // Core Data
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    // Editable Fields (Directly on Paper)
    const [patientName, setPatientName] = useState('');
    const [patientAge, setPatientAge] = useState('');
    const [patientGender, setPatientGender] = useState('');
    const [patientId, setPatientId] = useState('');

    const [doctorName, setDoctorName] = useState('Dr. Sanath');
    const [qualification, setQualification] = useState('MBBS, MD');
    const [speciality, setSpeciality] = useState('General Physician');

    const [diagnosis, setDiagnosis] = useState('');
    const [adviceLines, setAdviceLines] = useState<string[]>(['']);
    const [visitDate, setVisitDate] = useState(format(new Date(), 'dd-MMM-yyyy (HH:mm)'));

    // Legacy/Unused for now but kept for compatibility logic
    // Updated to include height
    const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', spo2: '', weight: '', height: '' });
    const [investigations, setInvestigations] = useState('');
    const [followUp, setFollowUp] = useState('');
    const [notes, setNotes] = useState('');

    // Options for Autocomplete
    const DOSAGE_OPTIONS = ["1-0-1", "1-0-0", "0-0-1", "1-1-1", "0-1-0", "1-1-0", "0-1-1"];
    const INSTRUCTION_OPTIONS = [
        "After Food", "Before Food",
        "Before Breakfast", "After Breakfast",
        "Before Lunch", "After Lunch",
        "Before Dinner", "After Dinner",
        "With Water", "At Bedtime",
        "Once a week", "Empty Stomach"
    ];

    // Focus Management
    const [focusIndex, setFocusIndex] = useState<number | null>(null);

    useEffect(() => {
        if (focusIndex !== null) {
            const el = document.getElementById(`advice-${focusIndex}`);
            if (el) {
                el.focus();
                setFocusIndex(null);
            }
        }
    }, [adviceLines, focusIndex]);

    useEffect(() => {
        if (appointment?.profiles) {
            setPatientName(`${appointment.profiles.first_name} ${appointment.profiles.last_name}`);
            setPatientAge(`${appointment.profiles.age || ''}`);
            setPatientGender(appointment.profiles.gender || '');
            setPatientId(appointment.user_id?.slice(0, 4) || '___');
        }
    }, [appointment]);

    useEffect(() => {
        fetchAppointmentDetails();
    }, [id]);

    const fetchAppointmentDetails = async () => {
        const { appointment: apt, prescription: rx, error } = await getConsultationDetails(id);

        if (error || !apt) {
            console.error('Error fetching details:', error);
            return;
        }

        if (rx) {
            setExistingPrescription(rx);
            setMedicines(rx.medicines as any as Medicine[]);

            try {
                if (rx.additionalNotes?.startsWith('{')) {
                    const parsed = JSON.parse(rx.additionalNotes);
                    setDiagnosis(parsed.diagnosis || '');

                    if (parsed.advice) {
                        setAdviceLines(parsed.advice.split('\n'));
                    } else {
                        setAdviceLines(['']);
                    }

                    if (parsed.qualification) setQualification(parsed.qualification);
                    if (parsed.speciality) setSpeciality(parsed.speciality);

                    // Init Vitals including Height
                    setVitals({
                        bp: parsed.vitals?.bp || '',
                        pulse: parsed.vitals?.pulse || '',
                        temp: parsed.vitals?.temp || '',
                        spo2: parsed.vitals?.spo2 || '',
                        weight: parsed.vitals?.weight || '',
                        height: parsed.vitals?.height || '',
                    });

                } else {
                    setAdviceLines(rx.additionalNotes ? rx.additionalNotes.split('\n') : ['']);
                }
            } catch (e) {
                console.error("Error parsing additional notes", e);
                setAdviceLines(rx.additionalNotes ? rx.additionalNotes.split('\n') : ['']);
            }
        }
        setAppointment(apt);
        setLoading(false);
    };

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', strength: '', dosage: '', duration: '', notes: '', frequency: '' }]);
    };

    const handleRemoveMedicine = (index: number) => {
        const newMeds = [...medicines];
        newMeds.splice(index, 1);
        setMedicines(newMeds);
    };

    const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);
    };

    const handleAdviceChange = (index: number, value: string) => {
        const newLines = [...adviceLines];
        newLines[index] = value;
        setAdviceLines(newLines);
    };

    const handleAdviceKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newLines = [...adviceLines];
            newLines.splice(index + 1, 0, '');
            setAdviceLines(newLines);
            setFocusIndex(index + 1);
        }
        if (e.key === 'Backspace' && adviceLines[index] === '' && adviceLines.length > 1) {
            e.preventDefault();
            const newLines = [...adviceLines];
            newLines.splice(index, 1);
            setAdviceLines(newLines);
            setFocusIndex(index - 1 < 0 ? 0 : index - 1);
        }
    };

    const handleSavePrescription = async () => {
        setSaving(true);
        try {
            const validMedicines = medicines.filter(m => m.name.trim() !== '');
            const adviceString = adviceLines.join('\n');
            const serializedNotes = JSON.stringify({
                diagnosis,
                advice: adviceString,
                qualification,
                speciality,
                vitals // Saved here
            });

            const prescriptionData = {
                appointment_id: id,
                patient_id: appointment.user_id,
                medicines: validMedicines,
                additional_notes: serializedNotes
            };

            const result = await savePrescription(prescriptionData);
            if (result.error) throw new Error(result.error);

            const { prescription: newRx } = await getConsultationDetails(id);
            if (newRx) setExistingPrescription(newRx);
            alert('Prescription Saved Successfully');

        } catch (error: any) {
            console.error(error);
            alert('Error saving: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Loading prescription pad...</div>;

    // ----------------------------------------------------------------------
    // LIVE PAD COMPONENT (Black & White Medical Record Style)
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-slate-100 py-8 font-sans print:bg-white print:p-0">

            {/* TOP BAR (Hidden on Print) */}
            <div className="max-w-[210mm] mx-auto flex items-center justify-between mb-6 px-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Prescription Editor</h1>
                        <p className="text-sm text-slate-500">Black & White Formal Layout</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSavePrescription}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                    >
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-sm transition-all"
                    >
                        <Printer className="w-4 h-4" /> Print / PDF
                    </button>
                </div>
            </div>

            {/* A4 PAGE CONTAINER */}
            <div className="bg-white shadow-xl mx-auto w-[210mm] min-h-[297mm] p-12 relative text-slate-900 print:shadow-none print:w-full print:p-12 print:text-black">

                {/* 1. Header (Static/Logo) */}
                <div className="flex items-start justify-between mb-8 border-b-2 border-black pb-4">
                    <div className="flex items-center gap-4">
                        <div className="">
                            <img src="/logo.png" alt="Logo" className="w-[80px] grayscale brightness-0" />
                        </div>
                        <div className="">
                            <h1 className="text-3xl font-bold text-black mb-1 uppercase tracking-tight">Wellness Hospital</h1>
                            <p className="text-sm font-semibold text-gray-800">Palanajoghalli, Mallathalli Post, Doddaballapura</p>
                            <p className="text-sm text-gray-600">Karnataka - 561203 | Ph: 6366662245</p>
                        </div>
                    </div>
                </div>

                {/* 2. Patient / Doctor Info Box (Grid Style) */}
                <div className="border-2 border-black mb-8 text-sm">
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 divide-x-2 divide-black border-b border-black">
                        <div className="p-2 flex items-center">
                            <span className="font-bold w-24">Patient Name:</span>
                            <input
                                type="text"
                                value={patientName}
                                onChange={e => setPatientName(e.target.value)}
                                className="font-medium uppercase focus:outline-none w-full bg-transparent"
                            />
                        </div>
                        <div className="p-2 flex items-center">
                            <span className="font-bold w-24">Date:</span>
                            <span className="font-medium">{visitDate}</span>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 divide-x-2 divide-black border-b border-black">
                        <div className="p-2 flex items-center">
                            <span className="font-bold w-24">Age / Gender:</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={patientAge}
                                    onChange={e => setPatientAge(e.target.value)}
                                    className="font-medium w-12 focus:outline-none bg-transparent"
                                />
                                <span>/</span>
                                <input
                                    type="text"
                                    value={patientGender}
                                    onChange={e => setPatientGender(e.target.value)}
                                    className="font-medium w-24 focus:outline-none bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="p-2 flex items-center">
                            <span className="font-bold w-24">Patient ID:</span>
                            <input
                                type="text"
                                value={patientId}
                                onChange={e => setPatientId(e.target.value)}
                                className="font-medium focus:outline-none bg-transparent w-full"
                            />
                        </div>
                    </div>

                    {/* Row 3 - Doctor */}
                    <div className="grid grid-cols-1">
                        <div className="p-2 flex items-center">
                            <span className="font-bold w-24">Consultant:</span>
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={doctorName}
                                    onChange={e => setDoctorName(e.target.value)}
                                    className="font-bold uppercase focus:outline-none bg-transparent"
                                />
                                -
                                <input
                                    type="text"
                                    value={qualification}
                                    onChange={e => setQualification(e.target.value)}
                                    className="font-medium focus:outline-none bg-transparent w-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Vitals (New Section) */}
                <div className="mb-6">
                    <div className="bg-black text-white inline-block px-3 py-1 font-bold uppercase text-sm mb-2 print:bg-black print:text-white print-color-adjust">
                        Vitals
                    </div>
                    <div className="border border-black p-3">
                        <div className="grid grid-cols-3 gap-y-4 gap-x-2 sm:grid-cols-6">
                            {/* BP */}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-600 uppercase">BP (mmHg)</span>
                                <input
                                    type="text"
                                    value={vitals.bp}
                                    onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                    className="font-bold border-b border-gray-300 focus:border-black outline-none py-1"
                                />
                            </div>
                            {/* Pulse */}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-600 uppercase">Pulse (bpm)</span>
                                <input
                                    type="text"
                                    value={vitals.pulse}
                                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-black outline-none py-1"
                                />
                            </div>
                            {/* Temp */}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-600 uppercase">Temp (°F)</span>
                                <input
                                    type="text"
                                    value={vitals.temp}
                                    onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-black outline-none py-1"
                                />
                            </div>
                            {/* SpO2 */}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-600 uppercase">SpO2 (%)</span>
                                <input
                                    type="text"
                                    value={vitals.spo2}
                                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-black outline-none py-1"
                                />
                            </div>
                            {/* Weight */}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-600 uppercase">Weight (kg)</span>
                                <input
                                    type="text"
                                    value={vitals.weight}
                                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-black outline-none py-1"
                                />
                            </div>
                            {/* Height */}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-600 uppercase">Height (cm)</span>
                                <input
                                    type="text"
                                    value={vitals.height || ''}
                                    onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-black outline-none py-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Medicines (Editable Table) */}
                <div className="mb-8">
                    <div className="bg-black text-white inline-block px-3 py-1 font-bold uppercase text-sm mb-4 print:bg-black print:text-white print-color-adjust">
                        Prescription (Rx)
                    </div>


                    {/* Header */}
                    <div className="mb-4">
                        <div className="grid grid-cols-[30px_2fr_1.5fr_1fr_1fr_2fr_30px] gap-4 border-b border-gray-200 pb-2 font-bold text-black text-sm uppercase tracking-wide">
                            <div className="text-left">No</div>
                            <div className="text-left">Medicine Name</div>
                            <div className="text-left">Strength/Form</div>
                            <div className="text-left">Frequency</div>
                            <div className="text-left">Days</div>
                            <div className="text-left">Instruction</div>
                            <div className="print:hidden"></div>
                        </div>

                        {/* Rows */}
                        <div className="flex flex-col gap-4 mt-4">
                            {medicines.map((med, i) => (
                                <div key={i} className="grid grid-cols-[30px_2fr_1.5fr_1fr_1fr_2fr_30px] gap-4 items-start text-sm">
                                    <div className="text-left text-black font-medium mt-1.5">{i + 1}</div>

                                    {/* Name */}
                                    <div>
                                        <textarea
                                            value={med.name}
                                            onChange={e => handleMedicineChange(i, 'name', e.target.value)}
                                            className="w-full font-bold uppercase focus:outline-none bg-transparent resize-none overflow-hidden"
                                            placeholder="DOLO"
                                            rows={1}
                                            style={{ minHeight: '24px' }}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = `${target.scrollHeight}px`;
                                            }}
                                        />
                                    </div>

                                    {/* Strength/Form */}
                                    <div>
                                        <input
                                            type="text"
                                            value={med.strength || ''}
                                            onChange={e => handleMedicineChange(i, 'strength', e.target.value)}
                                            className="w-full focus:outline-none bg-transparent text-black"
                                            placeholder="Tablet 650 mg"
                                        />
                                    </div>

                                    {/* Frequency (mapped to dosage state) */}
                                    <div>
                                        <AutocompleteInput
                                            value={med.dosage}
                                            onChange={(val) => handleMedicineChange(i, 'dosage', val)}
                                            options={DOSAGE_OPTIONS}
                                            className="text-black"
                                            placeholder="1-0-1"
                                        />
                                    </div>

                                    {/* Days */}
                                    <div>
                                        <input
                                            type="text"
                                            value={med.duration}
                                            onChange={e => handleMedicineChange(i, 'duration', e.target.value)}
                                            className="w-full focus:outline-none bg-transparent text-black"
                                            placeholder="5 Days"
                                        />
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <AutocompleteInput
                                            value={med.notes}
                                            onChange={(val) => handleMedicineChange(i, 'notes', val)}
                                            options={INSTRUCTION_OPTIONS}
                                            className="text-black"
                                            placeholder="After food"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="print:hidden text-center mt-1">
                                        <button
                                            onClick={() => handleRemoveMedicine(i)}
                                            className="text-slate-300 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2 print:hidden">
                        <button
                            onClick={handleAddMedicine}
                            className="flex items-center gap-1 text-sm text-black hover:bg-gray-100 px-3 py-1.5 rounded border border-gray-300 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Medicine Row
                        </button>
                    </div>
                </div>

                {/* 5. Advice - Dynamic Points */}
                <div className="mb-8">
                    <div className="bg-black text-white inline-block px-3 py-1 font-bold uppercase text-sm mb-4 print:bg-black print:text-white print-color-adjust">
                        Advice
                    </div>
                    <div className="border border-black p-4 min-h-[150px]">
                        <ul className="list-disc pl-5 space-y-1">
                            {adviceLines.map((line, index) => (
                                <li key={index} className="marker:text-black text-sm">
                                    <input
                                        id={`advice-${index}`}
                                        className="w-full bg-transparent focus:outline-none"
                                        value={line}
                                        onChange={(e) => handleAdviceChange(index, e.target.value)}
                                        onKeyDown={(e) => handleAdviceKeyDown(index, e)}
                                        placeholder={index === 0 && adviceLines.length === 1 ? "Type advice here... (Press Enter for new point)" : ""}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 6. Footer Signature */}
                <div className="mt-12 flex justify-end">
                    <div className="text-center">
                        <p className="font-bold text-sm mb-2 uppercase">Dr. {existingPrescription?.doctor_name || 'Sanath'}</p>
                        <div className="w-48 h-[1px] bg-black mb-1"></div>
                        <p className="font-bold text-xs uppercase">Signature</p>
                    </div>
                </div>

                {/* PAGE BREAK MARKER (Visual Only) */}
                <div className="absolute top-[297mm] left-0 w-full border-b-2 border-dashed border-red-300 pointer-events-none print:hidden flex items-center justify-center">
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">End of Page 1</span>
                </div>

            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        background: white;
                    }
                    .print-color-adjust {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}
