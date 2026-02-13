import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ToastConfig } from "react-native-toast-message";
import { CheckCircle, XCircle, Info } from "lucide-react-native";
import { colors } from "../../theme/colors";

const CustomToast = ({
  type,
  text1,
  text2,
}: {
  type: "success" | "error" | "info";
  text1?: string;
  text2?: string;
}) => {
  let Icon = Info;
  let iconColor = colors.text.primary as string;

  if (type === "success") {
    Icon = CheckCircle;
    iconColor = "#4CAF50"; // Green
  } else if (type === "error") {
    Icon = XCircle;
    iconColor = colors.error;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={24} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  text2: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => <CustomToast type="success" text1={text1} text2={text2} />,
  error: ({ text1, text2 }) => <CustomToast type="error" text1={text1} text2={text2} />,
  info: ({ text1, text2 }) => <CustomToast type="info" text1={text1} text2={text2} />,
};
