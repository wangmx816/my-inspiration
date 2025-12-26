Project: Expo React Native TypeScript Supabase ADDLLcat1On
General
This is an Expo application..
Use expo and bun for package manager.
Use NativeWind css for styling, prefer to use color pink-400 and sky-480, should consider dark mode and use text-foreground and bg-background.
Use sonner for toast.
Use Zustand for state management.
Use react-query for data fetching.
Use ~/components for path alias.
Use lucide-react-native for icons
.Use Lingui for il8n and prefer t`* macro
- import { Trans } from "@lingui/react/macro"
- import {t} from "@lingui/core/macro""
Use date fns for date formatting.
Use lodash for utility functions.
Component names are in CamelCase.
File Structure
app/(tabs): Main tabs..
hooks/: React hooks.
store/: Zustand store.
components/: Components.
components/ui: Pure UI Components.
db/supabase/: Supabase db logic.
utils/: Utils.