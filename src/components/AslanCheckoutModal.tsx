import React from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AslanWebView } from './AslanWebView';
import type { CheckoutResult } from '../types/checkout';

interface AslanCheckoutModalProps {
  visible: boolean;
  url: string;
  onComplete: (result: CheckoutResult) => void;
  onClose: () => void;
  testMode?: boolean;
}

export function AslanCheckoutModal({
  visible,
  url,
  onComplete,
  onClose,
  testMode = false,
}: AslanCheckoutModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {testMode && (
          <View style={styles.testBanner}>
            <Text style={styles.testBannerText}>TEST MODE</Text>
          </View>
        )}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <AslanWebView
          url={url}
          onComplete={onComplete}
          onError={() => onComplete({ status: 'failed' })}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  testBanner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 4,
    alignItems: 'center',
  },
  testBannerText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});
