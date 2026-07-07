import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Album, CreateAlbumRequest, Track } from '../../services/album';

interface TrackInput {
  id?: number; // Present if this is an existing track being edited
  trackNumber: number;
  trackTitle: string;
  durationSeconds: number;
}

@Component({
  selector: 'app-album-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './album-editor.component.html',
  styleUrl: './album-editor.component.scss'
})
export class AlbumEditorComponent {
  @Input() album: Album | null = null;
  @Input() selectedSlot: number | null = null;
  @Output() save = new EventEmitter<{ album: CreateAlbumRequest; imageFile?: File; tracks?: TrackInput[] }>();
  @Output() cancel = new EventEmitter<void>();

  currentYear = new Date().getFullYear();

  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Form fields
  discNumber = signal<number>(1);
  albumTitle = signal<string>('');
  artist = signal<string>('');
  releaseYear = signal<number>(this.currentYear);
  genre = signal<string>('');

  // Track management
  tracks = signal<TrackInput[]>([]);
  newTrack = signal<TrackInput>({ trackNumber: 1, trackTitle: '', durationSeconds: 0 });

  ngOnInit(): void {
    if (this.album) {
      this.discNumber.set(this.album.discNumber);
      this.albumTitle.set(this.album.albumTitle);
      this.artist.set(this.album.artist);
      this.releaseYear.set(this.album.releaseYear);
      this.genre.set(this.album.genre);
      if (this.album.imagePath) {
        this.imagePreview.set(this.album.imagePath);
      }
      if (this.album.tracks && this.album.tracks.length > 0) {
        this.tracks.set(this.album.tracks.map(t => ({
          id: t.id,
          trackNumber: t.trackNumber,
          trackTitle: t.trackTitle,
          durationSeconds: t.durationSeconds
        })));
      }
    } else if (this.selectedSlot) {
      // Set disc number based on selected slot
      this.discNumber.set(this.selectedSlot);
    } else {
      this.discNumber.set(1);
    }
  }

  addTrack(): void {
    const currentTracks = this.tracks();
    const nextTrackNumber = currentTracks.length > 0
      ? Math.max(...currentTracks.map(t => t.trackNumber)) + 1
      : 1;

    if (this.newTrack().trackTitle.trim()) {
      this.tracks.set([
        ...currentTracks,
        {
          trackNumber: nextTrackNumber,
          trackTitle: this.newTrack().trackTitle,
          durationSeconds: this.newTrack().durationSeconds
        }
      ]);
      this.newTrack.set({ trackNumber: nextTrackNumber + 1, trackTitle: '', durationSeconds: 0 });
    }
  }

  removeTrack(index: number): void {
    const currentTracks = this.tracks();
    this.tracks.set(currentTracks.filter((_, i) => i !== index));
  }

  secondsToDisplay(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDurationChange(value: string): void {
    const duration = parseInt(value, 10) || 0;
    this.newTrack.set({ ...this.newTrack(), durationSeconds: duration });
  }

  onTitleChange(value: string): void {
    this.newTrack.set({ ...this.newTrack(), trackTitle: value });
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    (event.target as HTMLElement).classList.remove('drag-over');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('drag-over');

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile.set(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        this.errorMessage.set('Please drop an image file');
      }
    }
  }

  onSave(): void {
    // Validation
    if (!this.albumTitle().trim()) {
      this.errorMessage.set('Album title is required');
      return;
    }
    if (!this.artist().trim()) {
      this.errorMessage.set('Artist is required');
      return;
    }
    if (!this.genre().trim()) {
      this.errorMessage.set('Genre is required');
      return;
    }
    if (this.discNumber() < 1 || this.discNumber() > 25) {
      this.errorMessage.set('Disc number must be between 1 and 25');
      return;
    }

    this.errorMessage.set(null);

    const albumData: CreateAlbumRequest = {
      discNumber: this.discNumber(),
      albumTitle: this.albumTitle(),
      artist: this.artist(),
      releaseYear: this.releaseYear(),
      genre: this.genre()
    };

    this.save.emit({
      album: albumData,
      imageFile: this.selectedFile() || undefined,
      tracks: this.tracks().length > 0 ? this.tracks() : undefined
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }
}
