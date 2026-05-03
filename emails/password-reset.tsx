/**
 * Sent to a USER when they request a password reset.
 */
import { Heading, Link, Row, Column, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, brand } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

interface PasswordResetProps {
  userName: string;
  resetUrl: string;
  expiryHours?: number;
}

export default function PasswordReset({
  userName = "Alex Johnson",
  resetUrl = "https://speak-wise.live/reset-password?token=abc123&email=alex@example.com",
  expiryHours = 24,
}: PasswordResetProps) {
  return (
    <EmailLayout
      preview="Reset your SpeakWise password"
      announcementText="Action required — your reset link is inside"
    >
      {/* Intro */}
      <Section style={styles.introSection}>
        <Text style={styles.lockIcon}>🔐</Text>
        <Text style={styles.eyebrow}>Password Reset</Text>
        <Heading style={styles.heading}>
          Reset your password.
        </Heading>
        <Text style={styles.body}>
          Hi <strong>{userName}</strong>, we received a request to reset the
          password on your SpeakWise account. Click the button below to choose a
          new one.
        </Text>
        <Section style={{ textAlign: "center" as const }}>
          <EmailButton href={resetUrl}>Reset My Password</EmailButton>
        </Section>
      </Section>

      {/* Dark expiry notice */}
      <Section style={styles.heroSection}>
        <Row>
          <Column style={styles.heroIconCol}>
            <Text style={styles.heroIconBadge}>⏱</Text>
          </Column>
          <Column>
            <Text style={styles.heroTitle}>
              This link expires in {expiryHours} hours
            </Text>
            <Text style={styles.heroBody}>
              After that, you'll need to visit the forgot password page and
              request a new reset link.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Security tips */}
      <Section style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Keep your account secure</Text>

        {[
          {
            icon: "🔑",
            t: "Use a strong password",
            d: "At least 8 characters with a mix of letters, numbers, and symbols.",
          },
          {
            icon: "🙅",
            t: "Never share your password",
            d: "SpeakWise will never ask for your password over email or chat.",
          },
          {
            icon: "🔔",
            t: "Didn't request this?",
            d: "If you didn't ask for a password reset, you can safely ignore this email. Your account is unchanged.",
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
      </Section>

      {/* Fallback URL */}
      <Section style={styles.fallbackSection}>
        <Text style={styles.fallbackLabel}>
          Button not working? Copy this link into your browser:
        </Text>
        <Text style={styles.fallbackUrl}>
          <Link href={resetUrl} style={styles.fallbackLink}>
            {resetUrl}
          </Link>
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
  lockIcon: {
    fontSize: "44px",
    margin: "0 0 10px",
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
    padding: "28px 40px",
  },
  heroIconCol: {
    paddingRight: "16px",
    verticalAlign: "top",
    width: "44px",
  },
  heroIconBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    fontSize: "20px",
    height: "40px",
    lineHeight: "40px",
    margin: 0,
    textAlign: "center" as const,
    width: "40px",
  },
  heroTitle: {
    color: brand.white,
    fontSize: "15px",
    fontWeight: "700",
    margin: "4px 0 6px",
  },
  heroBody: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.6",
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
    marginBottom: "16px",
  },
  tipIconCol: {
    paddingRight: "14px",
    verticalAlign: "top",
    width: "40px",
  },
  tipIconBadge: {
    backgroundColor: brand.blueLight,
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
  fallbackSection: {
    padding: "20px 40px",
  },
  fallbackLabel: {
    color: brand.mutedLight,
    fontSize: "12px",
    margin: "0 0 6px",
    textAlign: "center" as const,
  },
  fallbackUrl: {
    margin: 0,
    textAlign: "center" as const,
  },
  fallbackLink: {
    color: brand.blue,
    fontSize: "11px",
    wordBreak: "break-all" as const,
  },
};
