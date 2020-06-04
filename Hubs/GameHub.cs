using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MileStone_Game.Hubs
{
    public class GameHub : Hub
    {

        public static int canvasH = 900;
        public static int canvasW = 1200;
        private static int fireRate = 100;

        private static ConcurrentDictionary<string, Position> players = new ConcurrentDictionary<string, Position>();
        private static DateTime lastPress = DateTime.Now;

        public static ConcurrentDictionary<string, Position> getPlayers()
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

            private static int bulletSpeed = 5;

            public Bullet(double x, double y, double angle)
            {
                this.x = x;
                this.y = y;
                this.angle = angle;
                this.dx = Math.Cos(this.angle * (Math.PI / 180.0)) * bulletSpeed;
                this.dy = Math.Sin(this.angle * (Math.PI / 180.0)) * bulletSpeed;
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

            public double ax;
            public double ay;
            public double bx;
            public double by;
            public double cx;
            public double cy;

            public double angle;
            public int hp;
            public int death;
            public int score;
            public List<Bullet> bullets;

            public Position(int x, int y)
            {
                this.x = x;
                this.y = y;


                ax = this.x + 10.0;
                ay = this.y;

                bx = this.x - 15.0;
                by = this.y - 12.5;

                cx = this.x - 15.0;
                cy = this.y + 12.5;

                this.angle = 0;
                this.hp = 5;
                this.death = 0;
                this.score = 0;
                bullets = new List<Bullet>();
            }
        }

        public class InitClass
        {
            public string connectionId;
            public int canvasHeight;
            public int canvasWidth;

            public InitClass(string connectionId, int canvasHeight,int canvasWidth)
            {
                this.connectionId = connectionId;
                this.canvasHeight = canvasHeight;
                this.canvasWidth = canvasWidth;
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
            players.TryRemove(Context.ConnectionId, out _);
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
            players.TryAdd(Context.ConnectionId, pos);

            string json = JsonConvert.SerializeObject(new InitClass(Context.ConnectionId, canvasH, canvasW));

            return json;
        }

        public void Movement(object movement)
        {
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
                
                if (nowPress.Subtract(lastPress).TotalMilliseconds > fireRate)
                {
                    lastPress = nowPress;
                    players[Context.ConnectionId].bullets.Add(new Bullet(players[Context.ConnectionId].x, players[Context.ConnectionId].y, players[Context.ConnectionId].angle));
                }
            }

            double radians = (Math.PI / 180.0) * players[Context.ConnectionId].angle;
            double cos = Math.Cos(radians);
            double sin = Math.Sin(radians);

            double x = players[Context.ConnectionId].x;
            double y = players[Context.ConnectionId].y;

            double ax = x + 10.0;
            double ay = y;

            double bx = x - 15.0;
            double by = y - 12.5;

            double cx = x - 15.0;
            double cy = y + 12.5;

            players[Context.ConnectionId].ax = (cos * (ax - x)) + (sin * (ay - y)) + x;
            players[Context.ConnectionId].ay = (cos * (ay - y)) - (sin * (ax - x)) + ay;

            players[Context.ConnectionId].bx = (cos * (bx - x)) + (sin * (by - y)) + x;
            players[Context.ConnectionId].by = (cos * (by - y)) - (sin * (bx - x)) + y;

            players[Context.ConnectionId].cx = (cos * (cx - x)) + (sin * (cy - y)) + x;
            players[Context.ConnectionId].cy = (cos * (cy - y)) - (sin * (cx - x)) + y;

        }
    }
}
