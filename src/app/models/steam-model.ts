export interface SteamModel {
  [key: string]: {
    data: {
      name: string;
      steam_appid: string;
      capsule_image: string;
      price_overview: {
        currency:string;
        final: number;
        discount_percent: number;
      };
    };
  };
}
