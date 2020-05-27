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
        public class MovementClass
        {
            public bool left;
            public bool right;
            public bool up;
            public bool down;
        }

        public class Position
        {
            public int x;
            public int y;

            public Position(int x, int y)
            {
                this.x = x;
                this.y = y;
            }
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine("Client Connected");

            await base.OnConnectedAsync();
        }

        public void State()
        {
            var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(players);
            Clients.All.SendAsync("state", jsonString);
        }

        public void NewPlayer()
        {
            Console.WriteLine("New Player");
            Position pos = new Position(300, 300);
            players.Add(Context.ConnectionId, pos);

            Console.WriteLine(players[Context.ConnectionId]);
        }

        public void Movement(object movement)
        {
            // Console.WriteLine(movement.ToString());

            MovementClass movementClass = JsonConvert.DeserializeObject<MovementClass>(movement.ToString());

            if (movementClass.left)
            {
                players[Context.ConnectionId].x -= 5;
            }
            if (movementClass.right)
            {
                players[Context.ConnectionId].x += 5;
            }
            if (movementClass.up)
            {
                players[Context.ConnectionId].y -= 5;
            }
            if (movementClass.down)
            {
                players[Context.ConnectionId].y += 5;
            }

        }
    }
}
