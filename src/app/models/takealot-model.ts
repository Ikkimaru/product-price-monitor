export interface TakealotModel {
  core: {
    id: number;
  };
  title: string;
  gallery: {
    images: string[];
  };
  buybox: {
    items: [{
      price: number;
      listing_price: number;
    }];
  };
  seo:{
    canonical:string;
  };
}
