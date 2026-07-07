import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface Album {
  id: number;
  discNumber: number;
  albumTitle: string;
  artist: string;
  releaseYear: number;
  genre: string;
  imagePath?: string;
  createdDate: string;
  updatedDate: string;
}

export interface CreateAlbumRequest {
  discNumber: number;
  albumTitle: string;
  artist: string;
  releaseYear: number;
  genre: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private apiUrl = environment.apiUrl.replace(/\/$/, '') + '/api/album';
  private baseUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  /**
   * Get the full image URL for an album
   */
  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '';
    }
    // If imagePath already starts with http, return as-is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend the base API URL
    return `${this.baseUrl}${imagePath}`;
  }

  /**
   * Get all albums
   */
  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(this.apiUrl);
  }

  /**
   * Get single album by ID
   */
  getAlbum(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get the currently displayed album
   */
  getCurrentAlbum(): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/current`);
  }

  /**
   * Set the currently displayed album
   */
  setCurrentAlbum(albumId: number): Observable<Album> {
    return this.http.post<Album>(`${this.apiUrl}/current/${albumId}`, {});
  }

  /**
   * Create a new album with optional image
   */
  createAlbum(album: CreateAlbumRequest, imageFile?: File): Observable<Album> {
    const formData = new FormData();
    formData.append('discNumber', album.discNumber.toString());
    formData.append('albumTitle', album.albumTitle);
    formData.append('artist', album.artist);
    formData.append('releaseYear', album.releaseYear.toString());
    formData.append('genre', album.genre);

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    return this.http.post<Album>(this.apiUrl, formData);
  }

  /**
   * Update an existing album with optional image
   */
  updateAlbum(id: number, album: CreateAlbumRequest, imageFile?: File): Observable<void> {
    const formData = new FormData();
    formData.append('discNumber', album.discNumber.toString());
    formData.append('albumTitle', album.albumTitle);
    formData.append('artist', album.artist);
    formData.append('releaseYear', album.releaseYear.toString());
    formData.append('genre', album.genre);

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Delete an album
   */
  deleteAlbum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
