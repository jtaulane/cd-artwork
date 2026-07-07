import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumService, Album, CreateAlbumRequest } from '../../services/album';
import { SignalrService } from '../../services/signalr.service';
import { AlbumEditorComponent } from '../../components/album-editor/album-editor.component';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [CommonModule, AlbumEditorComponent],
  templateUrl: './control.html',
  styleUrl: './control.scss',
})
export class Control implements OnInit, OnDestroy {
  private albumService = inject(AlbumService);
  private signalrService = inject(SignalrService);

  albums = signal<Album[]>([]);
  currentAlbumId = signal<number | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Modal state
  showEditor = signal(false);
  editingAlbum = signal<Album | null>(null);
  selectedSlotForNew = signal<number | null>(null);

  /**
   * Get full image URL for an album
   */
  getImageUrl(imagePath?: string): string {
    return this.albumService.getImageUrl(imagePath);
  }

  ngOnInit(): void {
    this.loadAlbums();
    this.loadCurrentAlbum();
    this.startSignalR();
  }

  private loadAlbums(): void {
    this.isLoading.set(true);
    this.albumService.getAlbums().subscribe({
      next: (albums) => {
        this.albums.set(albums);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load albums:', error);
        this.errorMessage.set('Failed to load albums');
        this.isLoading.set(false);
      }
    });
  }

  private loadCurrentAlbum(): void {
    this.albumService.getCurrentAlbum().subscribe({
      next: (album) => {
        this.currentAlbumId.set(album.id);
      },
      error: (error) => {
        console.error('Failed to load current album:', error);
        // It's okay if no album is currently selected
        this.currentAlbumId.set(null);
      }
    });
  }



  private startSignalR(): void {
    // Subscribe to album changes first
    this.signalrService.getAlbumChanged().subscribe((event) => {
      if (event) {
        console.log('Album changed event received in control page:', event);
        this.currentAlbumId.set(event.albumId);
      }
    });

    // Then connect
    if (!this.signalrService.isConnected()) {
      this.signalrService.start()
        .then(() => {
          console.log('SignalR connected from control page');
        })
        .catch((error) => {
          console.error('Failed to connect to SignalR:', error);
        });
    } else {
      console.log('SignalR already connected from control page');
    }
  }

  /**
   * Get album for a specific disc slot number, or null if empty
   */
  getAlbumBySlot(slotNumber: number): Album | null {
    return this.albums().find(a => a.discNumber === slotNumber) || null;
  }

  /**
   * Open editor for new album in specific slot
   */
  openNewAlbumEditor(slotNumber: number): void {
    this.selectedSlotForNew.set(slotNumber);
    this.editingAlbum.set(null);
    this.showEditor.set(true);
  }

  /**
   * Open editor for existing album
   */
  openEditAlbumEditor(album: Album): void {
    this.editingAlbum.set(album);
    this.selectedSlotForNew.set(null);
    this.showEditor.set(true);
  }

  /**
   * Handle save from editor modal
   */
  onAlbumSaved(data: { album: CreateAlbumRequest; imageFile?: File; tracks?: any[] }): void {
    const isEditing = this.editingAlbum() !== null;
    const albumId = this.editingAlbum()?.id;

    this.isLoading.set(true);

    if (isEditing && albumId) {
      this.albumService.updateAlbum(albumId, data.album, data.imageFile).subscribe({
        next: () => {
          // If tracks provided, save them
          if (data.tracks && data.tracks.length > 0) {
            this.saveTracks(albumId, data.tracks);
          } else {
            this.successMessage.set('Album updated successfully');
            this.showEditor.set(false);
            this.editingAlbum.set(null);
            this.selectedSlotForNew.set(null);
            this.isLoading.set(false);
            this.loadAlbums();
            setTimeout(() => this.successMessage.set(null), 3000);
          }
        },
        error: (error: any) => {
          console.error('Failed to update album:', error);
          this.errorMessage.set(
            error.error?.message || 'Failed to update album'
          );
          this.isLoading.set(false);
        }
      });
    } else {
      this.albumService.createAlbum(data.album, data.imageFile).subscribe({
        next: (createdAlbum) => {
          // If tracks provided, save them
          if (data.tracks && data.tracks.length > 0) {
            this.saveTracks(createdAlbum.id, data.tracks);
          } else {
            this.successMessage.set('Album created successfully');
            this.showEditor.set(false);
            this.editingAlbum.set(null);
            this.selectedSlotForNew.set(null);
            this.isLoading.set(false);
            this.loadAlbums();
            setTimeout(() => this.successMessage.set(null), 3000);
          }
        },
        error: (error: any) => {
          console.error('Failed to create album:', error);
          this.errorMessage.set(
            error.error?.message || 'Failed to create album'
          );
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * Save tracks for an album
   */
  private saveTracks(albumId: number, tracks: any[]): void {
    const newTracks = tracks.filter(t => !t.id); // Tracks without ID are new
    const existingTracks = tracks.filter(t => t.id); // Tracks with ID need to be updated

    let savedCount = 0;
    const totalCount = newTracks.length + existingTracks.length;

    if (totalCount === 0) {
      this.successMessage.set('Album and tracks saved successfully');
      this.showEditor.set(false);
      this.editingAlbum.set(null);
      this.selectedSlotForNew.set(null);
      this.isLoading.set(false);
      this.loadAlbums();
      setTimeout(() => this.successMessage.set(null), 3000);
      return;
    }

    // Handle new tracks
    newTracks.forEach(track => {
      this.albumService.createTrack(albumId, track).subscribe({
        next: () => {
          savedCount++;
          if (savedCount === totalCount) {
            this.successMessage.set('Album and tracks saved successfully');
            this.showEditor.set(false);
            this.editingAlbum.set(null);
            this.selectedSlotForNew.set(null);
            this.isLoading.set(false);
            this.loadAlbums();
            setTimeout(() => this.successMessage.set(null), 3000);
          }
        },
        error: (error: any) => {
          console.error('Failed to save track:', error);
          this.errorMessage.set('Failed to save all tracks');
          this.isLoading.set(false);
        }
      });
    });

    // Handle existing tracks
    existingTracks.forEach(track => {
      this.albumService.updateTrack(albumId, track.id, track).subscribe({
        next: () => {
          savedCount++;
          if (savedCount === totalCount) {
            this.successMessage.set('Album and tracks saved successfully');
            this.showEditor.set(false);
            this.editingAlbum.set(null);
            this.selectedSlotForNew.set(null);
            this.isLoading.set(false);
            this.loadAlbums();
            setTimeout(() => this.successMessage.set(null), 3000);
          }
        },
        error: (error: any) => {
          console.error('Failed to update track:', error);
          this.errorMessage.set('Failed to save all tracks');
          this.isLoading.set(false);
        }
      });
    });
  }

  /**
   * Handle cancel from editor modal
   */
  onEditorCanceled(): void {
    this.showEditor.set(false);
    this.editingAlbum.set(null);
    this.selectedSlotForNew.set(null);
  }

  /**
   * Play (set as current album to display)
   */
  playAlbum(album: Album): void {
    this.isLoading.set(true);
    this.albumService.setCurrentAlbum(album.id).subscribe({
      next: () => {
        this.currentAlbumId.set(album.id);
        this.successMessage.set(`Now playing: ${album.albumTitle}`);
        this.isLoading.set(false);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        console.error('Failed to play album:', error);
        this.errorMessage.set('Failed to play album');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Delete album
   */
  deleteAlbum(album: Album): void {
    if (!confirm(`Are you sure you want to delete "${album.albumTitle}" from Disc Slot ${album.discNumber}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.albumService.deleteAlbum(album.id).subscribe({
      next: () => {
        this.successMessage.set('Album deleted successfully');
        this.isLoading.set(false);
        this.loadAlbums();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        console.error('Failed to delete album:', error);
        this.errorMessage.set('Failed to delete album');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Get array of disc slots 1-25
   */
  getDiscSlots(): number[] {
    return Array.from({ length: 25 }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.signalrService.stop().catch(error => {
      console.error('Error stopping SignalR:', error);
    });
  }
}

