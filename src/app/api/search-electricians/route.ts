import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface ElectricianResult {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const province = searchParams.get('province');

  if (!city || !province) {
    return NextResponse.json(
      { error: 'Missing city or province parameter' },
      { status: 400 }
    );
  }

  try {
    // Opción 1: Google Places API (requiere API key)
    const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    
    if (GOOGLE_API_KEY) {
      const query = `electricistas ${city} ${province}`;
      const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(placesUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        const results: ElectricianResult[] = [];

        for (const place of data.results.slice(0, 10)) {
          // Obtener detalles adicionales (teléfono, website, etc.)
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website&key=${GOOGLE_API_KEY}`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          if (detailsData.status === 'OK') {
            const details = detailsData.result;
            
            // Extraer email del website si es posible (esto es una aproximación)
            const emailGuess = details.website 
              ? `info@${new URL(details.website).hostname.replace('www.', '')}`
              : '';

            results.push({
              companyName: details.name || place.name,
              contactPerson: '—',
              phone: details.formatted_phone_number || '',
              email: emailGuess,
              address: details.formatted_address || place.formatted_address,
              website: details.website || '',
            });
          }
        }

        return NextResponse.json({ results });
      }
    }

    // Opción 2: Bing Search API (alternativa)
    const BING_API_KEY = process.env.BING_SEARCH_API_KEY;
    
    if (BING_API_KEY) {
      const query = `electricistas en ${city} ${province} teléfono`;
      const bingUrl = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10`;
      
      const response = await fetch(bingUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': BING_API_KEY,
        },
      });
      
      const data = await response.json();
      
      // Procesar resultados de Bing
      const results: ElectricianResult[] = data.webPages?.value?.map((result: any) => ({
        companyName: result.name,
        contactPerson: '—',
        phone: extractPhone(result.snippet) || '',
        email: extractEmail(result.snippet) || '',
        address: `${city}, ${province}`,
        website: result.url,
      })) || [];

      return NextResponse.json({ results });
    }

    // Si no hay API configurada, retornar error informativo
    return NextResponse.json(
      { 
        error: 'No search API configured',
        message: 'Please configure GOOGLE_PLACES_API_KEY or BING_SEARCH_API_KEY in your environment variables'
      },
      { status: 503 }
    );

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}

// Utilidades para extraer información
function extractPhone(text: string): string | null {
  const phoneRegex = /(\+34\s?)?[6-9]\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g;
  const match = text.match(phoneRegex);
  return match ? match[0].replace(/\s/g, '') : null;
}

function extractEmail(text: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}
