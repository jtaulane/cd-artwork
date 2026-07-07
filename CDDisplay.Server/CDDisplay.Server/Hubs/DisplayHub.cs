using Microsoft.AspNetCore.SignalR;

namespace CDDisplay.Server.Hubs
{
    public class DisplayHub : Hub
    {
        public async Task NotifyAlbumChanged(int albumId)
        {
            await Clients.All.SendAsync("AlbumChanged", albumId);
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
