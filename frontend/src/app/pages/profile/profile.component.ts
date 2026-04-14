import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../service/profile.service';
import { Profile } from '../../models/profile.model';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  editMode = false;
  successMessage = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (data) => this.profile = data,
      error: (err) => console.error('Error loading profile', err)
    });
  }

  saveProfile() {
    if (!this.profile) return;
    this.profileService.updateProfile(this.profile).subscribe({
      next: (data) => {
        this.profile = data;
        this.editMode = false;
        this.successMessage = 'Profile updated!';
        setTimeout(() => this.successMessage = '', 3000);
      }
    });
  }
}
