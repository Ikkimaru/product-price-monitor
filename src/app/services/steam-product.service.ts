import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, delay, map, mergeMap, Observable, of, tap} from 'rxjs';
import {Product} from '../models/product-model';
import { ProductService } from './product.service';
import {SteamModel} from '../models/steam-model';
import {mapSteamToProduct} from '../helper/mapper';

@Injectable({
  providedIn: 'root'
})
export class SteamProductService extends ProductService {

  constructor(private http: HttpClient) {
    super();
  }
  // https://github.com/Revadike/InternalSteamWebAPI/wiki
  // Fetch product details by ID
  override getProductById(productId: string): Observable<Product> {
    return this.http
      .get<SteamModel>(`/steam-api/appdetails?appids=${productId}`)
      .pipe(
        mergeMap((apiProduct) => {
          const productData = apiProduct[productId]?.data;
          if (productData?.price_overview.currency === 'ZAR') {
            // Map directly if the currency is ZAR
            return of(mapSteamToProduct(apiProduct, productId));
          } else {
            // Retry with another call if currency is not ZAR
            console.warn(`Currency is not ZAR for product ${productId}, retrying...`);
            delay(1000);
            return this.http
              .get<SteamModel>(`/steam-api/appdetails?appids=${productId}&currency=ZAR`)
              .pipe(
                map((retriedProduct) => mapSteamToProduct(retriedProduct, productId))
              );
          }
        }),
        catchError((error) => {
          console.error('Failed to fetch product:', error);
          throw error;
        })
      );
  }


  override extractProductId(productUrl: string): string {
    const regex = /\/app\/(\d+)(?:\/|$)/; // Match '/app/' followed by numbers, ignoring extra text
    const result = regex.exec(productUrl);

    if (result) {
      return result[1]; // Return the captured group of numbers
    } else {
      return ''; // Return an empty string if no match is found
    }
  }



}
