# Wellness Hospital & Pharmacy ERP System

A comprehensive, multi-portal healthcare management system designed for seamless hospital operations, pharmacy management, and patient care.

## 🏗️ Project Architecture

This is a monorepo containing five specialized portals, each tailored to specific user roles:

1.  **[Hospital Portal](./wellness_hospital)**: Patient-facing platform for booking appointments, viewing medical records, and accessing lab reports.
2.  **[Pharmacy Portal](./wellness_pharmacy)**: Comprehensive billing and inventory system with A5 invoice support and barcode integration.
3.  **[Admin Portal](./wellness_admin)**: Centralized management for staff, hospital settings, inventory, and financial reporting.
4.  **[Doctor Portal](./wellness_doctor)**: Clinical interface for doctors to manage appointments and issue digital prescriptions.
5.  **[Staff Portal](./wellness_staff)**: Operational interface for hospital staff to manage daily tasks.

---

## 🚀 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via AWS RDS)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React
- **Hosting**: AWS Amplify

---

## ✨ Key Features

### Pharmacy Management
- **Smart Billing**: Point-of-Sale with barcode support.
- **Flexible Discounts**: Support for percentage-based and fixed discounts.
- **A5 Invoice Printing**: Optimized GST-compliant invoices designed for A5 paper.
- **Inventory Tracking**: Real-time stock management and expiry alerts.

### Patient Care
- **Appointment Booking**: Easy scheduling with specialized departments.
- **Medical Records**: Secure access to prescriptions and past visits.
- **Digital Reports**: Access lab results directly from the patient portal.

### Administration
- **Staff Management**: Role-based access control (RBAC).
- **Settings Control**: Global GST and hospital profiling.
- **Audit Logs**: Secure tracking of billing and inventory changes.

---

## 🛠️ Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Prashi12378/Wellness_Hospital.git
    ```

2.  **Navigate to a portal** (e.g., Pharmacy):
    ```bash
    cd wellness_pharmacy
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Set up Environment Variables**:
    Create a `.env` file with your `DATABASE_URL` and `NEXTAUTH_SECRET`.

5.  **Run the development server**:
    ```bash
    npm run dev
    ```

---

## 📄 License

Internal project for Wellness Hospital & Pharmacy. All rights reserved.
