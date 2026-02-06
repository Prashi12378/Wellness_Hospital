# Deployment Master Plan

## 1. Prerequisites (Critical)
*   [ ] **GitHub Repository:** Your code must be pushed to GitHub.
*   [ ] **Vercel Account:** Create an account at [vercel.com](https://vercel.com).
*   [ ] **GoDaddy Access:** Logic to manage DNS records.

## 2. Database Connectivity (The "Vercel Issue")
**Problem:** You locked the AWS database to "My IP". Vercel's servers change IPs constantly, so they will be blocked.
**Solution:**
1.  Go to AWS Console > RDS > Security Groups.
2.  Edit Inbound Rules.
3.  **Warning:** For Vercel to work easily, you must add a rule allowing:
    *   **Type:** PostgreSQL (5432)
    *   **Source:** `0.0.0.0/0` (Anywhere)
    *   *Note: Ensure you have a strong password (which you do).*

## 3. GitHub Structure
We need to know if you have one big repo or separate ones.
*   **Recommended:** One "Monorepo" (one git repo containing all folders).
*   **Action:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    # Create repo on GitHub website...
    git remote add origin <your-github-url>
    git push -u origin main
    ```

## 4. Vercel Deployment (Repeat 5 Times)
You will create 5 separate projects in Vercel, pointing to the same GitHub repo but different **Root Directories**.

### A. Hospital Portal (Main Website)
*   **Name:** `wellness-hospital`
*   **Root Directory:** `wellness-hospital`
*   **Environment Variables:**
    *   `DATABASE_URL`: (Your AWS URL)
    *   `NEXTAUTH_URL`: `https://your-domain.com` (Update this AFTER you get the domain connected)
    *   `NEXTAUTH_SECRET`: (Copy from .env)

### B. Admin Portal
*   **Name:** `wellness-admin`
*   **Root Directory:** `wellness-admin`
*   **Environment Variables:**
    *   `DATABASE_URL`: (Your AWS URL)
    *   `NEXTAUTH_URL`: `https://admin.your-domain.com`

*(Repeat for Doctor `doctor.`, Pharmacy `pharmacy.`, Staff `staff.`)*

## 5. Domain Configuration (GoDaddy)
Once deployed, Vercel gives you random URLs (e.g., `wellness-hospital.vercel.app`). You want `wellnesshospital.com`.

### In Vercel (For Hospital Project):
1.  Settings > Domains.
2.  Add `your-domain.com`.
3.  Vercel will give you an **A Record** (e.g., `76.76.21.21`) and a **CNAME**.

### In Vercel (For Admin Project):
1.  Settings > Domains.
2.  Add `admin.your-domain.com`.

### In GoDaddy (DNS Management):
1.  **A Record (@):** Value `76.76.21.21` (Vercel IP).
2.  **CNAME (www):** Value `cname.vercel-dns.com`.
3.  **CNAME (admin):** Value `cname.vercel-dns.com`.
4.  **CNAME (doctor):** Value `cname.vercel-dns.com`.
5.  **CNAME (pharmacy):** Value `cname.vercel-dns.com`.
6.  **CNAME (staff):** Value `cname.vercel-dns.com`.

## 6. Final Config Update
After domains are active, you must update the `NEXTAUTH_URL` environment variable in Vercel for each project to match the real domain (e.g., change `localhost:3000` to `https://wellnesshospital.com`) and redeploy.
