using Microsoft.AspNetCore.SignalR;

namespace MileStone_Game.Hubs
{
    public class ChatHub: Hub
    {
        public void SendToAll(string name, string message) // When one client sends a 'sendToAll' (which is matched by the name of THIS function 'SendToAll(string name, string message)'
        {
            // The Hub sends the received name and message to all clients.
            Clients.All.SendAsync("sendToAll", name, message);
        }
    }
}
