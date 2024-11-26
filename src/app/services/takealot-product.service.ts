import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {forkJoin, Observable} from 'rxjs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class TakealotProductService {
  private localFileName = 'product-ids.json';
  private apiUrl = 'https://api.takealot.com/rest/v-1-13-0/product-details/';

  constructor(private http: HttpClient) {}

  // Fetch product information by product string IDs
  getProducts(ids: string[]): Observable<any[]> {
    // Create an array of HTTP GET requests
    const requests = ids.map(id => this.http.get(`${this.apiUrl}${id}`));

    // Use forkJoin to wait for all requests to complete and return their results
    return forkJoin(requests);
  }

  // Save product IDs to the local file
  saveProductIds(ids: string[]): void {
    const blob = new Blob([JSON.stringify(ids)], { type: 'application/json' });
    saveAs(blob, this.localFileName); // This triggers a download of the file
  }
}
