using Microsoft.EntityFrameworkCore;
using MileStone_Game.Models;
namespace MileStone_Game.Data
{
    public class UserContext : DbContext
    {
        public UserContext (DbContextOptions<UserContext> options) : base(options)
        {

        }

        public DbSet<User> User { get; set; }
    }
}
