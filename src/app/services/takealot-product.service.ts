import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Product} from '../models/product-model';
import { ProductService } from './product.service';
import {TakealotModel} from '../models/takealot-model';
import {mapTakealotToProduct} from '../helper/mapper';

@Injectable({
  providedIn: 'root'
})
export class TakealotProductService extends ProductService {
  private apiUrl = 'https://api.takealot.com/rest/v-1-13-0/product-details/PLID';

  constructor(private http: HttpClient) {
    super();
  }

  // Fetch product details by ID
  override getProductById(productId: string): Observable<Product> {
    return this.http.get<TakealotModel>(`${this.apiUrl}${productId}`).pipe(
      map((apiProduct) => mapTakealotToProduct(apiProduct, productId)),
    );
  }

  override extractProductId(productUrl: string): string {
    const regex = /PLID(\d+)/;
    const result = regex.exec(productUrl);

    if (result) {
      return result[1];
    } else {
      return '';
    }
  }

}
