import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { BookingMaterial } from '@/lib/booking-materials'
import { formatGhanaDeparture, formatGHS } from '@/lib/booking-materials'
import { CONTACT } from '@/lib/constants'

const colors = {
  navy: '#0c1d35',
  orange: '#f15a29',
  gold: '#f9b233',
  cream: '#fff8ef',
  ink: '#172033',
  muted: '#667085',
  line: '#e5e7eb',
  green: '#147d64',
  white: '#ffffff',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f4f6f8',
    color: colors.ink,
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 28,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 12,
    minHeight: 760,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.navy,
    color: colors.white,
    paddingBottom: 27,
    paddingHorizontal: 30,
    paddingTop: 27,
  },
  brandRow: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: { color: colors.gold, fontSize: 14, fontWeight: 700, letterSpacing: 2.4 },
  voucherLabel: { color: '#d5deea', fontSize: 8, letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { fontSize: 25, fontWeight: 700, marginTop: 24 },
  subtitle: { color: '#d5deea', fontSize: 10, lineHeight: 1.5, marginTop: 7, maxWidth: 390 },
  accent: { backgroundColor: colors.orange, height: 5 },
  body: { padding: 30 },
  confirmationRow: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  referenceBox: {
    backgroundColor: colors.cream,
    borderLeftColor: colors.orange,
    borderLeftWidth: 4,
    borderRadius: 7,
    padding: 14,
    width: '67%',
  },
  label: { color: colors.muted, fontSize: 7.5, letterSpacing: 1.1, textTransform: 'uppercase' },
  reference: { color: colors.navy, fontFamily: 'Courier-Bold', fontSize: 18, marginTop: 5 },
  status: {
    backgroundColor: '#e7f6f1',
    borderRadius: 20,
    color: colors.green,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.8,
    paddingBottom: 7,
    paddingHorizontal: 12,
    paddingTop: 7,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
    marginTop: 20,
  },
  detailGrid: {
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detail: { borderBottomColor: colors.line, borderBottomWidth: 1, padding: 13, width: '50%' },
  detailRight: { borderLeftColor: colors.line, borderLeftWidth: 1 },
  detailLast: { borderBottomWidth: 0 },
  value: { color: colors.ink, fontSize: 10, fontWeight: 700, lineHeight: 1.4, marginTop: 4 },
  infoBox: { backgroundColor: '#f7f9fc', borderRadius: 8, padding: 15 },
  infoText: { color: colors.muted, fontSize: 9, lineHeight: 1.55 },
  bullet: { color: colors.ink, fontSize: 9, lineHeight: 1.55, marginBottom: 4 },
  footer: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 28,
    color: colors.muted,
    display: 'flex',
    flexDirection: 'row',
    fontSize: 8,
    justifyContent: 'space-between',
    left: 30,
    paddingTop: 12,
    position: 'absolute',
    right: 30,
  },
})

export function BookingVoucherDocument({ booking }: { booking: BookingMaterial }) {
  const travellerSummary = `${booking.travellers} (${booking.adults} adult${booking.adults === 1 ? '' : 's'}${
    booking.children ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}` : ''
  })`
  const essentials = booking.whatToBring.length
    ? booking.whatToBring.slice(0, 5)
    : [
        'Comfortable clothing and footwear',
        'Water and personal essentials',
        'Your booking reference',
      ]

  return (
    <Document
      author="Trivoxo Limited Company"
      subject={`Booking voucher ${booking.reference}`}
      title={`${booking.experienceTitle} - Trivoxo voucher`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>TRIVOXO</Text>
              <Text style={styles.voucherLabel}>Official booking voucher</Text>
            </View>
            <Text style={styles.title}>{booking.experienceTitle}</Text>
            <Text style={styles.subtitle}>
              Experience Ghana the Trivoxo Way. Present this voucher or your booking reference when
              meeting the team.
            </Text>
          </View>
          <View style={styles.accent} />

          <View style={styles.body}>
            <View style={styles.confirmationRow}>
              <View style={styles.referenceBox}>
                <Text style={styles.label}>Booking reference</Text>
                <Text style={styles.reference}>{booking.reference}</Text>
              </View>
              <Text style={styles.status}>Paid - confirmed</Text>
            </View>

            <Text style={styles.sectionTitle}>Trip details</Text>
            <View style={styles.detailGrid}>
              <Detail label="Lead traveller" value={booking.bookerName} />
              <Detail label="Departure" value={formatGhanaDeparture(booking)} right />
              <Detail label="Travellers" value={travellerSummary} last />
              <Detail label="Amount paid" value={formatGHS(booking.totalAmount)} right last />
            </View>

            <Text style={styles.sectionTitle}>Pickup / meeting point</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{booking.pickup}</Text>
            </View>

            <Text style={styles.sectionTitle}>Come prepared</Text>
            <View>
              {essentials.map((item) => (
                <Text key={item} style={styles.bullet}>
                  - {item}
                </Text>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Important</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Final pickup time, guide contact, and any itinerary updates will be shared before
                departure. Keep this voucher private. For changes or urgent help, contact Trivoxo
                and quote the booking reference above.
              </Text>
            </View>

            <View style={styles.footer} fixed>
              <Text>
                {CONTACT.email} | {CONTACT.primaryPhone}
              </Text>
              <Text>Trivoxo Limited Company | Accra, Ghana</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

function Detail({
  label,
  value,
  right = false,
  last = false,
}: {
  label: string
  value: string
  right?: boolean
  last?: boolean
}) {
  return (
    <View style={[styles.detail, right ? styles.detailRight : {}, last ? styles.detailLast : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}
