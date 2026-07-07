import { Component, signal } from '@angular/core';
import { Album } from '../../services/album';
import { AlbumService } from '../../services/album';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-display',
  imports: [],
  templateUrl: './display.html',
  styleUrl: './display.scss',
})

export class Display {
  album = signal<Album | null>(null);

  constructor(private albumService: AlbumService) {}

  ngOnInit() {
    this.albumService.getCurrentDisc()
      .pipe(
        switchMap((currentDisc) => this.albumService.getAlbums().pipe(
          map((albums) => albums.find((album) => album.discNumber === currentDisc) ?? null)
        ))
      )
      .subscribe(album => {
        this.album.set(album);
      });
  }
}
