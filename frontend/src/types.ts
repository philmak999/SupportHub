export type Role = "Agent" | "Supervisor" | "Admin";

export type TicketListItem = {
  id: number;
  customerName: string;
  channel: string;
  queue: string;
  status: string;
  priority: string;
  category: string;
  assignedAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationView = {
  ticketId: number;
  customer: { name: string; email: string; phone: string; isVip: boolean };
  conversationId: number;
  channel: string;
  subject: string | null;
  messages: { id: number; direction: string; from: string; body: string; sentAt: string }[];
};

export type Queue = { id: number; name: string; description: string };

export type RuleDto = {
  id: number;
  name: string;
  isEnabled: boolean;
  priorityOrder: number;
  conditionJson: string;
  actionJson: string;
};
