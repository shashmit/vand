import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Switch, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from '../ui/GlassView';
import { colors } from '../../theme/colors';

interface CalibrateRadarModalProps {
  visible: boolean;
  onClose: () => void;
  onActivate: () => void;
}

export const CalibrateRadarModal = ({ visible, onClose, onActivate }: CalibrateRadarModalProps) => {
  const [seatBelt, setSeatBelt] = React.useState(false);
  const [identity, setIdentity] = React.useState<'Male' | 'Female' | 'Non-Binary'>('Male');
  const [seeking, setSeeking] = React.useState<'Men' | 'Women' | 'Everyone'>('Women');
  const [relationship, setRelationship] = React.useState<'Monogamous' | 'ENM' | 'Open' | 'Short-term'>('Monogamous');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <GlassView style={styles.modalView} intensity="thick" borderRadius={24}>
          <Text style={styles.modalTitle}>Calibrate Your Radar</Text>
          <Text style={styles.modalBody}>To find a Co-Pilot, we need a few details.</Text>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            {/* Identity */}
            <View style={styles.row}>
              <Text style={styles.label}>I am</Text>
              <View style={styles.options}>
                {(['Male', 'Female', 'Non-Binary'] as const).map((opt) => (
                  <Pressable key={opt} onPress={() => setIdentity(opt)} style={[styles.option, identity === opt && styles.selectedOption]}>
                    <Text style={[styles.optionText, identity === opt && styles.selectedOptionText]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Seeking */}
            <View style={styles.row}>
              <Text style={styles.label}>Seeking</Text>
              <View style={styles.options}>
                {(['Men', 'Women', 'Everyone'] as const).map((opt) => (
                  <Pressable key={opt} onPress={() => setSeeking(opt)} style={[styles.option, seeking === opt && styles.selectedOption]}>
                    <Text style={[styles.optionText, seeking === opt && styles.selectedOptionText]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

             {/* Relationship */}
             <View style={styles.row}>
              <Text style={styles.label}>Style</Text>
              <View style={styles.options}>
                {(['Monogamous', 'ENM', 'Open', 'Short-term'] as const).map((opt) => (
                  <Pressable key={opt} onPress={() => setRelationship(opt)} style={[styles.option, relationship === opt && styles.selectedOption]}>
                    <Text style={[styles.optionText, relationship === opt && styles.selectedOptionText]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Seat Belt Rule */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>The "Seat Belt" Rule</Text>
                <Text style={styles.toggleSub}>Only show people within 100 miles</Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: colors.dashboard.coPilot }}
                thumbColor={seatBelt ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setSeatBelt}
                value={seatBelt}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={onActivate}
            style={styles.activateButton}
            activeOpacity={0.8}
          >
            <Text style={styles.activateButtonText}>Activate Co-Pilot</Text>
          </TouchableOpacity>
        </GlassView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalView: {
    width: '100%',
    padding: 16,
    paddingBottom: 110, // Increased padding to account for Tab Bar
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.4)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    gap: 20,
    marginBottom: 32,
  },
  row: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedOption: {
    backgroundColor: colors.dashboard.coPilot,
    borderColor: colors.dashboard.coPilot,
  },
  optionText: {
    color: colors.text.primary,
    fontSize: 14,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  toggleSub: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  activateButton: {
    backgroundColor: colors.dashboard.coPilot,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  activateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
