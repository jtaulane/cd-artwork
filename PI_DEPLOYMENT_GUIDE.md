# Raspberry Pi Deployment Guide

## Prerequisites
- Raspberry Pi (4 or 5 recommended, 4GB+ RAM)
- Raspberry Pi OS (Bullseye or newer)
- Internet connection during setup

## Step 1: Install Dependencies on Pi

### Update system
```bash
sudo apt update
sudo apt upgrade -y
```

### Install .NET 8 Runtime
```bash
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0
echo 'export PATH=$PATH:$HOME/.dotnetcli' >> ~/.bashrc
source ~/.bashrc
dotnet --version  # Verify installation
```

### Install Node.js (for building Angular)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify
npm --version   # Verify
```

## Step 2: Clone and Build on Pi

### Clone your repo
```bash
cd ~
git clone https://github.com/jtaulane/cd-artwork.git
cd cd-artwork
```

### Build Angular frontend
```bash
cd cd-display-client
npm install
ng build --configuration production
cd ..
```

### Build .NET backend
```bash
cd CDDisplay.Server/CDDisplay.Server
dotnet build -c Release
cd ../..
```

## Step 3: Copy Your Database

On your development machine, copy your database to the Pi:

```powershell
# On your Windows machine in PowerShell
scp albums.db pi@<PI_IP>:~/cd-artwork/CDDisplay.Server/CDDisplay.Server/
```

Or manually copy it to: `~/cd-artwork/CDDisplay.Server/CDDisplay.Server/albums.db`

## Step 4: Configure Backend to Serve Frontend

Edit `CDDisplay.Server/CDDisplay.Server/Program.cs` to serve the Angular build:

**Add this after `app.UseRouting();` (around line 50):**

```csharp
// Serve static files from Angular build
app.UseStaticFiles(new StaticFileOptions
{
	FileProvider = new PhysicalFileProvider(
		Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "cd-display-client", "dist", "cd-display-client")),
	RequestPath = ""
});

// SPA fallback - route all unknown requests to index.html for Angular routing
app.MapFallbackToFile("index.html", new StaticFileOptions
{
	FileProvider = new PhysicalFileProvider(
		Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "cd-display-client", "dist", "cd-display-client"))
});
```

**Also update CORS in Program.cs to allow local network access:**

```csharp
policy.WithOrigins(
	"http://localhost:4200",
	"https://localhost:4200",
	"http://localhost:7243",
	"https://localhost:7243",
	"http://localhost",
	"http://<PI_IP>",
	"http://<PI_IP>:7243"
)
```

Replace `<PI_IP>` with your Pi's actual IP (e.g., `192.168.1.100`)

## Step 5: Run on Pi

### Option A: Run directly
```bash
cd ~/cd-artwork/CDDisplay.Server/CDDisplay.Server
dotnet run --configuration Release
```

The app will be at: `http://<PI_IP>:7243`

### Option B: Run as a service (auto-start on Pi boot)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/cd-artwork.service
```

Paste this:
```ini
[Unit]
Description=CD Artwork Display
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/cd-artwork/CDDisplay.Server/CDDisplay.Server
ExecStart=/home/pi/.dotnetcli/dotnet run --configuration Release
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cd-artwork
sudo systemctl start cd-artwork
sudo systemctl status cd-artwork
```

Check logs:
```bash
sudo journalctl -u cd-artwork -f
```

## Step 6: Access from Phone

On your phone (same WiFi network):
- Control page: `http://<PI_IP>:7243/control`
- Display page: `http://<PI_IP>:7243/display`

Replace `<PI_IP>` with your Pi's IP address (find it with `hostname -I` on the Pi)

## Troubleshooting

### Find Pi's IP address
```bash
hostname -I
```

### Test connectivity from your phone
- Try pinging from phone using a ping app
- Make sure both Pi and phone are on same WiFi

### Database not persisting
- Make sure `albums.db` is in `/home/pi/cd-artwork/CDDisplay.Server/CDDisplay.Server/`
- Check permissions: `ls -la albums.db`

### Port 7243 already in use
- Change port in `Program.cs`: `app.Run("https://0.0.0.0:5000");`
- Update CORS and access URL accordingly

### Frontend not loading
- Verify Angular build succeeded: `ls -la cd-display-client/dist/`
- Check backend logs with `sudo journalctl -u cd-artwork -f`

## Updates from your dev machine

To update on Pi after code changes:

```bash
cd ~/cd-artwork
git pull origin main
cd cd-display-client
npm install && ng build --configuration production
cd ../CDDisplay.Server/CDDisplay.Server
dotnet build -c Release
# If running as service:
sudo systemctl restart cd-artwork
# If running directly, stop and restart
```

---

**Notes:**
- First time setup takes 10-15 minutes (Node.js and .NET compilation)
- Subsequent builds are faster
- 7-inch display connects to Pi via HDMI/DVI
- Phone accesses via WiFi
- All data stays on your Pi - no cloud needed
