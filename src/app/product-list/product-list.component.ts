import {Component} from '@angular/core';
import { TakealotProductService } from '../services/takealot-product.service';
import { NgFor, NgIf} from '@angular/common';
import { Product, PriceHistory } from '../models/product-model';
import {FormsModule} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent{
  products: Product[] = [];
  errorMessage: string | null = null;
  productUrl: string = '';
  newProductId: string = '';
  isStoreValid: boolean = false;
  selectedStore: string = '';
  supportedStores: string[] = ['Takealot'];
  extractedStoreMessage: string = '';

  constructor(private TakealotProductService: TakealotProductService) {}

  // Handle user file input
  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const uploadedData = JSON.parse(reader.result as string);
          this.processUploadedData(uploadedData); // Process the uploaded data
        } catch (error) {
          this.errorMessage = 'Error parsing JSON file';
        }
      };
      reader.readAsText(file);
    } else {
      this.errorMessage = 'Please upload a valid JSON file.';
    }
  }

  // Process the uploaded JSON data
  processUploadedData(uploadedData: Product[]): void {
    // Assuming uploadedData is an array of Product objects
    if (Array.isArray(uploadedData)) {
      this.products = uploadedData;
      this.errorMessage = ''; // Clear error message if valid data is uploaded
    } else {
      this.errorMessage = 'Invalid data format in uploaded file.';
    }
  }

  // Add new product based on selected store
  onAddNewProduct(): void {
    if (!this.productUrl) {
      this.errorMessage = 'Please enter a URL.';
      return;
    }

    if (this.isStoreValid) {
      if (this.selectedStore === 'Takealot') {
        this.newProductId = this.TakealotProductService.extractProductId(this.productUrl);
        this.addNewProductUsingService(this.TakealotProductService);
      }
    } else {
      this.errorMessage = 'Store is not supported.';
    }
  }

  extractDomainFromUrl(url: string): void {
    const regex = /(?:https?:\/\/)?(?:www\.)?([^\/\s\.]+)\./;
    const result = regex.exec(url);

    if (result) {
      const domain = result[1].toLowerCase();
      this.selectedStore = domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    // Check if the selected store is in the supported stores list
    if (this.supportedStores.includes(this.selectedStore)) {
      this.extractedStoreMessage = `${this.selectedStore} found!`;
      this.isStoreValid = true; // Valid store found
    } else {
      this.extractedStoreMessage = `${this.selectedStore} not Supported`;
      this.isStoreValid = false; // Invalid store
    }
  }

  private addNewProductUsingService(storeService: any): void {
    if(this.newProductId != ''){
      storeService.addNewProduct(this.newProductId, this.products).subscribe({
        next: (newProduct:Product) => {
          this.products.push(newProduct);
          this.newProductId = '';
          this.productUrl = '';
          this.extractedStoreMessage = '';
          this.errorMessage = '';
          this.updateProductDetails();
        },
        error: (err:HttpErrorResponse) => {
          console.error('Error adding product:', err);
          this.errorMessage = err.message || 'Failed to add new product.';
        },
      });
    }else{
      this.errorMessage = 'Product ID not found.';
    }
  }
  // Update details for all products
  updateProductDetails(): void {
    this.products.forEach((product) => {
      if(product.store == 'Takealot'){
        this.updateSingleProductDetails(product, this.TakealotProductService);
      }
    });
  }

  // Update details for a single product and add price history if necessary
  updateSingleProductDetails(product: Product, productService: any): void {
    productService.getProductById(product.id).subscribe({
      next: (updatedProduct: Product) => {
        const today = new Date().toISOString().split('T')[0]; // Extract date only

        // Update product details from API response
        product.baseId = updatedProduct.baseId;
        product.title = updatedProduct.title;
        product.image = updatedProduct.image;
        product.url = updatedProduct.url;
        product.store = updatedProduct.store;
        product.price = updatedProduct.price;
        product.salePercentage = updatedProduct.salePercentage;

        // Check if the latest entry in priceHistory is for today's date
        const lastHistory = product.priceHistory[product.priceHistory.length - 1];
        if (!lastHistory || lastHistory.date !== today) {
          // Add to price history only if the last entry date is different from today
          const newHistory: PriceHistory = {
            price: updatedProduct.price,
            salePercentage: updatedProduct.salePercentage,
            date: today,
          };
          product.priceHistory.push(newHistory);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Failed to fetch data for product ID: ${product.id}`, error);
      },
    });
  }



  // Download updated file
  downloadUpdatedFile(): void {
    const dataStr = JSON.stringify(this.products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'updated-products.json';
    link.click();
  }

  selectAllText(event: MouseEvent): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.select();  // Select all text in the input field
  }
}
