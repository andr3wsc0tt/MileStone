using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using MileStone_Game.Hubs;
using static MileStone_Game.Hubs.GameHub;

namespace MileStone_Game
{
    public class Game : BackgroundService
    {
        private readonly IHubContext<GameHub> _hubContext;

        public Game(IHubContext<GameHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public void checkAndRegisterHits(Dictionary<string, Position> players)
        {
            
            foreach (var player in players)
            {
                for (int bul = player.Value.bullets.Count - 1; bul >= 0; bul--)
                {
                    player.Value.bullets[bul].x += player.Value.bullets[bul].dx;
                    player.Value.bullets[bul].y -= player.Value.bullets[bul].dy;

                    foreach (var player2 in players)
                    {
                        if (player2.Key != player.Key)
                        {
                            if (Math.Abs(player.Value.bullets[bul].x - player2.Value.x) + Math.Abs(player.Value.bullets[bul].y - player2.Value.y) < 20 && player2.Value.hp > 0)
                            {
                                player.Value.bullets.RemoveAt(bul);
                                player2.Value.hp -= 1;

                                if (player2.Value.hp == 0)
                                    player2.Value.score += 10;
                                else
                                    player2.Value.score += 5;
                                break;

                            }
                        }
                    }
                }

            }
        }

        public void explosionAnimation(Dictionary<string, Position> players)
        {
            foreach (var player in players)
            {
                if (player.Value.hp <= 0)
                {
                    player.Value.death += 1;
                }

                if (player.Value.death >= 250)
                {
                    players.Remove(player.Key);
                }
            }
        }


        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var players = GameHub.getPlayers();
                checkAndRegisterHits(players);
                explosionAnimation(players);
                
                var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(GameHub.getPlayers());
                await _hubContext.Clients.All.SendAsync("state", jsonString);
                await Task.Delay(1000/60);
            }
        }
    }
}
