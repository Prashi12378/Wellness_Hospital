# AWS Amplify Deployment Guide (Monorepo)

Since you chose **AWS Amplify**, we can keep your database secure by keeping traffic within AWS (mostly) and using AWS's secure integration.

## 1. Prepare GitHub Repository
AWS Amplify pulls code directly from GitHub. You need to push your entire `WELLNESS_HOSPITAL` folder as one repository.

1.  **Initialize Git (if not done):**
    ```bash
    cd /Users/mackbookm2air/WELLNESS_HOSPITAL
    git init
    git add .
    git commit -m "Initial commit of all portals"
    ```
2.  **Create Repo on GitHub:** Go to GitHub.com, create a new repo (e.g., `wellness-hospital-system`).
3.  **Push:**
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/wellness-hospital-system.git
    git push -u origin main
    ```

## 2. Deploy "Hospital Portal" (First App)

1.  **Log in to AWS Console** -> Search for **AWS Amplify**.
2.  Click **"Create New App"** -> select **GitHub**.
3.  Authorize GitHub and select your `wellness-hospital-system` repository.
4.  **Monorepo Settings (Crucial):**
    *   Amplify should detect it's a monorepo.
    *   Check **"My app is a monorepo"**.
    *   **Monorepo root directory:** Enter `wellness-hospital` (This is the folder name).
5.  **Build Settings:**
    *   Amplify will auto-detect Next.js.
    *   Ensure the build command looks like `npm run build`.
6.  **Environment Variables:** (Expand the "Advanced Settings" section)
    *   Add variables from your `.env` file:
        *   `DATABASE_URL`: `postgresql://...` (Your AWS DB URL)
        *   `NEXTAUTH_URL`: `https://main.d12345.amplifyapp.com` (Amplify gives you a default URL first, update this later).
        *   `NEXTAUTH_SECRET`: (Copy from your local .env)
7.  Click **"Save and Deploy"**.

## 3. Deploy Other Portals
Repeat Step 2 for each portal, but change the **Monorepo root directory**:
*   For Admin: `wellness-admin`
*   For Doctor: `wellness-doctor`
*   For Pharmacy: `wellness-pharmacy`
*   For Staff: `wellness-staff`

## 4. Connecting Your Domain (GoDaddy)
Once all apps are deployed, you want `wellnesshospital.com` instead of the ugly Amplify URLs.

1.  In AWS Amplify Console, go to **Domain management**.
2.  Click **"Add domain"**.
3.  Enter `your-domain.com`.
4.  **Configure Subdomains:**
    *   `https://www.your-domain.com` -> Select "Hospital Portal" app.
    *   `https://your-domain.com` -> Select "Hospital Portal" app.
    *   `https://admin.your-domain.com` -> Select "Admin Portal" app.
    *   `https://doctor.your-domain.com` -> Select "Doctor Portal" app.
    *   ...and so on.
5.  **DNS Records:**
    *   Amplify will give you **CNAME** records.
    *   Go to **GoDaddy DNS Management**.
    *   Add the CNAME records exactly as shown.
    *   *Note: Using a root domain (no www) with CNAME on GoDaddy can be tricky. AWS usually recommends using `www` as the primary.*

## 5. Final Security Update
After you have your domains connected:
1.  Go back to **Environment Variables** for each app in Amplify.
2.  Update `NEXTAUTH_URL` to the **real domain** (e.g., `https://www.wellnesshospital.com` or `https://admin.wellnesshospital.com`).
3.  Trigger a **Redeploy** for the changes to take effect.

## 6. Database Security (The Payoff)
Once deployed, you can revisit your **AWS RDS Security Group**.
*   Instead of `0.0.0.0/0`, you can verify if the Amplify apps can connect. 
*   *Note:* standard Amplify hosting still uses public IPs, so you often still need `0.0.0.0/0` OR use **AWS VPC Peering** (which is an advanced setting).
*   **Simple Secure Alternative:** Since you are on AWS, you can trust AWS IPs, but the easiest "Safe" method is to keep the allow-list open BUT enforce **SSL** (which RDS does by default) and a **Password Rotation** policy.
