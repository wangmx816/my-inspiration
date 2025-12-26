Project Overview

This is a React Native expense tracker app built with Expo. It allows users to track their expenses, manage wallets, and view statistics. The app uses Supabase for authentication and Firestore for the database. It also includes features like image uploading for receipts and internationalization with lingui.

Key Technologies:

- Framework: React Native with Expo
- Authentication: Supabase Authentication
- Database: Firestore
- Routing: Expo Router (file-based)
- UI: React Native components, expo-blur, expo-linear-gradient, react-native-gifted-charts
- Internationalization: lingui
- Image Handling: expo-image-picker, expo-image
- State Management: React Context API (authContext.tsx)
  
Architecture:

The app follows a standard React Native project structure.

- app/: Contains the screens and routing configuration.
  - (auth)/: Authentication-related screens (login, register, welcome).
  - (modals)/: Modal screens for creating/editing transactions, wallets, etc.
  - (tabs)/: Main screens accessible through a tab navigator (home, statistics, wallet, profile).
- components/: Reusable UI components.
- config/: Supabase configuration.
- constants/: Theme colors, data, and other constants.
- contexts/: React context for authentication.
- hooks/: Custom hooks.
- lib/: Internationalization setup.
- locales/: Translation files.
- services/: Services for interacting with Supabase and other APIs.
- utils/: Utility functions.
- notes/: Technology notes in Markdown.
- only write the note when necessary, e.g. implements big feature or fix hard bug
  - should use bash script to get current date
  - the filename should start with date format yyyy-MM-dd
  - related notes should be grouped together in the one file
    
Building and Running

1. Install Dependencies:

npm install

2. Start the App:

npx expo start

This will open the Expo developer tools in your browser. You can then run the app on:

- An Android emulator
- An iOS simulator
- Expo Go on a physical device
  
3. Other Commands:

- Run on Android: npm run android
- Run on iOS: npm run ios
- Run on Web: npm run web
- Run tests: npm run test
- Lint files: npm run lint
- Extract translations: npm run extract
- Compile translations: npm run compile
  
Development Conventions

- Routing: The project uses file-based routing with Expo Router. New screens can be created by adding files to the app directory.
- Styling: The project uses a combination of StyleSheet and a custom theme defined in constants/theme.ts.
- Internationalization: The project uses lingui for internationalization. To add new translations, edit the files in the locales directory and then run npm run extract and npm run compile.
- Authentication: Authentication is handled by Supabase Authentication and the authContext.tsx context.
- Database: The project uses Firestore as its database. The database logic is located in the services directory.