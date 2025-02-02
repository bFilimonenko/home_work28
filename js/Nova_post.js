class NovaPostService {
  #NOVA_POST_API_KEY = NOVA_POST_API_KEY;
  currentCities = [];
  currentWarehouses = [];

  constructor() {
  }

  async getRegions() {
    try {
      const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        body: JSON.stringify({
          apiKey: this.#NOVA_POST_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getSettlementAreas",
          methodProperties: {
            Ref: ""
          }
        })
      });

      const parsedResponse = await response.json();
      return parsedResponse.data.map((region) => ({ id: region.Ref, label: region["Description"] }));
    } catch (err) {
      console.log(err);
    }
  }

  async getCitiesByRegion(regionId, callback) {
    try {
      const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        body: JSON.stringify({
          apiKey: this.#NOVA_POST_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getSettlements",
          methodProperties: {
            AreaRef: regionId,
            Page: "1",
            Warehouse: "1",
            Limit: "150"
          }
        })
      });

      const parsedResponse = await response.json();
      this.currentCities = parsedResponse.data.map((city) => ({ id: city.Ref, label: city["Description"] }));

      if (callback) {
        callback(this.currentCities);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getWarehouseByCity(cityId, callback) {
    try {
      const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        body: JSON.stringify({
          apiKey: this.#NOVA_POST_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getWarehouses",
          methodProperties: {
            SettlementRef: cityId,
            Page: "1",
            Limit: "150",
            Language: "UA"
          }
        })
      });

      const parsedResponse = await response.json();
      this.currentWarehouses = parsedResponse.data.map((warehouse) => ({
        id: warehouse.Ref,
        label: warehouse["Description"]
      }));
      if (callback) {
        callback(this.currentWarehouses);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

// .then(r => r.json().then(res => console.log(JSON.stringify(res))));

