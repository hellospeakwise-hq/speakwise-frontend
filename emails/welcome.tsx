/**
 * Welcome email sent when a new user registers on SpeakWise.
 * Adapts content based on role: speaker | organizer | attendee
 */
import { Heading, Row, Column, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, brand } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

const BASE_URL = "https://speak-wise.live";

interface WelcomeProps {
  userName: string;
  userRole?: "speaker" | "organizer" | "attendee";
  dashboardUrl?: string;
}

const roleConfig = {
  speaker: {
    eyebrow: "Welcome, Speaker",
    heroHeading: "Your stage awaits.",
    heroBody:
      "Thousands of event organizers use SpeakWise to find their next great speaker. Your profile is the key to getting discovered.",
    ctaLabel: "Set Up Your Profile",
    cta: `${BASE_URL}/dashboard/speaker`,
    steps: [
      {
        icon: "✍️",
        t: "Complete your profile",
        d: "Add your bio, skills, topics, and past speaking experience so organizers know what you bring.",
      },
      {
        icon: "📸",
        t: "Upload a profile photo",
        d: "Speaker profiles with a photo get 3× more requests. Put a face to your name.",
      },
      {
        icon: "🔗",
        t: "Connect your social links",
        d: "Link your Twitter, LinkedIn, and personal website for full visibility.",
      },
    ],
    testimonial: {
      quote:
        '"SpeakWise made it so easy to get found. I went from zero to three confirmed speaking gigs in my first month."',
      name: "Amara Osei",
      role: "Tech Speaker, Accra",
    },
  },
  organizer: {
    eyebrow: "Welcome, Organizer",
    heroHeading: "Great events start with great speakers.",
    heroBody:
      "SpeakWise connects you with verified, talented speakers ready to take the stage at your event. Start building your lineup today.",
    ctaLabel: "Go to Dashboard",
    cta: `${BASE_URL}/dashboard/organizer`,
    steps: [
      {
        icon: "🏗️",
        t: "Create your organization",
        d: "Set up your org profile to manage events and send official speaker requests.",
      },
      {
        icon: "📅",
        t: "Add your first event",
        d: "Create an event listing and start building your speaker lineup.",
      },
      {
        icon: "🔍",
        t: "Discover speakers",
        d: "Browse profiles, filter by topic and region, and send requests in minutes.",
      },
    ],
    testimonial: {
      quote:
        '"We found our keynote speaker in under 10 minutes. SpeakWise has completely changed how we plan our events."',
      name: "Esi Quartey",
      role: "Event Director, TechFest",
    },
  },
  attendee: {
    eyebrow: "Welcome to SpeakWise",
    heroHeading: "Your front row seat to amazing events.",
    heroBody:
      "Discover tech talks, workshops, and conferences in your area. Follow your favourite speakers and never miss an event.",
    ctaLabel: "Explore Events",
    cta: `${BASE_URL}/discover`,
    steps: [
      {
        icon: "🔍",
        t: "Discover events",
        d: "Find tech talks, conferences, and workshops happening near you or online.",
      },
      {
        icon: "🎤",
        t: "Follow speakers",
        d: "Browse speaker profiles and follow the voices you care about most.",
      },
      {
        icon: "⭐",
        t: "Leave feedback",
        d: "Share anonymous feedback after events to help speakers grow and improve.",
      },
    ],
    testimonial: {
      quote:
        '"I found three amazing local events I would never have known about. SpeakWise is now my go-to for discovering what\'s happening."',
      name: "Kwame Asante",
      role: "SpeakWise Attendee",
    },
  },
};

export default function Welcome({
  userName = "Alex",
  userRole = "speaker",
  dashboardUrl,
}: WelcomeProps) {
  const config = roleConfig[userRole];
  const ctaUrl = dashboardUrl ?? config.cta;

  return (
    <EmailLayout
      preview={`Welcome to SpeakWise, ${userName}! 🎉`}
      announcementText="You're officially part of the SpeakWise community"
    >
      {/* Greeting */}
      <Section style={styles.introSection}>
        <Text style={styles.wave}>👋</Text>
        <Text style={styles.eyebrow}>{config.eyebrow}</Text>
        <Heading style={styles.heading}>
          Welcome to SpeakWise, {userName}!
        </Heading>
        <Text style={styles.body}>
          Your account is ready. Here's everything you need to know to get
          started and make the most of your SpeakWise experience.
        </Text>
      </Section>

      {/* Dark hero */}
      <Section style={styles.heroSection}>
        <Text style={styles.heroHeading}>{config.heroHeading}</Text>
        <Text style={styles.heroBody}>{config.heroBody}</Text>
        <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
          <EmailButton href={ctaUrl}>{config.ctaLabel}</EmailButton>
        </Section>
      </Section>

      {/* Steps */}
      <Section style={styles.stepsSection}>
        <Text style={styles.stepsTitle}>Get started in 3 steps</Text>

        {config.steps.map((step, i) => (
          <Row key={i} style={i < config.steps.length - 1 ? styles.stepRow : styles.stepRowLast}>
            <Column style={styles.stepNumCol}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </Column>
            <Column>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepTitle}>{step.t}</Text>
              <Text style={styles.stepDesc}>{step.d}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Testimonial */}
      <Section style={styles.testimonialSection}>
        <Text style={styles.stars}>★★★★★</Text>
        <Text style={styles.testimonialQuote}>{config.testimonial.quote}</Text>
        <Text style={styles.testimonialName}>{config.testimonial.name}</Text>
        <Text style={styles.testimonialRole}>{config.testimonial.role}</Text>
      </Section>

      {/* Final CTA */}
      <Section style={styles.finalCta}>
        <Text style={styles.finalCtaText}>
          Ready to dive in? Your community is waiting.
        </Text>
        <Section style={{ textAlign: "center" as const, marginTop: "16px" }}>
          <EmailButton href={ctaUrl} variant="secondary">
            {config.ctaLabel}
          </EmailButton>
        </Section>
      </Section>

      <Section style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          If you have any questions, just reply to this email — we're happy to
          help. Welcome aboard!
        </Text>
      </Section>
    </EmailLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  introSection: {
    padding: "36px 40px 28px",
    textAlign: "center" as const,
  },
  wave: {
    fontSize: "40px",
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
    margin: 0,
  },
  heroSection: {
    backgroundColor: brand.dark,
    padding: "36px 40px",
    textAlign: "center" as const,
  },
  heroHeading: {
    color: brand.white,
    fontSize: "24px",
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
    borderBottom: `1px solid ${brand.border}`,
    marginBottom: "18px",
    paddingBottom: "18px",
  },
  stepRowLast: {
    marginBottom: 0,
  },
  stepNumCol: {
    paddingRight: "14px",
    verticalAlign: "top",
    width: "36px",
  },
  stepNum: {
    backgroundColor: brand.blue,
    borderRadius: "50%",
    color: brand.white,
    fontSize: "13px",
    fontWeight: "700",
    height: "28px",
    lineHeight: "28px",
    margin: "2px 0 0",
    textAlign: "center" as const,
    width: "28px",
  },
  stepIcon: {
    fontSize: "18px",
    margin: "0 0 2px",
  },
  stepTitle: {
    color: brand.dark,
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 3px",
  },
  stepDesc: {
    color: brand.muted,
    fontSize: "13px",
    lineHeight: "1.5",
    margin: 0,
  },
  testimonialSection: {
    backgroundColor: brand.white,
    borderTop: `1px solid ${brand.border}`,
    padding: "32px 40px",
    textAlign: "center" as const,
  },
  stars: {
    color: "#f59e0b",
    fontSize: "20px",
    letterSpacing: "3px",
    margin: "0 0 14px",
  },
  testimonialQuote: {
    color: "#334155",
    fontSize: "15px",
    fontStyle: "italic",
    lineHeight: "1.8",
    margin: "0 0 16px",
  },
  testimonialName: {
    color: brand.dark,
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 2px",
  },
  testimonialRole: {
    color: brand.muted,
    fontSize: "12px",
    margin: 0,
  },
  finalCta: {
    backgroundColor: brand.blueLight,
    padding: "28px 40px",
    textAlign: "center" as const,
  },
  finalCtaText: {
    color: brand.darkMid,
    fontSize: "16px",
    fontWeight: "600",
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
