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
    // Connect to SignalR if not already connected
    if (!this.signalrService.isConnected()) {
      this.signalrService.start()
        .then(() => {
          this.connectionStatus.set('connected');
          console.log('SignalR connected');
        })
        .catch((error) => {
          console.error('Failed to connect to SignalR:', error);
          this.connectionStatus.set('disconnected');
        });
    } else {
      this.connectionStatus.set('connected');
    }

    // Listen for album changes from control page
    this.signalrService.getAlbumChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event) {
          // Reload the current album when signalr broadcasts an update
          this.loadCurrentAlbum();
        }
      });

    // Monitor connection status
    this.signalrService.getConnectionState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.connectionStatus.set(connected ? 'connected' : 'disconnected');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

