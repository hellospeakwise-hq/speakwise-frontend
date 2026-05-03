/**
 * Sent to the REQUESTER (organizer or individual) when a speaker
 * ACCEPTS their speaking request.
 */
import { Heading, Row, Column, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, brand } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

const BASE_URL = "https://speak-wise.live";

interface RequestAcceptedProps {
  requesterName: string;
  speakerName: string;
  speakerTitle?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: string;
  speakerProfileUrl?: string;
  dashboardUrl?: string;
}

export default function RequestAccepted({
  requesterName = "Kofi Mensah",
  speakerName = "Alex Johnson",
  speakerTitle = "Senior Software Engineer & Tech Speaker",
  eventName = "DevFest Accra 2025",
  eventDate = "October 18, 2025",
  eventLocation = "Accra International Conference Centre",
  speakerProfileUrl = "https://speak-wise.live/speakers/1",
  dashboardUrl = "https://speak-wise.live/dashboard/organizer",
}: RequestAcceptedProps) {
  return (
    <EmailLayout
      preview={`🎉 ${speakerName} accepted your speaking request for ${eventName}`}
      announcementText={`${speakerName} is confirmed for ${eventName}`}
    >
      {/* Celebration header */}
      <Section style={styles.celebrationSection}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.eyebrow}>Request Accepted</Text>
        <Heading style={styles.heading}>
          {speakerName} is in for {eventName}!
        </Heading>
        <Text style={styles.body}>
          Hi <strong>{requesterName}</strong>, great news —{" "}
          <strong>{speakerName}</strong> has confirmed your speaking request.
          Time to make it official and start coordinating the details.
        </Text>
        <Section style={{ textAlign: "center" as const }}>
          <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
        </Section>
      </Section>

      {/* Confirmed speaker card (dark) */}
      <Section style={styles.heroSection}>
        <Text style={styles.heroEyebrow}>Confirmed Speaker</Text>
        <Text style={styles.heroName}>{speakerName}</Text>
        {speakerTitle && (
          <Text style={styles.heroTitle}>{speakerTitle}</Text>
        )}
        <Row style={{ marginTop: "20px" }}>
          <Column style={styles.heroIcon}>🎤</Column>
          <Column>
            <Text style={styles.heroMeta}>{eventName}</Text>
          </Column>
        </Row>
        {eventDate && (
          <Row>
            <Column style={styles.heroIcon}>🗓️</Column>
            <Column>
              <Text style={styles.heroMeta}>{eventDate}</Text>
            </Column>
          </Row>
        )}
        {eventLocation && (
          <Row>
            <Column style={styles.heroIcon}>📍</Column>
            <Column>
              <Text style={styles.heroMeta}>{eventLocation}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Next steps */}
      <Section style={styles.stepsSection}>
        <Text style={styles.stepsTitle}>Suggested next steps</Text>

        {[
          {
            icon: "💬",
            t: "Reach out directly",
            d: `Connect with ${speakerName} to align on the talk topic, format, and duration.`,
          },
          {
            icon: "📋",
            t: "Share event logistics",
            d: "Send over the venue details, schedule, A/V setup, and any speaker guidelines.",
          },
          {
            icon: "🌟",
            t: "Update your event listing",
            d: "Add the confirmed speaker to your SpeakWise event page so attendees can see the lineup.",
          },
        ].map((step, i) => (
          <Row key={i} style={styles.stepRow}>
            <Column style={styles.stepIconCol}>
              <Text style={styles.stepIconBadge}>{step.icon}</Text>
            </Column>
            <Column>
              <Text style={styles.stepTitle}>{step.t}</Text>
              <Text style={styles.stepDesc}>{step.d}</Text>
            </Column>
          </Row>
        ))}

        <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
          <EmailButton href={speakerProfileUrl} variant="ghost">
            View Speaker Profile
          </EmailButton>
        </Section>
      </Section>

      <Section style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          You can manage all confirmed speakers and event details from your
          Organizer Dashboard.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  celebrationSection: {
    padding: "36px 40px 32px",
    textAlign: "center" as const,
  },
  celebrationEmoji: {
    fontSize: "44px",
    margin: "0 0 10px",
  },
  eyebrow: {
    color: brand.success,
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
  heroEyebrow: {
    color: "#4ade80",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  heroName: {
    color: brand.white,
    fontSize: "26px",
    fontWeight: "800",
    lineHeight: "1.2",
    margin: "0 0 4px",
  },
  heroTitle: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0 0 16px",
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
  stepsSection: {
    backgroundColor: brand.light,
    padding: "32px 40px",
  },
  stepsTitle: {
    color: brand.dark,
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    margin: "0 0 20px",
    textTransform: "uppercase",
  },
  stepRow: {
    marginBottom: "18px",
  },
  stepIconCol: {
    paddingRight: "14px",
    verticalAlign: "top",
    width: "40px",
  },
  stepIconBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: "50%",
    fontSize: "16px",
    height: "36px",
    lineHeight: "36px",
    margin: 0,
    textAlign: "center" as const,
    width: "36px",
  },
  stepTitle: {
    color: brand.dark,
    fontSize: "14px",
    fontWeight: "700",
    margin: "4px 0 3px",
  },
  stepDesc: {
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
