import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api/auth';
  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profile/`);
  }

  updateProfile(data: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/profile/`, data);
  }
}
