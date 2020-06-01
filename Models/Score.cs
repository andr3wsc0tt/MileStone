using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace MileStone_Game.Models
{
    public class Score
    {

        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public int Highscore { get; set; }
    }
}
