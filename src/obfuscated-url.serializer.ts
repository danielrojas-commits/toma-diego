import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class ObfuscatedUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    if (url === '/') {
      return super.parse(url);
    }
    try {
      // Remove the leading slash and decode
      const decoded = atob(url.substring(1));
      return super.parse(decoded);
    } catch {
      // Fallback for non-encoded URLs (allows typing normal URLs in dev)
      return super.parse(url);
    }
  }

  override serialize(tree: UrlTree): string {
    const path = super.serialize(tree);
    if (path === '/') {
      return path;
    }
    // Encode the path and add the leading slash back
    return '/' + btoa(path);
  }
}