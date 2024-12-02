import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  loadStyles() {

    const userStylePath = 'appointy.scss';

    fetch(userStylePath)
      .then(response => {
        if (response.ok && !response.headers.get('content-type')?.includes('text/html')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = userStylePath;
          document.head.appendChild(link);
        } else {
          this.applyDefaultStyle();
        }
      })
      .catch(() => {
        this.applyDefaultStyle();
      });
  }

  applyDefaultStyle() {
    const style = document.createElement('style');
    style.textContent = `
    :root {
      --background-color: hsl(0 100% 100%);
      --primary-color: hsl(215, 75%, 40%);
      --secondary-color: hsl(215, 90%, 75%);

      --secondary-text-color: white;
    }
  `;
    document.head.appendChild(style);
  }
}
