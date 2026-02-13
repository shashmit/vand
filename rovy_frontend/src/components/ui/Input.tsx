import React from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Text,
  TouchableOpacity,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "../../theme/colors";

interface InputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input = <T extends FieldValues>({
  control,
  name,
  icon,
  containerStyle,
  autoCapitalize,
  autoCorrect,
  spellCheck,
  isPassword,
  style,
  ...props
}: InputProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const isMultiline = !!props.multiline;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={[styles.wrapper, containerStyle]}>
          <View
            style={[
              styles.container,
              isMultiline ? styles.containerMultiline : styles.containerSingle,
              error && styles.errorContainer,
            ]}
          >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <TextInput
              style={[styles.input, isMultiline ? styles.inputMultiline : styles.inputSingle, style]}
              placeholderTextColor={colors.text.muted}
              onBlur={onBlur}
              {...props}
              secureTextEntry={isPassword && !isPasswordVisible}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              spellCheck={spellCheck}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                props.onChangeText?.(text);
              }}
            />
            {isPassword && (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                {isPasswordVisible ? (
                  <EyeOff color={colors.text.muted} size={20} />
                ) : (
                  <Eye color={colors.text.muted} size={20} />
                )}
              </TouchableOpacity>
            )}
          </View>
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerSingle: {
    alignItems: "center",
    height: 56,
  },
  containerMultiline: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  errorContainer: {
    borderColor: colors.error,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
  },
  inputSingle: {
    height: "100%",
  },
  inputMultiline: {
    textAlignVertical: "top",
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
});
