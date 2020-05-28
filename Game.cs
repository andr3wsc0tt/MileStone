using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MileStone_Game.Hubs;

namespace MileStone_Game
{
    public class Game : BackgroundService
    {
        private readonly IHubContext<GameHub> _hubContext;

        public Game(IHubContext<GameHub> hubContext)
        {
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(GameHub.getPlayers());
                await _hubContext.Clients.All.SendAsync("state", jsonString);
                await Task.Delay(1000/60);
            }

            
        }
    }
}
