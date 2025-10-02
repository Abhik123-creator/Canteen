# Firebase Setup Guide for Canteen App

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "canteen-app")
4. Disable Google Analytics (optional for this project)
5. Click "Create Project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode" (recommended)
4. Choose a location for your database (select the closest to your users)

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Enter app nickname (e.g., "canteen-web-app")
6. Click "Register app"
7. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## Step 4: Update Your App Configuration

1. Open `index.html` in your project
2. Find the `firebaseConfig` object (around line 15)
3. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-real-api-key",
  authDomain: "your-real-project-id.firebaseapp.com",
  projectId: "your-real-project-id",
  storageBucket: "your-real-project-id.appspot.com",
  messagingSenderId: "your-real-sender-id",
  appId: "your-real-app-id"
};
```

## Step 5: Set Up Firestore Security Rules (Important!)

1. In Firebase Console, go to "Firestore Database"
2. Click on "Rules" tab
3. For development, you can use these rules (⚠️ **NOT for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to canteen collection for development
    match /canteen/{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, use more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users to access canteen data
    match /canteen/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 6: Deploy Your App

### Option 1: Firebase Hosting (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project directory:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Choose your public directory (use `.` for current directory)
   - Configure as single-page app: Yes
   - Set up automatic builds: No

4. Deploy:
   ```bash
   firebase deploy
   ```

### Option 2: Any Static Hosting Service

Since your app now runs entirely on the frontend, you can host it on:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Just upload these files:
- `index.html`
- `app.js`
- `style.css`

## Step 7: Test Your App

1. Open your deployed app or run it locally by opening `index.html` in a browser
2. The app should automatically create a new document in Firestore when you first add data
3. Check your Firestore console to see the data being stored

## Data Structure in Firestore

Your data will be stored in Firestore as a single document:
- Collection: `canteen`
- Document: `expenses`
- Fields: All your current data structure (fund, remaining, friends, expenses, etc.)

## Benefits of This Migration

✅ **No Node.js server required**
✅ **Real-time data sync** (multiple users can use the app simultaneously)
✅ **Automatic backups** (Firebase handles data persistence)
✅ **Scalable** (Firebase scales automatically)
✅ **Offline support** (Firebase provides offline capabilities)
✅ **Free tier** (Generous free usage limits)

## Troubleshooting

- **CORS errors**: Make sure you're accessing the app via HTTP/HTTPS, not file://
- **Configuration errors**: Double-check your Firebase config values
- **Permission errors**: Verify your Firestore security rules
- **Network errors**: Check your internet connection and Firebase project status

## Files No Longer Needed

After successful migration, you can delete:
- `server.js`
- `package.json`
- `data.json`
- `firebase-config.js` (configuration is now in index.html)

The app now runs entirely in the browser! 🎉