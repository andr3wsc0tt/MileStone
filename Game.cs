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
    // This is the background service that acts as the updating server. (The hard part.)
    public class Game : BackgroundService
    {
        private readonly IHubContext<GameHub> _hubContext; // Inject the GameHub Context

        public Game(IHubContext<GameHub> hubContext) 
        {
            _hubContext = hubContext;
        }

        // Check hits and Remove bullets that leave the canvas.
        public void checkAndRegisterHits(ConcurrentDictionary<string, Player> players)
        {
            int canvasHeight = GameHub.canvasH;
            int canvasWidth = GameHub.canvasW;

            foreach (var player in players)
            {
                // Since we are removing objects from a list, we iterate backwards so that we don't remove an object then iterate onto an out of range value
                for (int bul = player.Value.bullets.Count - 1; bul >= 0; bul--)
                {
                    // Advance the bullet trajectory
                    player.Value.bullets[bul].x += player.Value.bullets[bul].dx; 
                    player.Value.bullets[bul].y -= player.Value.bullets[bul].dy;

                    // If the bullet is out of the screen, remove it and continue
                    if (player.Value.bullets[bul].x < 0 || player.Value.bullets[bul].x > canvasWidth || player.Value.bullets[bul].y < 0 || player.Value.bullets[bul].y > canvasHeight)
                    {
                        player.Value.bullets.RemoveAt(bul);
                        continue;
                    }

                    // Check for hits
                    foreach (var player2 in players)
                    {
                        // If you're not hitting yourself
                        if (player2.Key != player.Key)
                        {
                            // If the Manhattan distance is less than 20...You're HIT!
                            if (Math.Abs(player.Value.bullets[bul].x - player2.Value.x) + Math.Abs(player.Value.bullets[bul].y - player2.Value.y) < 20 && player2.Value.hp > 0)
                            {
                                player.Value.bullets.RemoveAt(bul); // Remove the bullet
                                player2.Value.hp -= 1; // Take Damage

                                if (player2.Value.hp == 0)
                                    player.Value.score += 25; // 25 points for a kill
                                else
                                    player.Value.score += 10; // 10 points for a hit
                                break;

                            }
                        }
                    }
                }

            }
        }

        public void explosionAnimation(ConcurrentDictionary<string, Player> players)
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
