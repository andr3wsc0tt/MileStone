using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MileStone_Game.Hubs
{
    public class GameHub : Hub
    {

        private static Dictionary<string, Position> players = new Dictionary<string, Position>();
        private static DateTime lastPress = DateTime.Now;

        public static Dictionary<string, Position> getPlayers()
        {
            return players;
        }

        public class Bullet
        {
            public double x;
            public double y;
            public double angle;
            public double dx;
            public double dy;
            public Bullet(double x, double y, double angle)
            {
                this.x = x;
                this.y = y;
                this.angle = angle;
                this.dx = Math.Cos(this.angle * (Math.PI / 180.0)) * 3;
                this.dy = Math.Sin(this.angle * (Math.PI / 180.0)) * 3;
            }
        }
        public class MovementClass
        {
            public bool left;
            public bool right;
            public bool up;
            public bool down;
            public bool space;
        }

        public class Position
        {
            public double x;
            public double y;
            public double angle;
            public int hp;
            public int death;
            public int score;
            public List<Bullet> bullets;

            public Position(int x, int y)
            {
                this.x = x;
                this.y = y;
                this.angle = 0;
                this.hp = 5;
                this.death = 0;
                this.score = 0;
                bullets = new List<Bullet>();
            }
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine("Client Connected");
            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception ex)
        {
            Console.WriteLine("Client Disconnected");
            players.Remove(Context.ConnectionId);
            return base.OnDisconnectedAsync(ex);
        }

        public void State()
        {
            Console.WriteLine("STATE");
            var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(players);
            Clients.All.SendAsync("state", jsonString);
        }

        public string NewPlayer()
        {
            Console.WriteLine("New Player");
            Position pos = new Position(300, 300);
            players.Add(Context.ConnectionId, pos);
            Console.WriteLine(players[Context.ConnectionId]);
            return Context.ConnectionId;
            
        }

        public void Movement(object movement)
        {
            // Console.WriteLine(movement.ToString());

            MovementClass movementClass = JsonConvert.DeserializeObject<MovementClass>(movement.ToString());

            if (movementClass.left)
            {
                players[Context.ConnectionId].angle += 3;
                players[Context.ConnectionId].angle %= 360;
            }
            if (movementClass.right)
            {
                players[Context.ConnectionId].angle -= 3;
                players[Context.ConnectionId].angle %= 360;
            }
            if (movementClass.up)
            {
                players[Context.ConnectionId].x += Math.Cos(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5;
                players[Context.ConnectionId].y -= Math.Sin(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5;
            }
            if (movementClass.down)
            {
                players[Context.ConnectionId].x -= Math.Cos(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5;
                players[Context.ConnectionId].y += Math.Sin(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5;
            }
            if(movementClass.space)
            {
                DateTime nowPress = DateTime.Now;
                
                if (nowPress.Subtract(lastPress).TotalMilliseconds > 500)
                {
                    lastPress = nowPress;
                    players[Context.ConnectionId].bullets.Add(new Bullet(players[Context.ConnectionId].x, players[Context.ConnectionId].y, players[Context.ConnectionId].angle));
                }
            }

        }
    }
}
