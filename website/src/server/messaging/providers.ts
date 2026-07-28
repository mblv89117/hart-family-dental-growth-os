export type SendResult = {
  ok: boolean;
  providerMessageId?: string;
  detail: string;
};

export interface EmailProvider {
  send(input: { to: string; subject: string; text: string; purpose: string }): Promise<SendResult>;
}

export interface SmsProvider {
  send(input: { to: string; body: string; purpose: string }): Promise<SendResult>;
}

export interface VoiceProvider {
  notify(input: { to: string; purpose: string }): Promise<SendResult>;
}

export interface ChatProvider {
  send(input: { conversationId: string; body: string }): Promise<SendResult>;
}

export interface StaffNotificationProvider {
  notify(input: { userId?: string; title: string; body: string }): Promise<SendResult>;
}

export class MockEmailProvider implements EmailProvider {
  sent: Array<Record<string, string>> = [];
  async send(input: { to: string; subject: string; text: string; purpose: string }) {
    this.sent.push(input);
    return { ok: true, providerMessageId: `mock_email_${this.sent.length}`, detail: "mock_queued" };
  }
}

export class MockSmsProvider implements SmsProvider {
  sent: Array<Record<string, string>> = [];
  async send(input: { to: string; body: string; purpose: string }) {
    this.sent.push(input);
    return { ok: true, providerMessageId: `mock_sms_${this.sent.length}`, detail: "mock_queued" };
  }
}

export class MockVoiceProvider implements VoiceProvider {
  async notify() {
    return { ok: true, providerMessageId: "mock_voice_1", detail: "mock_disabled" };
  }
}

export class MockChatProvider implements ChatProvider {
  async send() {
    return { ok: true, providerMessageId: "mock_chat_1", detail: "mock_ok" };
  }
}

export class MockStaffNotificationProvider implements StaffNotificationProvider {
  notifications: Array<Record<string, string>> = [];
  async notify(input: { userId?: string; title: string; body: string }) {
    this.notifications.push({ ...input, userId: input.userId || "" });
    return { ok: true, providerMessageId: `mock_staff_${this.notifications.length}`, detail: "mock_ok" };
  }
}

let mocks = {
  email: new MockEmailProvider(),
  sms: new MockSmsProvider(),
  voice: new MockVoiceProvider(),
  chat: new MockChatProvider(),
  staff: new MockStaffNotificationProvider(),
};

export function getMockProviders() {
  return mocks;
}

export function resetMockProviders() {
  mocks = {
    email: new MockEmailProvider(),
    sms: new MockSmsProvider(),
    voice: new MockVoiceProvider(),
    chat: new MockChatProvider(),
    staff: new MockStaffNotificationProvider(),
  };
}

export function draftFirstResponse(input: { name: string; locationName: string; service?: string }) {
  return (
    `Hello ${input.name}, thank you for contacting Hart Family Dental (${input.locationName}). ` +
    `We received your request${input.service ? ` about ${input.service}` : ""}. ` +
    `A team member will follow up shortly to help with scheduling. ` +
    `This is not clinical advice. Reply STOP to opt out of text messages.`
  );
}
