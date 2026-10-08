const FIELD_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  nationality: "Nationality",
  username: "Username",
  email: "Email",
  password: "Password",
  password_confirm: "Password confirmation",
  organization: "Organization",
  short_bio: "Short bio",
  long_bio: "Biography",
  country: "Country",
  name: "Name",
  website: "Website",
  contact_email: "Contact email",
  non_field_errors: "",
  detail: "",
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check the highlighted fields and try again.",
  401: "Please sign in again to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you requested.",
  409: "This conflicts with existing information. Check your details and try again.",
  429: "Too many requests. Wait a moment and try again.",
};

function getStatusMessage(status?: number): string | null {
  if (!status) return null;
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) return "Something went wrong on our end. Please try again.";
  if (status >= 400) return "We couldn't complete that request. Please check your details and try again.";
  return null;
}

function formatFieldName(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValidationMessage(field: string, message: string): string {
  const label = formatFieldName(field);
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (lower === "this field may not be blank." || lower === "this field is required.") {
    return `${label} is required.`;
  }
  if (lower === "this field may not be null.") {
    return `Please provide ${label.toLowerCase()}.`;
  }
  if (field === "non_field_errors" || !label) return normalized;
  if (normalized.toLowerCase().startsWith(`${label.toLowerCase()} `)) return normalized;
  return `${label}: ${normalized}`;
}

export function getApiFieldErrors(data: unknown): Record<string, string> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};

  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>)
      .filter(([field]) => !["code", "detail", "non_field_errors"].includes(field))
      .flatMap(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        const firstMessage = messages.find((message): message is string => typeof message === "string");
        return firstMessage ? [[field, formatValidationMessage(field, firstMessage)]] : [];
      }),
  );
}

export function getApiErrorMessage(data: unknown, status?: number): string | null {
  if (status && status >= 500) return getStatusMessage(status);
  if (typeof data === "string" && data.trim()) return data.trim();
  if (Array.isArray(data)) {
    const messages = data.filter((message): message is string => typeof message === "string");
    if (messages.length) return messages.join(" ");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return getStatusMessage(status);
  }

  const errorData = data as Record<string, unknown>;
  const detail = errorData.detail ?? errorData.message;
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (Array.isArray(detail)) {
    const messages = detail.filter((message): message is string => typeof message === "string");
    if (messages.length) return messages.join(" ");
  }

  const nonFieldErrors = errorData.non_field_errors;
  if (Array.isArray(nonFieldErrors)) {
    const messages = nonFieldErrors.filter((message): message is string => typeof message === "string");
    if (messages.length) return messages.join(" ");
  }

  const fields = getApiFieldErrors(data);
  const messages = Object.values(fields);
  if (messages.length) return messages.join(" ");

  return getStatusMessage(status);
}
