import { Component, inject, OnInit, signal } from '@angular/core';
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
export class Control implements OnInit {
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
  nextDiscNumberForNew = signal<number>(1);

  ngOnInit(): void {
    this.loadAlbums();
    this.startSignalR();
  }

  private loadAlbums(): void {
    this.isLoading.set(true);
    this.albumService.getAlbums().subscribe({
      next: (albums) => {
        this.albums.set(albums);
        this.isLoading.set(false);
        // Find next available disc number
        const usedNumbers = albums.map(a => a.discNumber);
        const nextNumber = this.findNextAvailableDiscNumber(usedNumbers);
        this.nextDiscNumberForNew.set(nextNumber);
      },
      error: (error) => {
        console.error('Failed to load albums:', error);
        this.errorMessage.set('Failed to load albums');
        this.isLoading.set(false);
      }
    });
  }

  private findNextAvailableDiscNumber(usedNumbers: number[]): number {
    for (let i = 1; i <= 25; i++) {
      if (!usedNumbers.includes(i)) {
        return i;
      }
    }
    return 1; // Default if all slots are full
  }

  private startSignalR(): void {
    if (!this.signalrService.isConnected()) {
      this.signalrService.start()
        .then(() => {
          console.log('SignalR connected');
          // Listen for album changes from other clients
          this.signalrService.getAlbumChanged().subscribe((event) => {
            if (event) {
              this.currentAlbumId.set(event.albumId);
            }
          });
        })
        .catch((error) => {
          console.error('Failed to connect to SignalR:', error);
        });
    }
  }

  /**
   * Get album for a specific disc number, or null if empty
   */
  getAlbumByDiscNumber(discNumber: number): Album | null {
    return this.albums().find(a => a.discNumber === discNumber) || null;
  }

  /**
   * Open editor for new album
   */
  openNewAlbumEditor(): void {
    this.editingAlbum.set(null);
    this.showEditor.set(true);
  }

  /**
   * Open editor for existing album
   */
  openEditAlbumEditor(album: Album): void {
    this.editingAlbum.set(album);
    this.showEditor.set(true);
  }

  /**
   * Handle save from editor modal
   */
  onAlbumSaved(data: { album: CreateAlbumRequest; imageFile?: File }): void {
    const isEditing = this.editingAlbum() !== null;
    const albumId = this.editingAlbum()?.id;

    this.isLoading.set(true);

    if (isEditing && albumId) {
      this.albumService.updateAlbum(albumId, data.album, data.imageFile).subscribe({
        next: () => {
          this.successMessage.set('Album updated successfully');
          this.showEditor.set(false);
          this.editingAlbum.set(null);
          this.isLoading.set(false);
          this.loadAlbums();

          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage.set(null), 3000);
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
        next: () => {
          this.successMessage.set('Album created successfully');
          this.showEditor.set(false);
          this.editingAlbum.set(null);
          this.isLoading.set(false);
          this.loadAlbums();

          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage.set(null), 3000);
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
   * Handle cancel from editor modal
   */
  onEditorCanceled(): void {
    this.showEditor.set(false);
    this.editingAlbum.set(null);
  }

  /**
   * Select album to display
   */
  selectAlbumForDisplay(album: Album): void {
    this.isLoading.set(true);
    this.albumService.setCurrentAlbum(album.id).subscribe({
      next: () => {
        this.currentAlbumId.set(album.id);
        this.successMessage.set(`Now displaying: ${album.albumTitle}`);
        this.isLoading.set(false);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        console.error('Failed to set current album:', error);
        this.errorMessage.set('Failed to set current album');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Delete album
   */
  deleteAlbum(album: Album): void {
    if (!confirm(`Are you sure you want to delete "${album.albumTitle}"?`)) {
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
   * Get array of disc numbers 1-25 for grid iteration
   */
  getDiscNumbers(): number[] {
    return Array.from({ length: 25 }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.signalrService.stop().catch(error => {
      console.error('Error stopping SignalR:', error);
    });
  }
}

