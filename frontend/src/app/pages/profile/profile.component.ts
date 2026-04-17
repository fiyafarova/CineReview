import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../service/profile.service';
import { Profile } from '../../models/profile.model';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  isLoading = true;
  editMode = false;
  successMessage = '';

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef  // ← добавь
  ) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
        this.cdr.detectChanges();  // ← принудительно обновить view
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
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
