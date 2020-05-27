using Microsoft.AspNetCore.SignalR;

namespace MileStone_Game.Hubs
{
    public class ChatHub: Hub
    {
        public void SendToAll(string name, string message)
        {
            Clients.All.SendAsync("sendToAll", name, message);
        }
    }
}
