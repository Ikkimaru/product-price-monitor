import { Injectable } from '@angular/core';
import {Observable, throwError} from 'rxjs';
import { Product } from '../models/product-model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor() { }

  getProductById(productId: string, existingProducts: Product[]): Observable<Product> {
    throw new Error('Method not implemented.');
  }

  addNewProduct(productId: string, existingProducts: Product[]): Observable<Product> {
    // Check if the product already exists in the list
    const existingProduct = existingProducts.find((p) => p.id === productId);
    if (existingProduct) {
      return throwError(() => new Error('Product already exists!'));
    }

    // If not, fetch the product details from the store-specific service
    return this.getProductById(productId, existingProducts);
  }

  extractProductId(productUrl: string): string {
    throw new Error('Method not implemented.');
  }
}
