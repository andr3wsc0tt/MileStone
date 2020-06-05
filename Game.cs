using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using MileStone_Game.Hubs;
using static MileStone_Game.Hubs.GameHub;
using System.Collections.Concurrent;
using System.Linq;

namespace MileStone_Game
{
    public class Game : BackgroundService
    {
        private readonly IHubContext<GameHub> _hubContext;

        public Game(IHubContext<GameHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public void checkAndRegisterHits(ConcurrentDictionary<string, Position> players)
        {
            int canvasHeight = GameHub.canvasH;
            int canvasWidth = GameHub.canvasW;

            foreach (var player in players)
            {
                for (int bul = player.Value.bullets.Count - 1; bul >= 0; bul--)
                {

                    player.Value.bullets[bul].x += player.Value.bullets[bul].dx;
                    player.Value.bullets[bul].y -= player.Value.bullets[bul].dy;

                    // if x < 0 or y < 0 or x > canvas.width or x > canvas.height !Remove

                    if (player.Value.bullets[bul].x < 0 || player.Value.bullets[bul].x > canvasWidth || player.Value.bullets[bul].y < 0 || player.Value.bullets[bul].y > canvasHeight)
                    {
                        player.Value.bullets.RemoveAt(bul);
                        break;
                    }

                    foreach (var player2 in players)
                    {
                        if (player2.Key != player.Key)
                        {
                            if (Math.Abs(player.Value.bullets[bul].x - player2.Value.x) + Math.Abs(player.Value.bullets[bul].y - player2.Value.y) < 20 && player2.Value.hp > 0)
                            {
                                player.Value.bullets.RemoveAt(bul);
                                player2.Value.hp -= 1;

                                if (player2.Value.hp == 0)
                                    player.Value.score += 25;
                                else
                                    player.Value.score += 10;
                                break;

                            }
                        }
                    }
                }

            }
        }

        public void explosionAnimation(ConcurrentDictionary<string, Position> players)
        {
            foreach (var player in players)
            {
                if (player.Value.hp <= 0)
                {
                    player.Value.death += 1;
                }

                if (player.Value.death >= 250)
                {

                    players.TryRemove(player.Key, out _);
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

                try
                {
                    var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(players);
                    await _hubContext.Clients.All.SendAsync("state", jsonString);
                    await Task.Delay(1000 / 60);
                }
                catch(Exception ex)
                {
                    Console.WriteLine(ex);
                }
            }
        }
    }
}
