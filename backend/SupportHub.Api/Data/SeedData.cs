using SupportHub.Api.Models;

namespace SupportHub.Api.Data;

public static class SeedData
{
    public static void EnsureSeed(AppDbContext db)
    {
        if (db.Queues.Any()) return;

        var billing = new Queue { Name = "Billing", Description = "Payments, refunds, invoices" };
        var tech = new Queue { Name = "Tech Support", Description = "Bugs, login, errors" };
        var general = new Queue { Name = "General", Description = "Everything else" };
        db.Queues.AddRange(billing, tech, general);

        // Demo users (password = "password")
        var admin = new User { Name = "Admin", Email = "admin@demo.local", PasswordHash = Password.Hash("password"), Role = UserRole.Admin };
        var sup = new User { Name = "Supervisor", Email = "super@demo.local", PasswordHash = Password.Hash("password"), Role = UserRole.Supervisor };
        var a1 = new User { Name = "Agent Alex", Email = "alex@demo.local", PasswordHash = Password.Hash("password"), Role = UserRole.Agent };
        var a2 = new User { Name = "Agent Bea", Email = "bea@demo.local", PasswordHash = Password.Hash("password"), Role = UserRole.Agent };
        db.Users.AddRange(admin, sup, a1, a2);

        db.Agents.AddRange(
            new Agent { UserId = a1.Id, Presence = Presence.Available, MaxActiveTickets = 5, SkillsCsv = "billing,refunds" },
            new Agent { UserId = a2.Id, Presence = Presence.Available, MaxActiveTickets = 5, SkillsCsv = "tech,login" }
        );

        // Map agents to queues
        db.AgentQueues.AddRange(
            new AgentQueue { AgentUserId = a1.Id, QueueId = 1 }, // Billing
            new AgentQueue { AgentUserId = a2.Id, QueueId = 2 }, // Tech
            new AgentQueue { AgentUserId = a1.Id, QueueId = 3 }, // General
            new AgentQueue { AgentUserId = a2.Id, QueueId = 3 }  // General
        );

        // Routing rules (simple JSON format you can edit)
        // ConditionJson supports: keywords[], isVip?, channel?
        // ActionJson supports: queueName, priority, category, autoAssignAgent(bool)
        db.RoutingRules.AddRange(
            new RoutingRule
            {
                Name = "VIP -> Urgent + General",
                PriorityOrder = 1,
                ConditionJson = """{"isVip":true}""",
                ActionJson = """{"queueName":"General","priority":"Urgent","category":"VIP","autoAssignAgent":true}"""
            },
            new RoutingRule
            {
                Name = "Billing keywords -> Billing queue",
                PriorityOrder = 2,
                ConditionJson = """{"keywords":["refund","invoice","charged","billing","payment"]}""",
                ActionJson = """{"queueName":"Billing","priority":"High","category":"Billing","autoAssignAgent":true}"""
            },
            new RoutingRule
            {
                Name = "Tech keywords -> Tech queue",
                PriorityOrder = 3,
                ConditionJson = """{"keywords":["error","crash","login","bug","cannot","issue"]}""",
                ActionJson = """{"queueName":"Tech Support","priority":"Normal","category":"Tech","autoAssignAgent":true}"""
            },
            new RoutingRule
            {
                Name = "SMS -> High priority",
                PriorityOrder = 4,
                ConditionJson = """{"channel":"SMS"}""",
                ActionJson = """{"queueName":"General","priority":"High","category":"SMS","autoAssignAgent":true}"""
            },
            new RoutingRule
            {
                Name = "Fallback -> General",
                PriorityOrder = 999,
                ConditionJson = """{}""",
                ActionJson = """{"queueName":"General","priority":"Normal","category":"General","autoAssignAgent":true}"""
            }
        );

        db.SaveChanges();
    }
}
