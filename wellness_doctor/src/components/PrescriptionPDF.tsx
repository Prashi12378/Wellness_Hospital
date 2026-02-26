import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: '1.2cm',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#111111',
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: 20,
    },
    hospitalTitle: {
        fontSize: 27, // ~36px
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    address: {
        fontSize: 10.5, // ~14px
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    mainLine: {
        borderTopWidth: 3,
        borderTopColor: '#000000',
        marginVertical: 15,
    },
    // Top Section
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    patientArea: {
        width: '68%',
    },
    infoRow: {
        marginBottom: 10,
    },
    label: {
        fontSize: 9, // ~12px
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    valueLine: {
        height: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#aaaaaa',
        fontSize: 10.5, // ~14px
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    vitalsCard: {
        width: '28%',
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 8,
        overflow: 'hidden',
    },
    vitalsHeader: {
        backgroundColor: '#eeeeee',
        textAlign: 'center',
        paddingVertical: 6,
        fontSize: 9, // ~12px
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1,
    },
    vitalsBody: {
        padding: 10,
    },
    vitalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontSize: 10.5, // ~14px
    },
    // Sections
    sectionTitle: {
        marginTop: 20,
        fontSize: 12, // ~16px
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    sectionLine: {
        borderTopWidth: 2,
        borderTopColor: '#000000',
        marginTop: 4,
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 10.5, // ~14px
        lineHeight: 1.4,
    },
    // Rx Table
    table: {
        width: '100%',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        paddingBottom: 4,
    },
    headerCell: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        paddingVertical: 8,
        alignItems: 'center',
    },
    cellText: {
        fontSize: 10,
    },
    // Utility Columns
    colNo: { width: '8%' },
    colMed: { width: '40%' },
    colStrength: { width: '12%' },
    colFreq: { width: '10%' },
    colDays: { width: '10%' },
    colNotes: { width: '20%' },
    // Footer
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    signatureBlock: {
        textAlign: 'right',
    },
    signedBy: {
        fontSize: 8,
        color: '#888888',
        marginBottom: 2,
    },
    doctorNameFull: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    consultant: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#888888',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

interface PrescriptionPDFProps {
    appointment: any;
    existingPrescription: any;
    medicines: any[];
    vitals: any;
    notes: string;
    diagnosis: string;
    advice: string;
    qualification: string;
    speciality: string;
    regNo: string;
    date?: string;
    patientName?: string;
    patientAge?: string;
    patientGender?: string;
    patientId?: string;
    doctorName?: string;
}

const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({
    appointment,
    existingPrescription,
    medicines,
    vitals,
    notes,
    diagnosis,
    advice,
    qualification,
    speciality,
    regNo,
    date,
    patientName,
    patientAge,
    patientGender,
    patientId,
    doctorName
}) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Image src={typeof window !== 'undefined' ? window.location.origin + '/logo.png' : ''} style={styles.logo} />
                <View>
                    <Text style={styles.hospitalTitle}>WELLNESS HOSPITAL</Text>
                    <Text style={styles.address}>Palanajoghalli, Mallathalli Post, Doddaballapura</Text>
                    <Text style={[styles.address, { color: '#666' }]}>Karnataka - 561203 | Ph: +91 6366662245</Text>
                </View>
            </View>

            <View style={styles.mainLine} />

            {/* Top Section */}
            <View style={styles.topSection}>
                <View style={styles.patientArea}>
                    <View style={[styles.infoRow, { flexDirection: 'row', gap: 15 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>PATIENT NAME</Text>
                            <Text style={styles.valueLine}>{patientName || appointment?.patient_name || '___'}</Text>
                        </View>
                        <View style={{ width: 100 }}>
                            <Text style={styles.label}>AGE / GEN</Text>
                            <Text style={[styles.valueLine, { textAlign: 'center' }]}>{patientAge || '_'} / {(patientGender?.charAt(0) || '_').toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={[styles.infoRow, { flexDirection: 'row', gap: 15 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>PATIENT ID</Text>
                            <Text style={styles.valueLine}>{patientId || appointment?.user_id?.slice(0, 8) || '___'}</Text>
                        </View>
                        <View style={{ width: 100 }}>
                            <Text style={styles.label}>DATE</Text>
                            <Text style={[styles.valueLine, { textAlign: 'center' }]}>{date ? new Date(date).toISOString().split('T')[0] : '___'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>CONSULTING SPECIALIST</Text>
                        <Text style={[styles.valueLine, { fontSize: 14 }]}>
                            DR. {(doctorName || existingPrescription?.doctor_name || appointment?.doctors?.first_name || 'NIKITHA').replace(/^Dr\.\s+/i, '').toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.vitalsCard}>
                    <View style={styles.vitalsHeader}>
                        <Text>CLINICAL VITALS</Text>
                    </View>
                    <View style={styles.vitalsBody}>
                        <View style={styles.vitalsRow}>
                            <Text>BP</Text>
                            <Text>{(vitals?.bp_sys && vitals?.bp_dia) ? `${vitals.bp_sys}/${vitals.bp_dia}` : '___ / ___'} mmHg</Text>
                        </View>
                        <View style={styles.vitalsRow}>
                            <Text>SpO2</Text>
                            <Text>{vitals?.spo2 || '___'} %</Text>
                        </View>
                        <View style={styles.vitalsRow}>
                            <Text>Pulse</Text>
                            <Text>{vitals?.pulse || '___'} BPM</Text>
                        </View>
                        <View style={styles.vitalsRow}>
                            <Text>Temp</Text>
                            <Text>{vitals?.temp || '___'} °F</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Clinical Sections */}
            <View>
                <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
                <View style={styles.sectionLine} />
                <Text style={[styles.sectionContent, { fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }]}>
                    {diagnosis || 'GENERAL CONSULTATION'}
                </Text>
            </View>

            <View>
                <Text style={styles.sectionTitle}>CHIEF COMPLAINTS (C/O)</Text>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionContent}>{notes || 'No specific complaints recorded.'}</Text>
            </View>

            <View>
                <Text style={styles.sectionTitle}>PRESCRIPTION (RX)</Text>
                <View style={styles.sectionLine} />
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.colNo]}>NO</Text>
                        <Text style={[styles.headerCell, styles.colMed]}>MEDICINE NAME</Text>
                        <Text style={[styles.headerCell, styles.colStrength]}>STRENGTH</Text>
                        <Text style={[styles.headerCell, styles.colFreq]}>FREQ</Text>
                        <Text style={[styles.headerCell, styles.colDays]}>DAYS</Text>
                        <Text style={[styles.headerCell, styles.colNotes]}>NOTES</Text>
                    </View>
                    {medicines.map((med, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[styles.cellText, styles.colNo, { color: '#888' }]}>{i + 1}</Text>
                            <Text style={[styles.cellText, styles.colMed, { fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }]}>{med.name}</Text>
                            <Text style={[styles.cellText, styles.colStrength]}>{med.strength}</Text>
                            <Text style={[styles.cellText, styles.colFreq]}>{med.frequency}</Text>
                            <Text style={[styles.cellText, styles.colDays]}>{med.duration}</Text>
                            <Text style={[styles.cellText, styles.colNotes, { fontSize: 8 }]}>{med.notes}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View>
                <Text style={styles.sectionTitle}>MEDICAL ADVICE & INSTRUCTIONS</Text>
                <View style={styles.sectionLine} />
                {advice ? advice.split('\n').filter(l => l.trim()).map((line, i) =>
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={{ width: 10 }}>•</Text>
                        <Text style={styles.sectionContent}>{line}</Text>
                    </View>
                ) : (
                    <Text style={[styles.sectionContent, { color: '#888' }]}>Follow-up as scheduled.</Text>
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.signatureBlock}>
                    <Text style={styles.signedBy}>Digitally signed by</Text>
                    <Text style={styles.doctorNameFull}>
                        DR. {(existingPrescription?.doctor_name || appointment?.doctors?.first_name || 'NIKITHA').replace(/^Dr\.\s+/i, '').toUpperCase()}
                    </Text>
                    <Text style={styles.consultant}>MEDICAL CONSULTANT</Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default PrescriptionPDF;
