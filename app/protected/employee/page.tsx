"use client";

import { View, useTheme } from "@aws-amplify/ui-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Suspense } from "react";

function EmployeeContent() {
  const { tokens } = useTheme();
  const { translations } = useLanguage();

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      {/* Content will be rendered in the layout */}
    </View>
  );
}

export default function EmployeePage() {
  return (
    <Suspense>
      <EmployeeContent />
    </Suspense>
  );
} 