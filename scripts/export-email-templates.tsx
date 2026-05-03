/**
 * Renders each React Email template to HTML with Django template variable
 * placeholders, then writes the output to the Django backend's template
 * directories. Run with: pnpm export-emails
 *
 * The generated .html files are loaded by Django's template engine, which
 * substitutes {{ variable_name }} before passing the result as html_message
 * to send_mail().
 */
import * as React from "react";
import { render } from "react-email";
import * as fs from "fs";
import * as path from "path";

import Welcome from "../emails/welcome";
import PasswordReset from "../emails/password-reset";
import RequestAccepted from "../emails/request-accepted";
import RequestRejected from "../emails/request-rejected";
import SpeakerEmailRequestReceived from "../emails/speaker-email-request-received";
import SpeakerOrgRequestReceived from "../emails/speaker-org-request-received";

const BACKEND_ROOT = path.resolve(__dirname, "../../speakwise-backend");

async function exportTemplate(element: React.ReactElement, relativePath: string) {
  const html = await render(element);
  const outPath = path.join(BACKEND_ROOT, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf-8");
  console.log(`  ✓ ${relativePath}`);
}

async function main() {
  console.log("Exporting React Email templates → Django HTML templates...\n");

  // welcome_<role>.html — one file per role so the role-specific copy is
  // fully baked in at export time. Django picks the right file:
  //   render_to_string('emails/welcome_speaker.html', {'user_name': ...})
  // Django context: user_name, dashboard_url
  for (const role of ["speaker", "organizer", "attendee"] as const) {
    await exportTemplate(
      <Welcome
        userName="{{ user_name }}"
        userRole={role}
        dashboardUrl="{{ dashboard_url }}"
      />,
      `users/templates/emails/welcome_${role}.html`
    );
  }

  // password_reset.html
  // Django context: user_name, reset_url
  await exportTemplate(
    <PasswordReset
      userName="{{ user_name }}"
      resetUrl="{{ reset_url }}"
      expiryHours={72}
    />,
    "users/templates/emails/password_reset.html"
  );

  // speaker_org_request_received.html
  // Django context: speaker_name, organization_name, organizer_name,
  //                 event_name, event_date, message, request_id
  await exportTemplate(
    <SpeakerOrgRequestReceived
      speakerName="{{ speaker_name }}"
      organizationName="{{ organization_name }}"
      organizerName="{{ organizer_name }}"
      eventName="{{ event_name }}"
      eventDate="{{ event_date }}"
      message="{{ message }}"
      requestId={"{{ request_id }}" as unknown as number}
    />,
    "speakerrequests/templates/emails/speaker_org_request_received.html"
  );

  // speaker_email_request_received.html
  // Django context: speaker_name, requester_name, requester_email,
  //                 event_name, event_location, message, request_id
  await exportTemplate(
    <SpeakerEmailRequestReceived
      speakerName="{{ speaker_name }}"
      requesterName="{{ requester_name }}"
      requesterEmail="{{ requester_email }}"
      eventName="{{ event_name }}"
      eventLocation="{{ event_location }}"
      message="{{ message }}"
      requestId="{{ request_id }}"
    />,
    "speakerrequests/templates/emails/speaker_email_request_received.html"
  );

  // request_accepted.html
  // Django context: requester_name, speaker_name, speaker_title,
  //                 event_name, event_date, event_location,
  //                 speaker_profile_url, dashboard_url
  await exportTemplate(
    <RequestAccepted
      requesterName="{{ requester_name }}"
      speakerName="{{ speaker_name }}"
      speakerTitle="{{ speaker_title }}"
      eventName="{{ event_name }}"
      eventDate="{{ event_date }}"
      eventLocation="{{ event_location }}"
      speakerProfileUrl="{{ speaker_profile_url }}"
      dashboardUrl="{{ dashboard_url }}"
    />,
    "speakerrequests/templates/emails/request_accepted.html"
  );

  // request_rejected.html
  // Django context: requester_name, speaker_name, event_name, discover_url
  await exportTemplate(
    <RequestRejected
      requesterName="{{ requester_name }}"
      speakerName="{{ speaker_name }}"
      eventName="{{ event_name }}"
      discoverUrl="{{ discover_url }}"
    />,
    "speakerrequests/templates/emails/request_rejected.html"
  );

  console.log("\nDone. Commit the generated .html files in the backend repo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
