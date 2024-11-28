import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TakealotModel} from '../models/takealot-model';

@Injectable({
  providedIn: 'root'
})
export class TakealotProductService {
  private apiUrl = 'https://api.takealot.com/rest/v-1-13-0/product-details/PLID';

  constructor(private http: HttpClient) {}

  // Fetch product details by ID
  getProductById(productId: string): Observable<TakealotModel> {
    return this.http.get<any>(`${this.apiUrl}${productId}`);
  }

}
