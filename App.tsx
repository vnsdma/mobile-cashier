import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CashierScreen } from "./src/screens/CashierScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <CashierScreen />
    </SafeAreaProvider>
  );
}
