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
        // Initialization variables - Height / Width / Fire Rate
        public static int canvasH = 900;
        public static int canvasW = 1200;
        private static int fireRate = 250;

        private static ConcurrentDictionary<string, Player> players = new ConcurrentDictionary<string, Player>(); // Holds all player Data
        private static ConcurrentDictionary<string, DateTime> lastPress = new ConcurrentDictionary<string, DateTime>(); // Holds all player Input Timers

        // Passes all player information to the BackgroundService
        public static ConcurrentDictionary<string, Player> getPlayers()
        {
            return players; 
        }

        public class Bullet
        {
            public int x;
            public int y;
            public int angle;
            public int dx;
            public int dy;

            private static int bulletSpeed = 10; // Default bullet speed

            public Bullet(int x, int y, int angle)
            {
                this.x = x;
                this.y = y;
                this.angle = angle;


                // dx and dy are the changes in x and y value after every more. Since bullets travel in a straight line with constant velocity it only needs to be calculated once to advance its Player every turn.
                this.dx = (int)(Math.Cos(this.angle * (Math.PI / 180.0)) * bulletSpeed);
                this.dy = (int)(Math.Sin(this.angle * (Math.PI / 180.0)) * bulletSpeed);
            }
        }
        // Movement Class needed to deserialize the client data sent by 'Movement' Invocation.
        public class MovementClass
        {
            public bool left;
            public bool right;
            public bool up;
            public bool down;
            public bool space;
        }

        // Holds all Player data for a ship.
        public class Player
        {
            public int x;
            public int y;

            // Three points of Fuselage
            public int ax;
            public int ay;
            public int bx;
            public int by;
            public int cx;
            public int cy;

            public int angle;
            public int hp;
            public int death;
            public int score;
            public List<Bullet> bullets;

            public Player(int x, int y)
            {
                this.x = x;
                this.y = y;

                // Default size of the ship.
                ax = this.x + 10;
                ay = this.y;

                bx = this.x - 15;
                by = this.y - 12;

                cx = this.x - 15;
                cy = this.y + 12;

                this.angle = 0; // Start out looking right.
                this.hp = 20; // 5 Hits and you pass into The Great Unknown.
                this.death = 0;
                this.score = 0;
                bullets = new List<Bullet>();
            }
        }

        // Initializes canvas and player so that all values can be coded into the Hub.
        public class InitClass
        {
            public string connectionId;
            public int canvasHeight;
            public int canvasWidth;
            public int myHealth;

            public InitClass(string connectionId, int canvasHeight,int canvasWidth, int myHealth)
            {
                this.connectionId = connectionId;
                this.canvasHeight = canvasHeight;
                this.canvasWidth = canvasWidth;
                this.myHealth = myHealth;
            }
        }
        
        // Signal Client Connection. 
        public override async Task OnConnectedAsync()
        {
            //Console.WriteLine("Client Connected");
            await base.OnConnectedAsync();
        }

        // On Disconnect remove the user's connection ID from the player dictionary. 
        public override Task OnDisconnectedAsync(Exception ex)
        {
            //Console.WriteLine("Client Disconnected");
            players.TryRemove(Context.ConnectionId, out _);
            return base.OnDisconnectedAsync(ex);
        }

        // Receive NewPlayer invocation from client and return their initialization details
        public string NewPlayer()
        {
            //Console.WriteLine("New Player");
            Player pos = new Player(300, 300); // Randomize this!
            lastPress.TryAdd(Context.ConnectionId, DateTime.Now); // Initialize their FireRate Timer.
            players.TryAdd(Context.ConnectionId, pos); // Initialize their position and connectionId

            string json = JsonConvert.SerializeObject(new InitClass(Context.ConnectionId, canvasH, canvasW, pos.hp)); // Serialize 
            return json; // Send!
        }

        // Get movement invocation
        public void Movement(object movement)
        {
            // Deserialize the Key Stroke Object
            MovementClass movementClass = JsonConvert.DeserializeObject<MovementClass>(movement.ToString());

            if (movementClass.left)
            {
                players[Context.ConnectionId].angle += 3; // Turn rate
                players[Context.ConnectionId].angle %= 360; // Keep the angle within 0 < x < 360

            }
            if (movementClass.right)
            {
                players[Context.ConnectionId].angle -= 3;
                players[Context.ConnectionId].angle %= 360;
            }
            if (movementClass.up)
            {
                players[Context.ConnectionId].x += (int)(Math.Cos(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5); // X advance (based on angle)
                players[Context.ConnectionId].y -= (int)(Math.Sin(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5); // Y advance (based on angle)
            }
            if (movementClass.down)
            {
                players[Context.ConnectionId].x -= (int)(Math.Cos(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5);
                players[Context.ConnectionId].y += (int)(Math.Sin(players[Context.ConnectionId].angle * (Math.PI / 180)) * 3.5);
            }
            if(movementClass.space) // SHOOT!
            {
                DateTime nowPress = DateTime.Now; // Get Time Right Now!
                
                if (nowPress.Subtract(lastPress[Context.ConnectionId]).TotalMilliseconds > fireRate) // If time between now and last pressed is greater than our chosen fire rate. 
                {
                    // Update our last pressed time
                    lastPress[Context.ConnectionId] = nowPress;

                    // Create a new Bullet and add it to that players List<Bullet>
                    players[Context.ConnectionId].bullets.Add(new Bullet(players[Context.ConnectionId].x, players[Context.ConnectionId].y, players[Context.ConnectionId].angle)); 
                }
            }

            // This uses the updated movements to calculate the new coordinates of the ship. 
            // Reference added.

            float radians = (float)((Math.PI / 180.0) * players[Context.ConnectionId].angle);
            float cos = (float)Math.Cos(radians);
            float sin = (float)Math.Sin(radians);

            int x = players[Context.ConnectionId].x;
            int y = players[Context.ConnectionId].y;

            int ax = x + 10;
            int ay = y;

            int bx = x - 15;
            int by = y - 12;

            int cx = x - 15;
            int cy = y + 12;

            players[Context.ConnectionId].ax = (int)((cos * (ax - x)) + (sin * (ay - y)) + x);
            players[Context.ConnectionId].ay = (int)((cos * (ay - y)) - (sin * (ax - x)) + ay);

            players[Context.ConnectionId].bx = (int)((cos * (bx - x)) + (sin * (by - y)) + x);
            players[Context.ConnectionId].by = (int)((cos * (by - y)) - (sin * (bx - x)) + y);

            players[Context.ConnectionId].cx = (int)((cos * (cx - x)) + (sin * (cy - y)) + x);
            players[Context.ConnectionId].cy = (int)((cos * (cy - y)) - (sin * (cx - x)) + y);

        }
    }
}
