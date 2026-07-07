import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Album } from '../../services/album';
import { AlbumService } from '../../services/album';

@Component({
  selector: 'app-control',
  imports: [],
  templateUrl: './control.html',
  styleUrl: './control.scss',
})

export class Control implements OnInit {

  albums = signal<Album[]>([]);
  private albumService = inject(AlbumService);
  private router = inject(Router);

  ngOnInit() {
    this.albumService.getAlbums()
      .subscribe((albums: Album[]) => {
        this.albums.set(albums);
      });
  }

  selectDisc(discNumber: number) {
    console.log(`Selected disc number: ${discNumber}`);
    this.albumService.setCurrentDisc(discNumber)
      .subscribe({
        next: () => {
          this.router.navigate(['/display']);
        },
        error: (error) => {
          console.error('Failed to set current disc:', error);
        }
      });
  }
}
