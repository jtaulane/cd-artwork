import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumService, Album } from '../../services/album';
import { SignalrService } from '../../services/signalr.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.html',
  styleUrl: './display.scss',
})
export class Display implements OnInit, OnDestroy {
  private albumService = inject(AlbumService);
  private signalrService = inject(SignalrService);

  album = signal<Album | null>(null);
  isLoading = signal(true);
  connectionStatus = signal<'connected' | 'disconnected' | 'connecting'>('connecting');

  private destroy$ = new Subject<void>();

  /**
   * Get full image URL for an album
   */
  getImageUrl(imagePath?: string): string {
    return this.albumService.getImageUrl(imagePath);
  }

  ngOnInit(): void {
    // Load current album
    this.loadCurrentAlbum();

    // Start SignalR connection
    this.startSignalR();
  }

  private loadCurrentAlbum(): void {
    this.albumService.getCurrentAlbum()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (album) => {
          this.album.set(album);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load current album:', error);
          this.album.set(null);
          this.isLoading.set(false);
        }
      });
  }

  private startSignalR(): void {
    // Subscribe to connection state FIRST before starting
    this.signalrService.getConnectionState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.connectionStatus.set(connected ? 'connected' : 'disconnected');
        console.log('Connection status changed:', connected ? 'connected' : 'disconnected');
      });

    // Listen for album changes from control page
    this.signalrService.getAlbumChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event) {
          console.log('Album changed event received in display page:', event);
          // Reload the current album when signalr broadcasts an update
          this.loadCurrentAlbum();
        }
      });

    // Connect to SignalR if not already connected
    if (!this.signalrService.isConnected()) {
      this.signalrService.start()
        .then(() => {
          console.log('SignalR start() completed successfully');
        })
        .catch((error) => {
          console.error('Failed to connect to SignalR:', error);
        });
    } else {
      console.log('SignalR already connected');
      this.connectionStatus.set('connected');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

