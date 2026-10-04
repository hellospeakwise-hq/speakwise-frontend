import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const BASE_URL = "https://www.speakwise.live";

export const brand = {
  dark: "#0f172a",
  darkMid: "#1e293b",
  blue: "#2563eb",
  blueDark: "#1d4ed8",
  blueLight: "#eff6ff",
  border: "#e2e8f0",
  muted: "#64748b",
  mutedLight: "#cbd5e1",
  light: "#f8fafc",
  white: "#ffffff",
  success: "#16a34a",
  successLight: "#f0fdf4",
  danger: "#dc2626",
  warning: "#d97706",
  warningLight: "#fffbeb",
  teal: "#0d9488",
};

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  announcementText?: string;
}

export function EmailLayout({
  preview,
  children,
  announcementText,
}: EmailLayoutProps) {
  // Strip em-dashes and hyphens if present in announcement
  const cleanAnnouncement = announcementText?.replace(/\s*[—–-]\s*/g, ": ");

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Logo header with Icon and Brand Name */}
          <Section style={styles.logoHeader}>
            <Link href={BASE_URL} style={{ textDecoration: "none", display: "inline-block" }}>
              <Row style={{ margin: "0 auto", textAlign: "center" }}>
                <Column style={{ verticalAlign: "middle", paddingRight: "8px" }}>
                  <Img
                    src={`${BASE_URL}/logo-black.png`}
                    alt="SpeakWise"
                    height={38}
                    width={38}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  />
                </Column>
                <Column style={{ verticalAlign: "middle" }}>
                  <Text style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                    SpeakWise
                  </Text>
                </Column>
              </Row>
            </Link>
          </Section>

          {/* Optional announcement strip */}
          {cleanAnnouncement && (
            <Section style={styles.announcementBar}>
              <Text style={styles.announcementText}>
                {cleanAnnouncement}
              </Text>
            </Section>
          )}

          {/* Main content */}
          {children}

          {/* Footer */}
          <Section style={styles.footer}>
            <Link href={BASE_URL} style={{ textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
              <Row style={{ margin: "0 auto", textAlign: "center" }}>
                <Column style={{ verticalAlign: "middle", paddingRight: "8px" }}>
                  <Img
                    src={`${BASE_URL}/logo-white.png`}
                    alt="SpeakWise"
                    height={26}
                    width={26}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  />
                </Column>
                <Column style={{ verticalAlign: "middle" }}>
                  <Text style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0, letterSpacing: "-0.3px" }}>
                    SpeakWise
                  </Text>
                </Column>
              </Row>
            </Link>

            <Row style={{ marginBottom: "12px" }}>
              <Column style={{ textAlign: "center" }}>
                <Link href={`${BASE_URL}/discover`} style={styles.footerBtn}>
                  Discover Events
                </Link>
              </Column>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Column style={{ textAlign: "center" }}>
                <Link href={`${BASE_URL}/speakers`} style={styles.footerBtn}>
                  Browse Speakers
                </Link>
              </Column>
            </Row>
            <Row>
              <Column style={{ textAlign: "center" }}>
                <Link href={`${BASE_URL}/contact`} style={styles.footerBtn}>
                  Get Help
                </Link>
              </Column>
            </Row>

            <Text style={styles.footerCopy}>
              © {new Date().getFullYear()} SpeakWise. All rights reserved.
              <br />
              <Link href={`${BASE_URL}/privacy`} style={styles.footerLink}>
                Privacy Policy
              </Link>
              {" · "}
              <Link href={`${BASE_URL}/terms`} style={styles.footerLink}>
                Terms
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#dde3ee",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: "32px 16px",
  },
  container: {
    backgroundColor: brand.white,
    borderRadius: "16px",
    maxWidth: "600px",
    margin: "0 auto",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    border: "1px solid #cbd5e1",
  },
  logoHeader: {
    backgroundColor: brand.white,
    borderBottom: `1px solid ${brand.border}`,
    padding: "20px 32px",
    textAlign: "center" as const,
  },
  announcementBar: {
    backgroundColor: brand.blue,
    padding: "10px 24px",
  },
  announcementText: {
    color: brand.white,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.03em",
    margin: 0,
    textAlign: "center" as const,
  },
  footer: {
    backgroundColor: brand.dark,
    padding: "36px 32px 28px",
    textAlign: "center" as const,
    borderTop: "1px solid #1e293b",
  },
  footerBtn: {
    border: `1.5px solid rgba(255,255,255,0.4)`,
    borderRadius: "50px",
    color: brand.white,
    display: "inline-block",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.02em",
    padding: "10px 32px",
    textDecoration: "none",
  },
  footerCopy: {
    color: "#cbd5e1",
    fontSize: "12px",
    lineHeight: "1.8",
    margin: "20px 0 0",
    textAlign: "center" as const,
  },
  footerLink: {
    color: "#60a5fa",
    textDecoration: "underline",
    fontWeight: "500",
  },
};
