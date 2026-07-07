import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map, Observable, tap } from 'rxjs';

export interface Album {
  discNumber: number;
  artist: string;
  title: string;
  coverImage: string;
}

interface ApiAlbum {
  discNumber: number;
  artist: string;
  albumTitle: string;
  coverImage: string;
}

interface CurrentDiscResponse {
  discNumber: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getAlbums(): Observable<Album[]> {
    return this.http.get<ApiAlbum[]>(`${this.apiUrl}/Albums`).pipe(
      map((albums) => albums.map((album) => ({
        discNumber: album.discNumber,
        artist: album.artist,
        title: album.albumTitle,
        coverImage: album.coverImage,
      }))),
      tap((albums) => console.log('Albums retrieved:', albums))
    );
  }

  setCurrentDisc(discNumber: number) {
    console.log(`Setting current disc to: ${discNumber}`);
    return this.http.post(
      `${this.apiUrl}/Albums/currentDisc`,
      { discNumber }
    );
  }

  getCurrentDisc() {
    return this.http.get<CurrentDiscResponse>(`${this.apiUrl}/Albums/currentDisc`).pipe(
      map((response) => response.discNumber)
    );
  }
}
