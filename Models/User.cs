using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace MileStone_Game.Models
{
    public class User
    {

        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$", ErrorMessage = "Password must contain at least 3 characters, one letter and one number")]
        [Required]
        public string Password { get; set; }
    }
}
