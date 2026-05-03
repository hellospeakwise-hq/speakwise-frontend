/**
 * Sent to the REQUESTER (organizer or individual) when a speaker
 * DECLINES their speaking request.
 */
import { Heading, Row, Column, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, brand } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

const BASE_URL = "https://speak-wise.live";

interface RequestRejectedProps {
  requesterName: string;
  speakerName: string;
  eventName: string;
  discoverUrl?: string;
}

export default function RequestRejected({
  requesterName = "Kofi Mensah",
  speakerName = "Alex Johnson",
  eventName = "DevFest Accra 2025",
  discoverUrl = "https://speak-wise.live/speakers",
}: RequestRejectedProps) {
  return (
    <EmailLayout
      preview={`${speakerName} is unavailable for ${eventName}`}
      announcementText="Don't worry — there are great speakers waiting to be discovered"
    >
      {/* Status section */}
      <Section style={styles.statusSection}>
        <Text style={styles.statusEmoji}>📭</Text>
        <Text style={styles.eyebrow}>Request Declined</Text>
        <Heading style={styles.heading}>
          {speakerName} is unavailable for this one.
        </Heading>
        <Text style={styles.body}>
          Hi <strong>{requesterName}</strong>, {speakerName} has declined your
          speaking request for <strong>{eventName}</strong>. Speakers often
          decline due to prior commitments or scheduling conflicts — it's not a
          reflection on your event.
        </Text>
      </Section>

      {/* Dark section — reassurance */}
      <Section style={styles.heroSection}>
        <Text style={styles.heroHeading}>Your event is still happening.</Text>
        <Text style={styles.heroBody}>
          SpeakWise has hundreds of speakers across industries and regions.
          The right speaker for your event is out there.
        </Text>
        <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
          <EmailButton href={discoverUrl}>
            Find Another Speaker
          </EmailButton>
        </Section>
      </Section>

      {/* Tips */}
      <Section style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Tips for your next request</Text>

        {[
          {
            icon: "📬",
            t: "Reach out to multiple speakers",
            d: "Send requests to 3–5 speakers at once to improve your chances of a confirmation.",
          },
          {
            icon: "⏰",
            t: "Plan ahead",
            d: "Speakers book months in advance. Start outreach at least 6–8 weeks before your event.",
          },
          {
            icon: "✍️",
            t: "Personalise your message",
            d: "Speakers are more likely to respond when the request mentions why they specifically are a great fit.",
          },
        ].map((tip, i) => (
          <Row key={i} style={styles.tipRow}>
            <Column style={styles.tipIconCol}>
              <Text style={styles.tipIconBadge}>{tip.icon}</Text>
            </Column>
            <Column>
              <Text style={styles.tipTitle}>{tip.t}</Text>
              <Text style={styles.tipDesc}>{tip.d}</Text>
            </Column>
          </Row>
        ))}

        <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
          <EmailButton href={discoverUrl} variant="secondary">
            Browse Speaker Directory
          </EmailButton>
        </Section>
      </Section>

      <Section style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          View your full request history in your Dashboard. Need help?{" "}
          Contact our support team anytime.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  statusSection: {
    padding: "36px 40px 32px",
    textAlign: "center" as const,
  },
  statusEmoji: {
    fontSize: "44px",
    margin: "0 0 10px",
  },
  eyebrow: {
    color: brand.danger,
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "0 0 12px",
    textTransform: "uppercase",
  },
  heading: {
    color: brand.dark,
    fontSize: "30px",
    fontWeight: "800",
    lineHeight: "1.2",
    margin: "0 0 16px",
  },
  body: {
    color: "#475569",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: 0,
  },
  heroSection: {
    backgroundColor: brand.darkMid,
    padding: "36px 40px",
    textAlign: "center" as const,
  },
  heroHeading: {
    color: brand.white,
    fontSize: "22px",
    fontWeight: "800",
    lineHeight: "1.3",
    margin: "0 0 12px",
  },
  heroBody: {
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: 0,
  },
  tipsSection: {
    backgroundColor: brand.light,
    padding: "32px 40px",
  },
  tipsTitle: {
    color: brand.dark,
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    margin: "0 0 20px",
    textTransform: "uppercase",
  },
  tipRow: {
    marginBottom: "18px",
  },
  tipIconCol: {
    paddingRight: "14px",
    verticalAlign: "top",
    width: "40px",
  },
  tipIconBadge: {
    backgroundColor: "#e0e7ff",
    borderRadius: "50%",
    fontSize: "16px",
    height: "36px",
    lineHeight: "36px",
    margin: 0,
    textAlign: "center" as const,
    width: "36px",
  },
  tipTitle: {
    color: brand.dark,
    fontSize: "14px",
    fontWeight: "700",
    margin: "4px 0 3px",
  },
  tipDesc: {
    color: brand.muted,
    fontSize: "13px",
    lineHeight: "1.5",
    margin: 0,
  },
  disclaimer: {
    padding: "20px 40px",
  },
  disclaimerText: {
    color: brand.mutedLight,
    fontSize: "12px",
    lineHeight: "1.6",
    margin: 0,
    textAlign: "center" as const,
  },
};
