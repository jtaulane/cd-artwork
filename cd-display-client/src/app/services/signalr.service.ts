import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AlbumChangedEvent {
  albumId: number;
  album?: any; // Album object from the server
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: HubConnection | null = null;
  private albumChangedSubject = new BehaviorSubject<AlbumChangedEvent | null>(null);
  public albumChanged$: Observable<AlbumChangedEvent | null> = this.albumChangedSubject.asObservable();

  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$: Observable<boolean> = this.connectedSubject.asObservable();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    if (this.hubConnection) {
      return;
    }

    const apiUrl = environment.apiUrl.replace(/\/$/, '');
    const hubUrl = `${apiUrl}/api/displayHub`;

    console.log('Initializing SignalR connection to:', hubUrl);

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,  // Enable credentials for CORS
        skipNegotiation: false   // Use negotiation
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])  // Reconnect with delays
      .configureLogging(LogLevel.Information)
      .build();

    // Listen for album changed events
    this.hubConnection.on('AlbumChanged', (albumId: number, album?: any) => {
      console.log('Album changed event received:', albumId, album);
      this.albumChangedSubject.next({ albumId, album });
    });

    // Handle connection state changes
    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectedSubject.next(true);
    });

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectedSubject.next(false);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR disconnected');
      this.connectedSubject.next(false);
    });
  }

  /**
   * Start the SignalR connection
   */
  start(): Promise<void> {
    if (!this.hubConnection) {
      this.initializeConnection();
    }

    if (this.hubConnection!.state === 'Connected') {
      console.log('SignalR already connected');
      return Promise.resolve();
    }

    return this.hubConnection!.start().then(() => {
      console.log('SignalR connected successfully');
      this.connectedSubject.next(true);
    }).catch((error) => {
      console.error('SignalR connection error:', error);
      this.connectedSubject.next(false);
      throw error;
    });
  }

  /**
   * Stop the SignalR connection
   */
  stop(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.resolve();
    }

    return this.hubConnection.stop().then(() => {
      console.log('SignalR connection stopped');
      this.connectedSubject.next(false);
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.hubConnection !== null && this.hubConnection.state === 'Connected';
  }

  /**
   * Get the album changed observable
   */
  getAlbumChanged(): Observable<AlbumChangedEvent | null> {
    return this.albumChanged$;
  }

  /**
   * Get the connection state observable
   */
  getConnectionState(): Observable<boolean> {
    return this.connected$;
  }
}
