import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  loadStyles(){
    const link = document.createElement('link');
    link.rel = 'stylesheet';

    const userStylePath = 'appointy.scss';
    const defaultStylePath = 'colors.scss';

    fetch(userStylePath)
      .then(response => {
        if (response.ok) {
          link.href = userStylePath;
          document.head.appendChild(link);
        } else {
          link.href = defaultStylePath;
          document.head.appendChild(link);
        }
      })
      .catch(() => {
        link.href = defaultStylePath;
        document.head.appendChild(link);
      });
  }
}
