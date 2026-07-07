import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Album, CreateAlbumRequest } from '../../services/album';

@Component({
  selector: 'app-album-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './album-editor.component.html',
  styleUrl: './album-editor.component.scss'
})
export class AlbumEditorComponent {
  @Input() album: Album | null = null;
  @Output() save = new EventEmitter<{ album: CreateAlbumRequest; imageFile?: File }>();
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
    } else {
      // Find next available disc number for new album
      // This would need to be set by parent component
      this.discNumber.set(1);
    }
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
      imageFile: this.selectedFile() || undefined
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
