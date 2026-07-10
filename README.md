# SplitSync

> A modern **React Native expense splitting application** powered by **Firebase Authentication** and **Cloud Firestore**, with built-in **UPI payment integration** for seamless expense settlement.

## Overview

SplitSync is a Splitwise-inspired Android application built using **React Native** and **TypeScript**. It allows users to create groups, split expenses, track balances, and settle payments through any installed UPI application.

Unlike traditional expense trackers, SplitSync uses **Firebase Authentication** for OTP-based login and **Cloud Firestore** for real-time synchronization, ensuring every participant always has the latest balances without requiring a custom backend.

---

## Features

### Authentication
- Phone number login using Firebase Authentication
- OTP verification
- Persistent login sessions
- Automatic user profile creation

### Expense Management
- Create individual and group expenses
- Equal expense splitting
- Automatic balance calculations
- Real-time synchronization

### Groups
- Create groups
- Add participants
- Shared expense tracking
- Individual balance summaries

### Payments
- One-click UPI payments
- Android UPI Deep Link integration
- Supports Google Pay, PhonePe, Paytm, BHIM and any compatible UPI app

### Dashboard
- Total balance overview
- "You Owe" summary
- "You Are Owed" summary
- Expense history
- Group history

---

# Tech Stack

| Category | Technology |
|----------|------------|
| Mobile | React Native, TypeScript |
| Navigation | React Navigation |
| Backend | Firebase Authentication, Cloud Firestore |
| Platform | Android |
| Payments | Android UPI Deep Links |

---

# Project Structure

```text
SplitSync/
│
├── android/
├── ios/
├── src/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   └── utils/
│
├── App.tsx
├── package.json
└── firebase.json
```

---

# System Architecture

```text
                   Firebase Authentication
                            │
                      Phone OTP Login
                            │
                            ▼
                     React Native App
                     /               \
                    ▼                 ▼
          Cloud Firestore       UPI Deep Links
                 │                    │
                 ▼                    ▼
         Real-time Sync        Installed UPI Apps
```

---

# Authentication Flow

```text
User
 │
 ▼
Enter Phone Number
 │
 ▼
Receive OTP
 │
 ▼
Firebase Verification
 │
 ▼
Authenticated
 │
 ▼
Create / Load Firestore Profile
```

---

# Expense Flow

```text
Create Expense
      │
      ▼
Select Members
      │
      ▼
Split Amount
      │
      ▼
Save to Firestore
      │
      ▼
Realtime Balance Updates
```

---

# Firestore Schema

```text
users/
    uid/
        name
        phone

groups/
    groupId/
        name
        members[]
        createdBy

expenses/
    expenseId/
        amount
        paidBy
        participants[]
        groupId
        description
        timestamp

balances/
    userId/
        owes{}
        owed{}
```

---

# Prerequisites

- Node.js 18+
- npm
- React Native CLI
- Android Studio
- Java 17
- Firebase Project

---

# Firebase Setup

1. Create a Firebase project.
2. Enable **Phone Authentication**.
3. Enable **Cloud Firestore**.
4. Download `google-services.json`.
5. Place it inside:

```text
android/app/google-services.json
```

6. Add SHA-1 and SHA-256 fingerprints.
7. Sync Gradle and rebuild the project.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/SplitSync.git
cd SplitSync
```

Install dependencies:

```bash
npm install
```

Start Metro:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

---

# Building a Release APK

```bash
cd android
./gradlew assembleRelease
```

Generated APK:

```text
android/app/build/outputs/apk/release/app-release.apk
```

---

# UPI Integration

SplitSync launches installed UPI applications using Android UPI Deep Links.

Example:

```text
upi://pay?pa=<upi_id>&pn=<receiver>&am=<amount>&tn=<note>
```

---

# Current Limitations

- Android only
- No payment verification after UPI completion
- No offline mode
- No custom backend

---

# Future Improvements

- Expense categories
- Receipt OCR
- Monthly analytics
- Push notifications
- iOS support
- Payment verification backend


---

# License

MIT License

---

# Author

**Anubhav Sharma**

GitHub: https://github.com/shrmaanubhav
