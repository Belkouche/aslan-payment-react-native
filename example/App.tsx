import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AslanProvider,
  useAslan,
  AslanCheckoutModal,
  AslanPaymentSheet,
  formatMAD,
} from '@aslan/payment-react-native';

function PaymentScreen() {
  const { checkout, openPaymentLink, isTestMode, isReady, _checkoutUrl, _resolveCheckout, _dismissCheckout } = useAslan();
  const [amount, setAmount] = useState('15000');
  const [paymentLinkUrl, setPaymentLinkUrl] = useState('');
  const [useSheet, setUseSheet] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      const result = await checkout({
        amount: parseInt(amount, 10),
        customer: {
          email: 'test@example.com',
          name: 'Test User',
        },
        metadata: {
          orderId: 'order_123',
        },
      });
      setLastResult(JSON.stringify(result, null, 2));
      Alert.alert('Payment Result', `Status: ${result.status}`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePaymentLink = async () => {
    if (!paymentLinkUrl) {
      Alert.alert('Error', 'Enter a payment link URL');
      return;
    }
    try {
      const result = await openPaymentLink(paymentLinkUrl);
      setLastResult(JSON.stringify(result, null, 2));
      Alert.alert('Payment Result', `Status: ${result.status}`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Aslan Payment SDK</Text>
        {isTestMode && (
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>TEST MODE</Text>
          </View>
        )}
        <Text style={styles.readyText}>
          SDK {isReady ? 'Ready' : 'Initializing...'}
        </Text>

        {/* Checkout Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checkout</Text>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Amount (centimes):</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="15000"
            />
          </View>
          <Text style={styles.amountPreview}>{formatMAD(parseInt(amount, 10) || 0)}</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.label}>Use Payment Sheet:</Text>
            <TouchableOpacity
              style={[styles.toggle, useSheet && styles.toggleActive]}
              onPress={() => setUseSheet(!useSheet)}
            >
              <Text style={styles.toggleText}>{useSheet ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCheckout}>
            <Text style={styles.buttonText}>Pay {formatMAD(parseInt(amount, 10) || 0)}</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Link Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Link</Text>
          <TextInput
            style={styles.input}
            value={paymentLinkUrl}
            onChangeText={setPaymentLinkUrl}
            placeholder="https://pay.aslanpay.ma/pl/ABC123"
            autoCapitalize="none"
          />
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handlePaymentLink}>
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Open Payment Link</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {lastResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Result</Text>
            <Text style={styles.code}>{lastResult}</Text>
          </View>
        )}
      </ScrollView>

      {/* Checkout Modal / Sheet */}
      {_checkoutUrl && !useSheet && (
        <AslanCheckoutModal
          visible={!!_checkoutUrl}
          url={_checkoutUrl}
          onComplete={(result) => {
            _resolveCheckout?.(result);
            _dismissCheckout();
          }}
          onClose={_dismissCheckout}
          testMode={isTestMode}
        />
      )}
      {_checkoutUrl && useSheet && (
        <AslanPaymentSheet
          visible={!!_checkoutUrl}
          url={_checkoutUrl}
          onComplete={(result) => {
            _resolveCheckout?.(result);
            _dismissCheckout();
          }}
          onClose={_dismissCheckout}
          testMode={isTestMode}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AslanProvider publishableKey="pk_test_demo_key">
      <PaymentScreen />
    </AslanProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  readyText: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  testBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  testBadgeText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: '#374151', marginRight: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  amountPreview: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  toggleActive: { backgroundColor: '#F97316' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#F97316' },
  buttonTextSecondary: { color: '#F97316' },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    color: '#374151',
  },
});
