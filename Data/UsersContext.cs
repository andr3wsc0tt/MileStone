using Microsoft.EntityFrameworkCore;
using MileStone_Game.Models;
namespace MileStone_Game.Data
{
    public class UserContext : DbContext
    {
        public UserContext (DbContextOptions<UserContext> options) : base(options)
        {

        }
        // User DB
        public DbSet<User> User { get; set; }

        // HighScore DB
        public DbSet<Score> Score { get; set; }
    }
}
