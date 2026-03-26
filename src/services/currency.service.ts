// Currency Service
import api from './api';

interface Currency {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
}

class CurrencyService {
  private currencies: Currency[] = [];
  private currentCurrency: string = 'INR'; // Default to INR

  // Load currencies from backend
  async loadCurrencies(): Promise<Currency[]> {
    try {
      const response = await api.get<Currency[]>('/currencies');
      this.currencies = response.data;
      return this.currencies;
    } catch (error) {
      console.error('Error loading currencies:', error);
      // Fallback to hardcoded currencies if backend fails
      return this.getFallbackCurrencies();
    }
  }

  // Get all currencies
  getCurrencies(): Currency[] {
    return this.currencies.length > 0
      ? this.currencies
      : this.getFallbackCurrencies();
  }

  // Get currency by code
  getCurrencyByCode(code: string): Currency | undefined {
    return this.currencies.find(currency => currency.code === code);
  }

  // Get current currency from store or default to INR
  getCurrentCurrency(): string {
    return this.currentCurrency;
  }

  // Set current currency
  setCurrentCurrency(currency: string): void {
    this.currentCurrency = currency;
  }

  // Get currency symbol
  getCurrencySymbol(currency: string = this.getCurrentCurrency()): string {
    const currencyObj = this.getCurrencyByCode(currency);
    return currencyObj ? currencyObj.symbol : currency;
  }

  // Format amount with currency
  formatAmount(
    amount: number,
    currency: string = this.getCurrentCurrency()
  ): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      // Fallback to INR if currency is invalid
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    }
  }

  // Fallback currencies (in case backend is not available)
  private getFallbackCurrencies(): Currency[] {
    return [
      {
        _id: '1',
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '2',
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '3',
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '4',
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '5',
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '6',
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '7',
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '8',
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '9',
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '10',
        code: 'MXN',
        name: 'Mexican Peso',
        symbol: '$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '11',
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '12',
        code: 'HKD',
        name: 'Hong Kong Dollar',
        symbol: 'HK$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '13',
        code: 'SGD',
        name: 'Singapore Dollar',
        symbol: 'S$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '14',
        code: 'SEK',
        name: 'Swedish Krona',
        symbol: 'kr',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '15',
        code: 'NOK',
        name: 'Norwegian Krone',
        symbol: 'kr',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '16',
        code: 'DKK',
        name: 'Danish Krone',
        symbol: 'kr',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '17',
        code: 'PLN',
        name: 'Polish Zloty',
        symbol: 'zł',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '18',
        code: 'CZK',
        name: 'Czech Koruna',
        symbol: 'Kč',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '19',
        code: 'HUF',
        name: 'Hungarian Forint',
        symbol: 'Ft',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '20',
        code: 'ILS',
        name: 'Israeli Shekel',
        symbol: '₪',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '21',
        code: 'KRW',
        name: 'South Korean Won',
        symbol: '₩',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '22',
        code: 'TRY',
        name: 'Turkish Lira',
        symbol: '₺',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '23',
        code: 'RUB',
        name: 'Russian Ruble',
        symbol: '₽',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '24',
        code: 'ZAR',
        name: 'South African Rand',
        symbol: 'R',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '25',
        code: 'AED',
        name: 'UAE Dirham',
        symbol: 'د.إ',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '26',
        code: 'SAR',
        name: 'Saudi Riyal',
        symbol: '﷼',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '27',
        code: 'MYR',
        name: 'Malaysian Ringgit',
        symbol: 'RM',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '28',
        code: 'THB',
        name: 'Thai Baht',
        symbol: '฿',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '29',
        code: 'IDR',
        name: 'Indonesian Rupiah',
        symbol: 'Rp',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '30',
        code: 'PHP',
        name: 'Philippine Peso',
        symbol: '₱',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '31',
        code: 'PKR',
        name: 'Pakistani Rupee',
        symbol: '₨',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '32',
        code: 'BDT',
        name: 'Bangladeshi Taka',
        symbol: '৳',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '33',
        code: 'VND',
        name: 'Vietnamese Dong',
        symbol: '₫',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '34',
        code: 'EGP',
        name: 'Egyptian Pound',
        symbol: 'E£',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '35',
        code: 'ARS',
        name: 'Argentine Peso',
        symbol: '$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '36',
        code: 'CLP',
        name: 'Chilean Peso',
        symbol: '$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '37',
        code: 'COP',
        name: 'Colombian Peso',
        symbol: '$',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '38',
        code: 'PEN',
        name: 'Peruvian Sol',
        symbol: 'S/',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '39',
        code: 'UYU',
        name: 'Uruguayan Peso',
        symbol: '$U',
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '40',
        code: 'CRC',
        name: 'Costa Rican Colón',
        symbol: '₡',
        createdAt: '',
        updatedAt: '',
      },
    ];
  }
}

export const currencyService = new CurrencyService();
export default currencyService;
