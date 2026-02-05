namespace SupportHub.Api.Models;

public enum UserRole { Agent, Supervisor, Admin }
public enum Presence { Available, Busy, Away, Offline }
public enum Channel { Chat, Email, SMS }
public enum Direction { Inbound, Outbound }
public enum TicketStatus { New, Open, Pending, Resolved, Closed }
public enum TicketPriority { Low, Normal, High, Urgent }