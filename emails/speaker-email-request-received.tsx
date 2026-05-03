/**
 * Sent to a SPEAKER when anyone (no org needed) sends them a direct
 * email-based speaking request via SpeakWise.
 */
import { Heading, Row, Column, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, brand } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

const BASE_URL = "https://speak-wise.live";

interface SpeakerEmailRequestReceivedProps {
  speakerName: string;
  requesterName: string;
  requesterEmail: string;
  eventName: string;
  eventLocation: string;
  message: string;
  requestId: string;
}

export default function SpeakerEmailRequestReceived({
  speakerName = "Alex Johnson",
  requesterName = "Jane Smith",
  requesterEmail = "jane@example.com",
  eventName = "TechConnect Summit 2025",
  eventLocation = "Accra, Ghana",
  message = "Hi Alex, I'd love to have you speak at our annual TechConnect Summit. Your work on distributed systems would be a perfect fit for our audience of 400+ engineers.",
  requestId = "req_abc123",
}: SpeakerEmailRequestReceivedProps) {
  return (
    <EmailLayout
      preview={`${requesterName} wants you to speak at ${eventName}`}
      announcementText="You have a new speaking request waiting for your response"
    >
      {/* Intro copy */}
      <Section style={styles.introSection}>
        <Text style={styles.eyebrow}>NEW REQUEST</Text>
        <Heading style={styles.heading}>
          Someone wants you to speak at their event.
        </Heading>
        <Text style={styles.body}>
          Hi <strong>{speakerName}</strong>, <strong>{requesterName}</strong>{" "}
          has sent you a speaking request through SpeakWise. Review the details
          and let them know if you're available.
        </Text>
        <Section style={{ textAlign: "center" as const }}>
          <EmailButton
            href={`${BASE_URL}/dashboard/speaker?tab=requests&highlight=${requestId}`}
          >
            View Request
          </EmailButton>
        </Section>
      </Section>

      {/* Dark hero — event details */}
      <Section style={styles.heroSection}>
        <Text style={styles.heroEyebrow}>Event Details</Text>
        <Text style={styles.heroHeading}>{eventName}</Text>
        <Row style={{ marginBottom: "6px" }}>
          <Column style={styles.heroMetaIcon}>📍</Column>
          <Column>
            <Text style={styles.heroMetaText}>{eventLocation}</Text>
          </Column>
        </Row>
        <Row>
          <Column style={styles.heroMetaIcon}>👤</Column>
          <Column>
            <Text style={styles.heroMetaText}>
              {requesterName} · {requesterEmail}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Message */}
      <Section style={styles.messageSection}>
        <Text style={styles.messageEyebrow}>Their message to you</Text>
        <Text style={styles.messageText}>"{message}"</Text>
      </Section>

      {/* What happens next */}
      <Section style={styles.stepsSection}>
        <Text style={styles.stepsTitle}>How it works</Text>

        {[
          { n: "1", t: "Review the request", d: "Check the event details and message above." },
          { n: "2", t: "Accept or decline", d: "Head to your Speaker Dashboard → Requests tab to respond." },
          { n: "3", t: "Connect with the requester", d: "Once accepted, reach out to align on talk topics and logistics." },
        ].map((step) => (
          <Row key={step.n} style={styles.stepRow}>
            <Column style={styles.stepNumCol}>
              <Text style={styles.stepNum}>{step.n}</Text>
            </Column>
            <Column>
              <Text style={styles.stepTitle}>{step.t}</Text>
              <Text style={styles.stepDesc}>{step.d}</Text>
            </Column>
          </Row>
        ))}

        <Section style={{ textAlign: "center" as const, marginTop: "20px" }}>
          <EmailButton
            href={`${BASE_URL}/dashboard/speaker?tab=requests&highlight=${requestId}`}
          >
            Go to My Dashboard
          </EmailButton>
        </Section>
      </Section>

      <Section style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          If you don't recognise this request or didn't expect it, you can
          safely ignore this email. Your information remains private.
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
  heroEyebrow: {
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  heroHeading: {
    color: brand.white,
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 20px",
    lineHeight: "1.3",
  },
  heroMetaIcon: {
    fontSize: "15px",
    paddingRight: "10px",
    verticalAlign: "middle",
    width: "22px",
  },
  heroMetaText: {
    color: "#cbd5e1",
    fontSize: "14px",
    margin: "0 0 4px",
  },
  messageSection: {
    backgroundColor: "#fffbeb",
    borderLeft: `5px solid #f59e0b`,
    margin: "0",
    padding: "24px 40px",
  },
  messageEyebrow: {
    color: "#92400e",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "0 0 10px",
    textTransform: "uppercase",
  },
  messageText: {
    color: "#1c1917",
    fontSize: "15px",
    fontStyle: "italic",
    lineHeight: "1.8",
    margin: 0,
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
    marginBottom: "16px",
  },
  stepNumCol: {
    paddingRight: "14px",
    verticalAlign: "top",
    width: "32px",
  },
  stepNum: {
    backgroundColor: brand.blue,
    borderRadius: "50%",
    color: brand.white,
    fontSize: "12px",
    fontWeight: "700",
    height: "26px",
    lineHeight: "26px",
    margin: 0,
    textAlign: "center" as const,
    width: "26px",
  },
  stepTitle: {
    color: brand.dark,
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 2px",
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
