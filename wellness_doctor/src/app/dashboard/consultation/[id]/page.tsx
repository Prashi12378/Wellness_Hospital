'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Printer, ChevronDown, Stethoscope, ClipboardList, Pill, Activity, Heart, Thermometer, Droplets, Weight, User, Calendar, IdCard, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getConsultationDetails, savePrescription, getMedicineOptions } from '@/app/actions/consultation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { PDFDownloadLink } from '@react-pdf/renderer';
import PrescriptionPDF from '@/components/PrescriptionPDF';

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
                    className={`${className} ${centerText ? 'text-center' : 'text-left'} w-full bg-transparent focus:outline-none pr-6 text-ellipsis overflow-hidden whitespace-nowrap`} // Room for chevron
                />
                {/* Visual Arrow */}
                <div
                    className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black print:hidden"
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


// Dynamic import for PDF Button to avoid SSR issues
const PrescriptionPDFButton = dynamic(() => import('@/components/PrescriptionPDFButton'), {
    ssr: false,
    loading: () => <button className="px-4 py-2 bg-slate-100 rounded-lg text-slate-400 text-sm">Loading PDF...</button>
});

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
    const { data: session } = useSession();

    // Core Data
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [medicineOptions, setMedicineOptions] = useState<string[]>([]);

    // Editable Fields (Directly on Paper)
    const [patientName, setPatientName] = useState('');
    const [patientAge, setPatientAge] = useState('');
    const [patientGender, setPatientGender] = useState('');
    const [patientId, setPatientId] = useState('');

    const [doctorName, setDoctorName] = useState('');
    const [qualification, setQualification] = useState('');
    const [speciality, setSpeciality] = useState('');

    const [diagnosis, setDiagnosis] = useState('');
    const [adviceLines, setAdviceLines] = useState<string[]>(['']);
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]); // Use YYYY-MM-DD for input
    const [visitDateDisplay, setVisitDateDisplay] = useState(format(new Date(), 'dd-MMM-yyyy (HH:mm)')); // Keep display for PDF? No, use the editable date.

    // Legacy/Unused for now but kept for compatibility logic
    // Updated to include height
    const [vitals, setVitals] = useState({ bp: '', bp_sys: '', bp_dia: '', pulse: '', temp: '', spo2: '', weight: '' });
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
        if (session?.user) {
            const u = session.user as any;
            const getNormalizedName = (f: string, l: string) => {
                let name = `${f || ''} ${l || ''}`.trim();
                if (!name) return 'Doctor';
                const cleaned = name.replace(/^(dr\.?\s*)+/i, '').trim();
                return `Dr. ${cleaned}`;
            };
            if (!doctorName) setDoctorName(getNormalizedName(u.firstName, u.lastName));
            if (!qualification) setQualification(u.qualifications || 'MBBS');
            if (!speciality) setSpeciality(u.specialization || 'General Physician');
        }
    }, [session, doctorName, qualification, speciality]);

    useEffect(() => {
        if (appointment) {
            const profile = appointment.patient_profile || appointment.profiles;

            if (profile) {
                const fName = profile.firstName || profile.first_name || '';
                const lName = profile.lastName || profile.last_name || '';
                if (fName || lName) {
                    setPatientName(`${fName} ${lName}`.trim());
                } else if (appointment.patient_name) {
                    setPatientName(appointment.patient_name);
                }

                // Calculate age from dob
                let ageStr = profile.age || '';
                if (!ageStr && profile.dob) {
                    const dobDate = new Date(profile.dob);
                    const diffMs = Date.now() - dobDate.getTime();
                    const ageDt = new Date(diffMs);
                    ageStr = Math.abs(ageDt.getUTCFullYear() - 1970).toString();
                }
                setPatientAge(ageStr);
                setPatientGender(profile.gender || '');
                setPatientId(profile.uhid || appointment.user_id?.slice(0, 8) || '');
            } else if (appointment.patient_name) {
                setPatientName(appointment.patient_name);
                setPatientId(appointment.user_id?.slice(0, 8) || '');
            }
        }
    }, [appointment]);

    useEffect(() => {
        fetchAppointmentDetails();
        fetchMedicineOptions();
    }, [id]);

    const fetchMedicineOptions = async () => {
        const { medicines: options } = await getMedicineOptions();
        if (options) setMedicineOptions(options);
    };

    const fetchAppointmentDetails = async () => {
        const { appointment: apt, prescription: rx, error } = await getConsultationDetails(id);

        if (error || !apt) {
            console.error('Error fetching details:', error);
            return;
        }

        if (rx) {
            setExistingPrescription(rx);
            setMedicines(rx.medicines as any as Medicine[]);
            if (rx.doctorName) setDoctorName(rx.doctorName);

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
                        bp_sys: parsed.vitals?.bp_sys || '',
                        bp_dia: parsed.vitals?.bp_dia || '',
                        pulse: parsed.vitals?.pulse || '',
                        temp: parsed.vitals?.temp || '',
                        spo2: parsed.vitals?.spo2 || '',
                        weight: parsed.vitals?.weight || '',
                    });

                    if (rx.date) {
                        setVisitDate(new Date(rx.date).toISOString().split('T')[0]);
                    }
                } else {
                    setAdviceLines(rx.additionalNotes ? rx.additionalNotes.split('\n') : ['']);
                }
            } catch (e) {
                console.error("Error parsing additional notes", e);
                setAdviceLines(rx.additionalNotes ? rx.additionalNotes.split('\n') : ['']);
            }
        }

        // Always try to set Patient ID and default date if not already set by prescription
        if (apt) {
            setPatientId(apt.patient_profile?.uhid || apt.user_id?.slice(0, 8) || '');
            if (!rx?.date) {
                setVisitDate(new Date().toISOString().split('T')[0]);
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

        if (field === 'name') {
            const isOption = medicineOptions.includes(value);
            if (isOption) {
                // Split logic: Find first space or hyphen followed by a number
                const match = value.match(/^([^0-9]+?)[-\s]+(\d.*)$/);
                if (match) {
                    newMeds[index].name = match[1].trim();
                    newMeds[index].strength = match[2].trim();
                } else {
                    newMeds[index].name = value;
                }
            } else {
                newMeds[index].name = value;
            }
        } else {
            newMeds[index][field] = value;
        }

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
                additional_notes: serializedNotes,
                date: visitDate
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
                        <h1 className="text-xl font-bold text-cyan-900 tracking-tight">Prescription Editor</h1>
                        <p className="text-xs font-medium text-cyan-600 uppercase tracking-widest">Premium Medical Standard</p>
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

                    {/* PDF Download Button */}
                    <PrescriptionPDFButton
                        appointment={appointment}
                        existingPrescription={existingPrescription}
                        medicines={medicines}
                        vitals={vitals}
                        notes={notes}
                        diagnosis={diagnosis}
                        investigations={investigations}
                        advice={adviceLines.join('\n')}
                        patientAddress={appointment?.profiles?.city || ''}
                        qualification={qualification}
                        speciality={speciality}
                        regNo={existingPrescription?.doctor_reg_no || ''}
                        followUp={followUp}
                        fileName={`${patientName.replace(/\s+/g, '_')}_Prescription.pdf`}
                        date={visitDate}
                        patientName={patientName}
                        patientAge={patientAge}
                        patientGender={patientGender}
                        patientId={patientId}
                        doctorName={doctorName}
                    />

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-900 border border-cyan-200 rounded-lg hover:bg-cyan-50 shadow-sm transition-all font-semibold"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>

            {/* A4 PAGE CONTAINER */}
            <div className="bg-white shadow-xl mx-auto w-[210mm] min-h-[297mm] p-12 relative text-[#111] print:shadow-none print:w-full print:p-12 font-sans">
                {/* Header */}
                <div className="flex items-center">
                    <div className="w-20 h-20 mr-5 relative">
                        <Image
                            src="/logo.png"
                            alt="Wellness Hospital Logo"
                            fill
                            className="object-contain grayscale contrast-150"
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-[36px] font-[800] uppercase leading-tight">Wellness Hospital</h1>
                        <p className="text-[14px] tracking-[1px] uppercase">Palanajoghalli, Mallathalli Post, Doddaballapura</p>
                        <p className="text-[14px] tracking-[1px] uppercase text-gray-600">Karnataka - 561203 | Ph: +91 6366662245</p>
                    </div>
                </div>

                <div className="border-t-[3px] border-black my-5"></div>

                {/* Top Section */}
                <div className="flex justify-between items-start">
                    <div className="w-[68%] flex flex-col gap-3">
                        <div className="flex gap-4">
                            <div className="space-y-1 flex-1">
                                <label className="text-[12px] font-bold tracking-[1px] uppercase">Patient Name</label>
                                <input
                                    type="text"
                                    value={patientName}
                                    onChange={e => setPatientName(e.target.value)}
                                    className="w-full h-[25px] border-b border-[#aaa] focus:outline-none bg-transparent font-bold uppercase text-[14px]"
                                />
                            </div>
                            <div className="space-y-1 w-32">
                                <label className="text-[12px] font-bold tracking-[1px] uppercase">Age / Gen</label>
                                <div className="flex items-center justify-center gap-1 h-[25px] border-b border-[#aaa]">
                                    <input
                                        type="text"
                                        value={patientAge}
                                        onChange={e => setPatientAge(e.target.value)}
                                        className="w-10 focus:outline-none bg-transparent font-bold text-[14px] text-center"
                                        placeholder="Age"
                                    />
                                    <span className="text-gray-300">/</span>
                                    <input
                                        type="text"
                                        value={patientGender}
                                        onChange={e => setPatientGender(e.target.value)}
                                        className="w-12 focus:outline-none bg-transparent font-bold uppercase text-[14px] text-center"
                                        placeholder="M/F"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-1 flex-1">
                                <label className="text-[12px] font-bold tracking-[1px] uppercase">Patient ID</label>
                                <input
                                    type="text"
                                    value={patientId}
                                    onChange={e => setPatientId(e.target.value)}
                                    className="w-full h-[25px] border-b border-[#aaa] focus:outline-none bg-transparent font-bold uppercase text-[14px]"
                                />
                            </div>
                            <div className="space-y-1 w-32">
                                <label className="text-[12px] font-bold tracking-[1px] uppercase">Date</label>
                                <input
                                    type="date"
                                    value={visitDate}
                                    onChange={e => setVisitDate(e.target.value)}
                                    className="w-full h-[25px] border-b border-[#aaa] focus:outline-none bg-transparent font-bold text-[14px]"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold tracking-[1px] uppercase">Consulting Specialist</label>
                            <input
                                type="text"
                                value={doctorName}
                                onChange={e => setDoctorName(e.target.value)}
                                className="w-full h-[25px] focus:outline-none bg-transparent font-[800] uppercase text-[18px]"
                            />
                        </div>
                    </div>

                    <div className="w-[28%] border border-[#ccc] rounded-[10px] overflow-hidden">
                        <div className="bg-[#eee] text-center font-bold p-[10px] text-[12px] tracking-widest uppercase">CLINICAL VITALS</div>
                        <div className="p-[10px] space-y-3">
                            <div className="flex justify-between text-[14px]">
                                <span className="font-semibold text-gray-600">BP</span>
                                <div className="flex items-center gap-1 font-bold">
                                    <input
                                        type="text"
                                        value={vitals.bp_sys || ''}
                                        onChange={(e) => setVitals({ ...vitals, bp_sys: e.target.value })}
                                        className="w-8 text-center border-b border-gray-100 focus:outline-none"
                                        placeholder="___"
                                    />
                                    <span className="text-gray-300">/</span>
                                    <input
                                        type="text"
                                        value={vitals.bp_dia || ''}
                                        onChange={(e) => setVitals({ ...vitals, bp_dia: e.target.value })}
                                        className="w-8 text-center border-b border-gray-100 focus:outline-none"
                                        placeholder="___"
                                    />
                                    <span className="text-[10px] font-normal text-gray-400">mmHg</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-[14px]">
                                <span className="font-semibold text-gray-600">SpO2</span>
                                <div className="flex items-center gap-1 font-bold">
                                    <input
                                        type="text"
                                        value={vitals.spo2}
                                        onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                        className="w-12 text-center border-b border-gray-100 focus:outline-none"
                                        placeholder="___"
                                    />
                                    <span className="text-[10px] font-normal text-gray-400">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-[14px]">
                                <span className="font-semibold text-gray-600">Pulse</span>
                                <div className="flex items-center gap-1 font-bold">
                                    <input
                                        type="text"
                                        value={vitals.pulse}
                                        onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                        className="w-12 text-center border-b border-gray-100 focus:outline-none"
                                        placeholder="___"
                                    />
                                    <span className="text-[10px] font-normal text-gray-400">BPM</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-[14px]">
                                <span className="font-semibold text-gray-600">Temp</span>
                                <div className="flex items-center gap-1 font-bold">
                                    <input
                                        type="text"
                                        value={vitals.temp}
                                        onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                                        className="w-12 text-center border-b border-gray-100 focus:outline-none"
                                        placeholder="___"
                                    />
                                    <span className="text-[10px] font-normal text-gray-400">°F</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="mt-[25px] space-y-8">
                    {/* Diagnosis */}
                    <div>
                        <div className="text-[16px] font-bold tracking-[2px] uppercase">Diagnosis</div>
                        <div className="border-t-2 border-black mt-1"></div>
                        <textarea
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            className="w-full mt-3 font-bold text-[16px] uppercase focus:outline-none bg-transparent resize-none border-0 p-0 placeholder:text-gray-300"
                            placeholder="ENTER CLINICAL DIAGNOSIS..."
                            rows={1}
                        />
                    </div>

                    {/* Chief Complaints */}
                    <div>
                        <div className="text-[14px] font-bold tracking-[2px] uppercase">Chief Complaints (C/O)</div>
                        <div className="border-t-2 border-black mt-1"></div>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full mt-3 text-[14px] font-medium text-gray-600 focus:outline-none bg-transparent border-0 p-0 placeholder:text-gray-300"
                            placeholder="Patient's clinical presentation..."
                            rows={1}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />
                    </div>

                    {/* Prescription (Rx) */}
                    <div>
                        <div className="text-[14px] font-bold tracking-[2px] uppercase">Prescription (Rx)</div>
                        <div className="border-t-2 border-black mt-1"></div>
                        <table className="w-full mt-4">
                            <thead>
                                <tr className="border-b border-[#ccc]">
                                    <th className="py-2 text-left text-[12px] font-bold uppercase w-[5%]">No</th>
                                    <th className="py-2 text-left text-[12px] font-bold uppercase w-[30%]">Medicine Name</th>
                                    <th className="py-2 text-left text-[12px] font-bold uppercase w-[20%]">Strength</th>
                                    <th className="py-2 text-left text-[12px] font-bold uppercase w-[15%]">Freq</th>
                                    <th className="py-2 text-left text-[12px] font-bold uppercase w-[10%]">Days</th>
                                    <th className="py-2 text-left text-[12px] font-bold uppercase w-[20%]">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((med, index) => (
                                    <tr key={index} className="border-b border-[#ccc] group">
                                        <td className="py-3 text-[14px] text-gray-400">{index + 1}</td>
                                        <td className="py-3">
                                            <AutocompleteInput
                                                value={med.name}
                                                onChange={(val) => handleMedicineChange(index, 'name', val)}
                                                options={medicineOptions}
                                                placeholder="Medicine..."
                                                className="font-bold text-black uppercase text-[14px] placeholder:text-gray-100"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <input
                                                className="w-full bg-transparent focus:outline-none font-semibold text-gray-600 text-[14px] placeholder:text-gray-100"
                                                value={med.strength}
                                                onChange={(e) => handleMedicineChange(index, 'strength', e.target.value)}
                                                placeholder="Strength..."
                                            />
                                        </td>
                                        <td className="py-3">
                                            <AutocompleteInput
                                                value={med.frequency}
                                                onChange={(val) => handleMedicineChange(index, 'frequency', val)}
                                                options={DOSAGE_OPTIONS}
                                                placeholder="Freq..."
                                                centerText={true}
                                                className="font-semibold text-gray-600 text-[14px] text-center placeholder:text-gray-100"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <input
                                                className="w-full bg-transparent focus:outline-none font-semibold text-gray-600 text-[14px] text-center placeholder:text-gray-100"
                                                value={med.duration}
                                                onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                placeholder="Days..."
                                            />
                                        </td>
                                        <td className="py-3 relative">
                                            <AutocompleteInput
                                                value={med.notes}
                                                onChange={(val) => handleMedicineChange(index, 'notes', val)}
                                                options={INSTRUCTION_OPTIONS}
                                                placeholder="Notes..."
                                                className="font-medium text-gray-400 text-[14px] placeholder:text-gray-100"
                                            />
                                            <button
                                                onClick={() => handleRemoveMedicine(index)}
                                                className="absolute -right-6 top-1/2 -translate-y-1/2 text-gray-200 hover:text-red-500 transition-colors print:hidden"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            onClick={handleAddMedicine}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[10px] font-bold uppercase tracking-widest rounded transition-all print:hidden"
                        >
                            <Plus className="w-3 h-3" /> Add Medicine
                        </button>
                    </div>

                    {/* Medical Advice */}
                    <div>
                        <div className="text-[14px] font-bold tracking-[2px] uppercase">Medical Advice & Instructions</div>
                        <div className="border-t-2 border-black mt-1"></div>
                        <ul className="mt-4 space-y-2">
                            {adviceLines.map((line, index) => (
                                <li key={index} className="flex items-start gap-3 group">
                                    <span className="text-gray-300 font-bold mt-1.5">•</span>
                                    <input
                                        id={`advice-${index}`}
                                        className="flex-1 bg-transparent focus:outline-none text-[14px] font-medium text-gray-600 placeholder:text-gray-200 py-1"
                                        value={line}
                                        onChange={(e) => handleAdviceChange(index, e.target.value)}
                                        onKeyDown={(e) => handleAdviceKeyDown(index, e)}
                                        placeholder={index === 0 ? "Start typing advice..." : ""}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 flex justify-end items-end">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 mb-1">Digitally signed by</p>
                        <p className="text-[20px] font-[800] uppercase italic">
                            DR. {doctorName.replace(/^Dr\.\s+/i, '').toUpperCase() || 'NIKITHA'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 tracking-[1px] uppercase">Medical Consultant</p>
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
        </div >
    );
};
