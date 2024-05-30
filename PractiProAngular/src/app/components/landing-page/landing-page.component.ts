import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
