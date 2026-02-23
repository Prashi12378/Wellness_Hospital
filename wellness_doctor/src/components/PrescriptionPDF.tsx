import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: '1.6cm', // ~45pt
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.3,
        color: '#000000',
    },
    accentLine: {
        height: 1.5,
        backgroundColor: '#0097C2',
        marginVertical: 6,
        width: '100%',
    },
    accentSeparator: {
        height: 0.6,
        backgroundColor: '#0097C2',
        marginBottom: 4,
        marginTop: 8,
        width: '100%',
    },
    // Header
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 10,
        marginBottom: 10,
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: 15,
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    hospitalName: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        color: '#006B95', // Darker Blue
        textTransform: 'none',
        marginBottom: 4,
    },
    hospitalAddress: {
        fontSize: 9,
        color: '#374151',
        marginBottom: 2,
    },
    contactRow: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 12,
    },
    contactText: {
        fontSize: 9,
        color: '#374151',
    },
    // Patient/Doctor Grid
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    gridColumn: {
        width: '48%',
    },
    sectionTitleContainer: {
        backgroundColor: '#7EBCE6', // Light Blue bar
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 8,
        borderRadius: 2, // small radius
    },
    sectionTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 11,
        color: '#FFFFFF', // White text
    },
    row: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    label: {
        width: 60,
        fontSize: 10,
    },
    labelDoctor: {
        width: 60, // Adjusted for Doctor labels if needed
        fontSize: 10,
    },
    value: {
        flex: 1,
        fontFamily: 'Helvetica-Bold', // Use Bold for values as per design
        fontSize: 10,
    },
    // Clinical Notes
    contentBlock: {
        marginBottom: 6,
    },
    contentLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        marginBottom: 2,
    },
    contentText: {
        fontSize: 10,
        minHeight: 20,
    },
    sectionHeader: {
        color: '#0097C2',
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        fontSize: 11,
        marginTop: 4,
        marginBottom: 2,
    },
    // Rx Table (Borderless)
    table: {
        width: '100%',
        marginTop: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomColor: '#000000',
        borderBottomWidth: 0.5,
        alignItems: 'center',
        minHeight: 20,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 20,
        marginBottom: 2, // Space between rows
    },
    colNo: { width: '8%', textAlign: 'center', padding: 2 },
    colMed: { width: '37%', padding: 2 },
    colDose: { width: '12%', textAlign: 'center', padding: 2 },
    colFreq: { width: '12%', textAlign: 'center', padding: 2 },
    colDays: { width: '10%', textAlign: 'center', padding: 2 },
    colInstr: { width: '21%', padding: 2 },

    colText: { fontSize: 9 },
    colTextBold: { fontSize: 9, fontFamily: 'Helvetica-Bold' },

    // Lists
    listItem: {
        fontSize: 10,
        marginLeft: 10,
        marginBottom: 2,
    },
    // Footer
    footer: {
        marginTop: 'auto',
        alignItems: 'flex-end',
        paddingTop: 10,
    },
    signatureLine: {
        width: 150,
        borderBottomWidth: 0.5,
        borderColor: '#000000',
        marginBottom: 4,
    },
    docSignature: {
        fontSize: 10,
        textAlign: 'center',
        width: 150,
    }
});

interface PrescriptionPDFProps {
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
    date?: string;
}

const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({
    appointment,
    existingPrescription,
    medicines,
    vitals,
    notes,
    diagnosis,
    investigations,
    advice,
    patientAddress,
    qualification,
    speciality,
    regNo,
    followUp,
    date
}) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.headerContainer}>
                {/* Logo */}
                <Image src={window.location.origin + '/logo.png'} style={styles.logo} />

                {/* Text Content */}
                <View style={styles.headerContent}>
                    <Text style={styles.hospitalName}>Wellness Hospital</Text>
                    <Text style={styles.hospitalAddress}>Palanajoghalli, Mallathalli Post, Doddaballapura</Text>
                    <Text style={styles.hospitalAddress}>Karnataka - 561203</Text>

                    <View style={styles.contactRow}>
                        <Text style={styles.contactText}>📞 6366662245</Text>
                        <Text style={styles.contactText}>✉ wellnesshospital8383@gmail.com</Text>
                    </View>
                </View>
            </View>

            {/* <View style={styles.accentLine} /> Removed accent line in favor of border bottom in header */}

            {/* Patient / Doctor Details */}
            <View style={styles.gridContainer}>
                {/* Patient */}
                <View style={styles.gridColumn}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={styles.sectionTitle}>Patient Details</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>{appointment?.profiles?.first_name} {appointment?.profiles?.last_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Age/Sex:</Text>
                        <Text style={styles.value}>{appointment?.profiles?.age || '__'} / {appointment?.profiles?.gender || '__'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Patient ID:</Text>
                        <Text style={styles.value}>{appointment?.user_id?.slice(0, 4) || '___'}</Text>
                    </View>
                </View>

                {/* Doctor */}
                <View style={styles.gridColumn}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={styles.sectionTitle}>Doctor Details</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>Dr. {existingPrescription?.doctor_name || 'Sanath'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Qualification:</Text>
                        <Text style={styles.value}>{qualification || 'MBBS, MD'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Speciality:</Text>
                        <Text style={styles.value}>{speciality || 'General Physician'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date/Time:</Text>
                        <Text style={styles.value}>
                            {date ? format(new Date(date), 'dd-MMM-yyyy') : format(new Date(), 'dd-MMM-yyyy (HH:mm)')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Clinical Notes */}
            <View>
                <View style={styles.accentSeparator} />
                <Text style={styles.sectionHeader}>Clinical Notes</Text>

                <View style={styles.contentBlock}>
                    <Text style={styles.contentLabel}>Chief Complaints / History:</Text>
                    <Text style={styles.contentText}>{notes}</Text>
                </View>

                <View style={styles.contentBlock}>
                    <Text style={styles.contentLabel}>Vitals:</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 10, marginRight: 15 }}>BP: {vitals.bp || '___'}</Text>
                        <Text style={{ fontSize: 10, marginRight: 15 }}>Pulse: {vitals.pulse || '___'}</Text>
                        <Text style={{ fontSize: 10, marginRight: 15 }}>Temp: {vitals.temp || '___'}</Text>
                        <Text style={{ fontSize: 10, marginRight: 15 }}>SpO2: {vitals.spo2 || '___'}</Text>
                        <Text style={{ fontSize: 10 }}>Weight: {vitals.weight || '___'}</Text>
                    </View>
                </View>

                <View style={styles.contentBlock}>
                    <Text style={styles.contentLabel}>Diagnosis:</Text>
                    <Text style={styles.contentText}>{diagnosis}</Text>
                </View>
            </View>

            {/* Prescription */}
            {/* Removed flexGrow to allow content to collapse naturally */}
            <View>
                <View style={styles.accentSeparator} />
                <Text style={styles.sectionHeader}>Prescription</Text>
                <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Rx</Text>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.colNo}><Text style={styles.colTextBold}>No.</Text></View>
                        <View style={styles.colMed}><Text style={styles.colTextBold}>Medicine</Text></View>
                        <View style={styles.colDose}><Text style={styles.colTextBold}>Dose</Text></View>
                        <View style={styles.colFreq}><Text style={styles.colTextBold}>Freq</Text></View>
                        <View style={styles.colDays}><Text style={styles.colTextBold}>Days</Text></View>
                        <View style={styles.colInstr}><Text style={styles.colTextBold}>Instructions</Text></View>
                    </View>

                    {medicines.map((med, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.colNo}><Text style={styles.colText}>{i + 1}</Text></View>
                            <View style={styles.colMed}><Text style={styles.colTextBold}>{med.name}</Text></View>
                            <View style={styles.colDose}><Text style={styles.colText}>{med.dosage}</Text></View>
                            <View style={styles.colFreq}><Text style={styles.colText}>{med.frequency}</Text></View>
                            <View style={styles.colDays}><Text style={styles.colText}>{med.duration}</Text></View>
                            <View style={styles.colInstr}><Text style={styles.colText}>{med.notes || 'After Food'}</Text></View>
                        </View>
                    ))}
                    {/* Removed empty row filler to prevent wasting space */}
                </View>
            </View>

            {/* Advice - 1.5 line space (approx 15-20pt) after medicines */}
            <View style={{ marginTop: 20, marginBottom: 10 }}>
                {/* Removed accent separator for advice to keep it compact as requested "immediate space"? Or keep standard? LaTeX usually has sections. User said "1.5 line space must be advice". keeping section header for clarity but close. */}
                <Text style={styles.sectionHeader}>Advice</Text>
                {advice ? advice.split('\n').map((line, i) =>
                    <Text key={i} style={styles.listItem}>• {line}</Text>
                ) : (
                    <Text style={styles.listItem}>• Avoid Oily and Spicy Food</Text>
                )}
            </View>

            {/* Footer - Immediate right end */}
            <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                <View style={styles.signatureLine} />
                <Text style={styles.docSignature}>Doctor Signature</Text>
            </View>

        </Page>
    </Document>
);

export default PrescriptionPDF;
