# Vercel Deployment Guide

## 1. Prerequisites
*   **GitHub Account**: You need a GitHub account to host your code.
*   **Vercel Account**: Sign up at [vercel.com](https://vercel.com) handling using your GitHub account.
*   **Netgsm Account** (Optional but recommended for SMS): You need your Usercode and Password.
*   **Postgres Database**: You already have a database URL (Supabase/Neon etc.) from your `schema.prisma`.

## 2. Push Code to GitHub
1.  Initialize Git (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit - No AI Version"
    ```
2.  Create a new repository on GitHub.
3.  Link and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin master
    ```

## 3. Deploy to Vercel
1.  Go to **Vercel Dashboard** -> **Add New...** -> **Project**.
2.  Import your GitHub repository.
3.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `alo-kuafor-main` (If asked. If your repo *is* the folder, leave default `./`).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
    *   **Install Command**: `npm install`

4.  **Environment Variables (CRITICAL)**:
    Add the following variables in the "Environment Variables" section:

    | Key | Value Description |
    | :--- | :--- |
    | `DATABASE_URL` | Your production database connection string (start with `postgres://...`) |
    | `DIRECT_URL` | Same as above (or direct connection string if using Supabase) |
    | `JWT_SECRET` | A random secret key (e.g., `s3cr3t_k3y_123`) |
    | `FACEBOOK_APP_SECRET` | Your Facebook App Secret (for WhatsApp Webhook security) |
    | `NETGSM_USER` | Your Netgsm Usercode (e.g., `850xxxxxxx`) |
    | `NETGSM_PASSWORD` | Your Netgsm Password |
    | `NETGSM_HEADER` | Your SMS Header (e.g., `850xxxxxxx`) |

    **Note**: You do NOT need `GEMINI_API_KEY` anymore!

5.  Click **Deploy**.

## 4. Connect WhatsApp Webhook
1.  Once deployed, your URL will be like `https://your-project.vercel.app`.
2.  Go to **Meta Developers Portal** -> **WhatsApp** -> **Configuration**.
3.  **Edit Webhook**:
    *   **Callback URL**: `https://your-project.vercel.app/api/whatsapp/webhook`
    *   **Verify Token**: `my_secure_verify_token_123` (Hardcoded in our new code for simplicity).
4.  **Verify & Save**.
5.  **Manage Fields**: Subscribe to `messages`.

## 5. Test It!
1.  Open WhatsApp and message your test number.
2.  Type "Merhaba".
3.  The **Smart Menu** (Buttons) should appear instantly!
