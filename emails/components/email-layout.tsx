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

const BASE_URL = "https://speak-wise.live";

export const brand = {
  dark: "#0f172a",
  darkMid: "#1e293b",
  blue: "#2563eb",
  blueDark: "#1d4ed8",
  blueLight: "#eff6ff",
  border: "#e2e8f0",
  muted: "#64748b",
  mutedLight: "#94a3b8",
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
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Logo header */}
          <Section style={styles.logoHeader}>
            <Link href={BASE_URL}>
              <Img
                src={`${BASE_URL}/logo-black.png`}
                alt="SpeakWise"
                height={30}
                style={{ display: "block", margin: "0 auto" }}
              />
            </Link>
          </Section>

          {/* Optional announcement strip */}
          {announcementText && (
            <Section style={styles.announcementBar}>
              <Text style={styles.announcementText}>
                ✦ {announcementText} ✦
              </Text>
            </Section>
          )}

          {/* Main content */}
          {children}

          {/* Footer */}
          <Section style={styles.footer}>
            <Link href={BASE_URL}>
              <Img
                src={`${BASE_URL}/logo-white.png`}
                alt="SpeakWise"
                height={28}
                style={{ display: "block", margin: "0 auto 20px" }}
              />
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
              <Link href={`${BASE_URL}/privacy-policy`} style={styles.footerLink}>
                Privacy Policy
              </Link>
              {" · "}
              <Link href={`${BASE_URL}/terms-of-service`} style={styles.footerLink}>
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
  },
  logoHeader: {
    backgroundColor: brand.white,
    borderBottom: `1px solid ${brand.border}`,
    padding: "20px 32px",
  },
  announcementBar: {
    backgroundColor: brand.blue,
    padding: "10px 24px",
  },
  announcementText: {
    color: brand.white,
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    margin: 0,
    textAlign: "center" as const,
  },
  footer: {
    backgroundColor: brand.dark,
    padding: "36px 32px 28px",
    textAlign: "center" as const,
  },
  footerBtn: {
    border: `1.5px solid rgba(255,255,255,0.3)`,
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
    color: "#64748b",
    fontSize: "11px",
    lineHeight: "1.8",
    margin: "20px 0 0",
    textAlign: "center" as const,
  },
  footerLink: {
    color: "#64748b",
    textDecoration: "underline",
  },
};
