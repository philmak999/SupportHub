using Microsoft.EntityFrameworkCore;
using SupportHub.Api.Models;

namespace SupportHub.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Agent> Agents => Set<Agent>();
    public DbSet<Queue> Queues => Set<Queue>();
    public DbSet<AgentQueue> AgentQueues => Set<AgentQueue>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<RoutingRule> RoutingRules => Set<RoutingRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgentQueue>()
            .HasKey(aq => new { aq.AgentUserId, aq.QueueId });

        modelBuilder.Entity<AgentQueue>()
            .HasOne(aq => aq.Agent)
            .WithMany(a => a.AgentQueues)
            .HasForeignKey(aq => aq.AgentUserId);

        modelBuilder.Entity<AgentQueue>()
            .HasOne(aq => aq.Queue)
            .WithMany(q => q.AgentQueues)
            .HasForeignKey(aq => aq.QueueId);

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.Ticket)
            .WithOne(t => t.Conversation!)
            .HasForeignKey<Ticket>(t => t.ConversationId);

        base.OnModelCreating(modelBuilder);
    }
}
