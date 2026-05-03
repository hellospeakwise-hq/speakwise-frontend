/**
 * Sent to a SPEAKER when an ORGANIZATION formally requests them
 * to speak at an event through SpeakWise.
 */
import { Heading, Row, Column, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, brand } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

const BASE_URL = "https://speak-wise.live";

interface SpeakerOrgRequestReceivedProps {
  speakerName: string;
  organizationName: string;
  organizerName: string;
  eventName: string;
  eventDate?: string;
  message: string;
  requestId: string | number;
}

export default function SpeakerOrgRequestReceived({
  speakerName = "Alex Johnson",
  organizationName = "DevFest Ghana",
  organizerName = "Kofi Mensah",
  eventName = "DevFest Accra 2025",
  eventDate = "October 18, 2025",
  message = "We'd be honoured to have you deliver the opening keynote at DevFest Accra 2025. Your expertise in machine learning and engaging presentation style would be a fantastic fit for our 1,000+ attendee audience.",
  requestId = 42,
}: SpeakerOrgRequestReceivedProps) {
  return (
    <EmailLayout
      preview={`${organizationName} has invited you to speak at ${eventName}`}
      announcementText={`Official invitation from ${organizationName}`}
    >
      {/* Intro */}
      <Section style={styles.introSection}>
        <Text style={styles.eyebrow}>Organization Invite</Text>
        <Heading style={styles.heading}>
          You've been invited to speak.
        </Heading>
        <Text style={styles.body}>
          Hi <strong>{speakerName}</strong>,{" "}
          <strong>{organizationName}</strong> has sent you an official speaking
          invitation through SpeakWise. Organizations on SpeakWise are verified
          — this is a legitimate opportunity.
        </Text>
        <Section style={{ textAlign: "center" as const }}>
          <EmailButton
            href={`${BASE_URL}/dashboard/speaker?tab=requests&highlight=${requestId}`}
          >
            View Invitation
          </EmailButton>
        </Section>
      </Section>

      {/* Dark hero — event card */}
      <Section style={styles.heroSection}>
        <Text style={styles.heroOrg}>{organizationName}</Text>
        <Text style={styles.heroEvent}>{eventName}</Text>
        {eventDate && (
          <Row style={{ marginBottom: "6px" }}>
            <Column style={styles.heroIcon}>🗓️</Column>
            <Column>
              <Text style={styles.heroMeta}>{eventDate}</Text>
            </Column>
          </Row>
        )}
        <Row>
          <Column style={styles.heroIcon}>👤</Column>
          <Column>
            <Text style={styles.heroMeta}>Sent by {organizerName}</Text>
          </Column>
        </Row>
      </Section>

      {/* Their message */}
      <Section style={styles.messageSection}>
        <Text style={styles.messageEyebrow}>
          Message from {organizerName}
        </Text>
        <Text style={styles.messageText}>"{message}"</Text>
      </Section>

      {/* Why respond */}
      <Section style={styles.whySection}>
        <Text style={styles.whyTitle}>Why this matters</Text>

        {[
          {
            icon: "🏢",
            t: "Verified organization",
            d: "Organizations on SpeakWise go through an approval process before they can send requests.",
          },
          {
            icon: "📈",
            t: "Grow your speaking portfolio",
            d: "Accepting event invitations builds your profile and gets you discovered by more organizers.",
          },
          {
            icon: "⚡",
            t: "Respond quickly",
            d: "Organizers often have tight timelines. A fast response keeps the opportunity open.",
          },
        ].map((item, i) => (
          <Row key={i} style={styles.whyRow}>
            <Column style={styles.whyIconCol}>
              <Text style={styles.whyIconBadge}>{item.icon}</Text>
            </Column>
            <Column>
              <Text style={styles.whyItemTitle}>{item.t}</Text>
              <Text style={styles.whyItemDesc}>{item.d}</Text>
            </Column>
          </Row>
        ))}

        <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
          <EmailButton
            href={`${BASE_URL}/dashboard/speaker?tab=requests&highlight=${requestId}`}
          >
            Accept or Decline
          </EmailButton>
        </Section>
      </Section>

      <Section style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Requests that go unanswered for 30 days are automatically closed. You
          can manage all requests from your Speaker Dashboard.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  introSection: {
    padding: "36px 40px 32px",
    textAlign: "center" as const,
  },
  eyebrow: {
    color: brand.blue,
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
    margin: "0 0 28px",
  },
  heroSection: {
    backgroundColor: brand.dark,
    padding: "32px 40px",
  },
  heroOrg: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "4px",
    color: "#93c5fd",
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    margin: "0 0 10px",
    padding: "4px 10px",
    textTransform: "uppercase",
  },
  heroEvent: {
    color: brand.white,
    fontSize: "24px",
    fontWeight: "800",
    lineHeight: "1.3",
    margin: "0 0 20px",
  },
  heroIcon: {
    fontSize: "15px",
    paddingRight: "10px",
    verticalAlign: "middle",
    width: "22px",
  },
  heroMeta: {
    color: "#cbd5e1",
    fontSize: "14px",
    margin: "0 0 6px",
  },
  messageSection: {
    backgroundColor: brand.blueLight,
    borderLeft: `5px solid ${brand.blue}`,
    padding: "24px 40px",
  },
  messageEyebrow: {
    color: brand.blue,
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "0 0 10px",
    textTransform: "uppercase",
  },
  messageText: {
    color: "#1e3a5f",
    fontSize: "15px",
    fontStyle: "italic",
    lineHeight: "1.8",
    margin: 0,
  },
  whySection: {
    backgroundColor: brand.light,
    padding: "32px 40px",
  },
  whyTitle: {
    color: brand.dark,
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    margin: "0 0 20px",
    textTransform: "uppercase",
  },
  whyRow: {
    marginBottom: "18px",
  },
  whyIconCol: {
    paddingRight: "14px",
    verticalAlign: "top",
    width: "40px",
  },
  whyIconBadge: {
    backgroundColor: brand.blue,
    borderRadius: "50%",
    fontSize: "16px",
    height: "36px",
    lineHeight: "36px",
    margin: 0,
    textAlign: "center" as const,
    width: "36px",
  },
  whyItemTitle: {
    color: brand.dark,
    fontSize: "14px",
    fontWeight: "700",
    margin: "4px 0 3px",
  },
  whyItemDesc: {
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
