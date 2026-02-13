import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, FlatList, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { colors } from '../../theme/colors';
import { GlassView } from '../ui/GlassView';
import { ControlStick } from './ControlStick';
import { CalibrateRadarModal } from './CalibrateRadarModal';
import { ProfileDetailSheet } from './ProfileDetailSheet';
import { LinearGradient } from 'expo-linear-gradient';
import { copilotService } from '../../services/copilot';
import Toast from 'react-native-toast-message';

const { height, width } = Dimensions.get('window');
const cardHeight = height - 160;

const DriverProfile = ({ item, onOpenDetails }: { item: any; onOpenDetails: () => void }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = item.photos && item.photos.length > 0 ? item.photos : [item.image];

  // Reset photo index when profile changes
  React.useEffect(() => {
    setPhotoIndex(0);
  }, [item.id]);

  const handleNextPhoto = () => {
    if (photoIndex < photos.length - 1) {
      setPhotoIndex(prev => prev + 1);
    } else {
      setPhotoIndex(0); // Loop back to start
    }
  };

  const handlePrevPhoto = () => {
    if (photoIndex > 0) {
      setPhotoIndex(prev => prev - 1);
    } else {
      setPhotoIndex(photos.length - 1); // Loop to end
    }
  };

  return (
    <View style={[styles.profileContainer, { paddingTop: 12, paddingBottom: 120 }]}>
      <View style={styles.card}>
        {/* Full Screen Image */}
        <Image source={{ uri: photos[photoIndex] || 'https://via.placeholder.com/800' }} style={styles.mainImage} />
        
        {/* Touch Zones for Paging */}
        <View style={styles.touchLayer}>
          <TouchableWithoutFeedback onPress={handlePrevPhoto}>
            <View style={styles.leftTouchZone} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={handleNextPhoto}>
            <View style={styles.rightTouchZone} />
          </TouchableWithoutFeedback>
        </View>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.5, 0.7, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />

        {/* Info Overlay */}
        <View style={styles.infoContainer}>
          {/* Tag */}
          <GlassView intensity="ultraThin" borderRadius={12} style={styles.tag}>
            <Text style={styles.tagText}>📍 {item.distance} away</Text>
          </GlassView>

          {/* Identity - Tap to open details */}
          <TouchableOpacity onPress={onOpenDetails} activeOpacity={0.8}>
            <Text style={styles.nameText}>{item.name}, {item.age}</Text>
            <Text style={styles.vehicleText}>{item.vehicle} • {item.identity || 'Nomad'}</Text>
          </TouchableOpacity>

          {/* Vibe Bio */}
          <Text style={styles.bioText}>{item.vibe}</Text>
        </View>

        {/* Navigation Dots */}
        <View style={styles.navDots}>
          {photos.map((_: any, index: number) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                index === photoIndex && styles.activeDot
              ]} 
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export const CoPilotView = () => {
  const [modalVisible, setModalVisible] = useState(false); 
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState<{ id: string; name: string; image?: string } | null>(null);
  const [matchedDriver, setMatchedDriver] = useState<{ id: string; name: string; image?: string } | null>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await copilotService.getFeed();
      setDrivers(data);
      if (isRefresh) {
        setActiveIndex(0);
      }
    } catch (e) {
      console.error(e);
      // Fallback or empty state handled by UI
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const handleActivate = () => {
    setModalVisible(false);
  };

  const removeCurrentProfile = () => {
    // If we are at the end of the list or have only 1 item, refresh
    if (drivers.length <= 1) {
      setDrivers([]); // Clear to show loading
      loadDrivers();
      return;
    }

    setDrivers(prev => {
      const newDrivers = [...prev];
      // Remove the item at the current index
      if (activeIndex >= 0 && activeIndex < newDrivers.length) {
        newDrivers.splice(activeIndex, 1);
      }
      return newDrivers;
    });
  };

  const handlePass = async () => {
    const currentDriver = drivers[activeIndex];
    if (!currentDriver) return;

    try {
      // Optimistic update
      removeCurrentProfile();
      
      // API Call
      await copilotService.swipe(currentDriver.id, 'PASS');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async () => {
    const currentDriver = drivers[activeIndex];
    if (!currentDriver) return;

    try {
      removeCurrentProfile();
      const res = await copilotService.swipe(currentDriver.id, 'LIKE');
      if (res.isMatch) {
          setMatchedDriver({
            id: currentDriver.id,
            name: currentDriver.name,
            image: currentDriver.image
          });
          setMatchModalVisible(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessage = () => {
    const currentDriver = drivers[activeIndex];
    if (!currentDriver) return;
    setMessageTarget({ id: currentDriver.id, name: currentDriver.name, image: currentDriver.image });
    setMessageModalVisible(true);
  };

  const sendNiceMessage = async () => {
    if (!messageTarget || !messageText.trim()) return;

    try {
        setMessageModalVisible(false);
        Toast.show({ type: 'info', text1: 'Sending message...' });
        
        await copilotService.message(messageTarget.id, messageText);
        
        Toast.show({ type: 'success', text1: 'Message sent!' });
        setMessageText('');
        setMessageTarget(null);
        removeCurrentProfile();
    } catch (e) {
        Toast.show({ type: 'error', text1: 'Failed to send message' });
        console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {drivers.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={drivers}
          renderItem={({ item }) => (
            <DriverProfile 
              item={item} 
              onOpenDetails={() => setDetailsVisible(true)}
            />
          )}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={cardHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadDrivers(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor="#1c1c1e"
            />
          }
        />
      ) : (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 20 }}>No active Co-Pilots nearby.</Text>
            <TouchableOpacity onPress={() => loadDrivers()} style={{ padding: 10, backgroundColor: '#333', borderRadius: 8 }}>
                <Text style={{ color: colors.primary }}>Refresh Radar</Text>
            </TouchableOpacity>
        </View>
      )}

      {/* Control Stick Action Bar */}
      {!modalVisible && !detailsVisible && !messageModalVisible && !matchModalVisible && drivers.length > 0 && (
        <ControlStick 
          onPass={handlePass}
          onLike={handleLike}
          onMessage={handleMessage}
        />
      )}

      <CalibrateRadarModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onActivate={handleActivate}
      />

      {/* Profile Details Sheet */}
      {drivers.length > 0 && (
        <ProfileDetailSheet
          driverId={drivers[activeIndex]?.id}
          initialData={drivers[activeIndex]}
          isOpen={detailsVisible}
          onClose={() => setDetailsVisible(false)}
        />
      )}

      {/* Message Modal */}
      <Modal visible={messageModalVisible} transparent animationType="slide" onRequestClose={() => setMessageModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
            <View style={styles.messageCard}>
                <View style={styles.messageHeader}>
                    <Text style={styles.modalTitle}>Send a Nice Message</Text>
                    <TouchableOpacity onPress={() => setMessageModalVisible(false)}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Say something nice..." 
                    placeholderTextColor="#666"
                    multiline
                    value={messageText}
                    onChangeText={setMessageText}
                    autoFocus
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setMessageModalVisible(false)} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={sendNiceMessage} style={[styles.sendButton, !messageText.trim() && { opacity: 0.5 }]} disabled={!messageText.trim()}>
                        <Text style={styles.sendButtonText}>Send Message</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={matchModalVisible} transparent animationType="fade" onRequestClose={() => setMatchModalVisible(false)}>
        <View style={styles.matchBackdrop}>
          <View style={styles.matchCard}>
            {matchedDriver?.image ? (
              <Image source={{ uri: matchedDriver.image }} style={styles.matchImage} />
            ) : (
              <View style={styles.matchImagePlaceholder} />
            )}
            <Text style={styles.matchTitle}>It&apos;s a Match!</Text>
            <Text style={styles.matchSubtitle}>
              {matchedDriver?.name ? `You and ${matchedDriver.name} can start chatting.` : 'You can start chatting.'}
            </Text>
            <View style={styles.matchButtons}>
              <TouchableOpacity
                style={styles.matchSecondaryButton}
                onPress={() => {
                  setMatchModalVisible(false);
                  setMatchedDriver(null);
                }}
              >
                <Text style={styles.matchSecondaryText}>Keep Swiping</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.matchPrimaryButton}
                onPress={() => {
                  if (matchedDriver) {
                    setMessageTarget(matchedDriver);
                    setMessageText('');
                    setMessageModalVisible(true);
                  }
                  setMatchModalVisible(false);
                }}
              >
                <Text style={styles.matchPrimaryText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    flex: 1,
  },
  profileContainer: {
    height: cardHeight,
    width: width,
    position: 'relative',
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1c1c1e',
  },
  touchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  leftTouchZone: {
    width: '30%',
    height: '100%',
  },
  rightTouchZone: {
    width: '70%',
    height: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 60,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  nameText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  bioText: {
    color: '#eee',
    fontSize: 16,
    lineHeight: 22,
  },
  navDots: {
    position: 'absolute',
    right: 20,
    top: '40%',
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeDot: {
    backgroundColor: '#fff',
    height: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  messageCard: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    color: '#666',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  matchBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  matchCard: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  matchImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  matchImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2C2C2E',
    marginBottom: 16,
  },
  matchTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  matchButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  matchSecondaryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
  },
  matchSecondaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  matchPrimaryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  matchPrimaryText: {
    color: '#000',
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
  },
  sendButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sendButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
