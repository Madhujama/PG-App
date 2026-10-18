# PG Management Android APK builder

This Android WebView app opens the existing PG Management site:
https://heartfelt-starburst-e976e2.netlify.app/

It is configured for internet use with the existing Netlify + Supabase app. It includes a file picker for resident photo/ID uploads and a bridge to save JavaScript Blob downloads (such as Excel exports) to the phone's Downloads folder.

## Build an APK using GitHub (no Android Studio needed)

1. On your phone or computer, sign in to GitHub and create a **new private repository** named `pg-management-android`.
2. Upload all files and folders from this project into the repository, keeping the `.github/workflows/build-apk.yml` file in place. On GitHub mobile, the easiest way is usually to use a computer or GitHub's web upload in desktop mode.
3. Open the repository's **Actions** tab. If GitHub asks to enable workflows, enable them.
4. Choose **Build PG Management APK** and tap **Run workflow** (or wait for the first push build to run).
5. When the run finishes with a green check, open that run and scroll to **Artifacts**.
6. Download `PG-Management-Android-APK`, unzip it, and find `app-debug.apk`.
7. Transfer `app-debug.apk` to the Android phone, open it, and approve **Install unknown apps** if Android asks.

## Important

- This is a debug APK for personal use/testing, not a Play Store release.
- The APK loads the live Netlify website; it does not make Supabase data available offline. Internet is needed for live data.
- Keep Supabase RLS policies enabled. Never put a Supabase service-role key in the app.
- Test login/admin access, resident photo/ID upload, and Excel export after installation.
- The APK's site address is defined in `app/src/main/java/com/pgmanager/app/MainActivity.java` as `APP_URL`.
