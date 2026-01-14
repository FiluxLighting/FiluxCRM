import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TeleMatelCustomer {
  customer_id: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  vat_number?: string;
  discount?: number;
  sales_amount_last_year?: number;
  last_invoice_date?: string;
}

async function getTeleMatelToken(): Promise<string> {
  const API_URL = 'http://fitenergy.erpcloud.telematel.com:8810';
  const USERNAME = 'distri';
  const PASSWORD = 'GOtmt%';
  
  console.log('[TeleMatel] Authenticating with:', API_URL);
  
  const response = await fetch(`${API_URL}/apitmt-security/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }),
  });

  console.log('[TeleMatel] Auth response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[TeleMatel] Auth failed:', errorText);
    throw new Error(`Failed to authenticate: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[TeleMatel] Auth response keys:', Object.keys(data));
  
  const token = data.token || data.access_token || data.bearer_token;
  
  if (!token) {
    console.error('[TeleMatel] No token in response:', data);
    throw new Error('No token received from authentication');
  }
  
  return token;
}

async function getCustomers(token: string): Promise<TeleMatelCustomer[]> {
  const API_URL = 'http://fitenergy.erpcloud.telematel.com:8810';
  
  console.log('[TeleMatel] Fetching customers with token:', token.substring(0, 20) + '...');
  
  const response = await fetch(`${API_URL}/apitmt-customers/List`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('[TeleMatel] Customers response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[TeleMatel] Customers fetch failed:', errorText);
    throw new Error(`Failed to fetch customers: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[TeleMatel] Response structure:', Object.keys(data));
  console.log('[TeleMatel] Customer count:', data.data?.length || data.customers?.length || 0);
  
  return data.data || data.customers || [];
}

export async function GET(request: NextRequest) {
  try {
    console.log('[TeleMatel API] Starting customer fetch...');
    console.log('[TeleMatel API] Getting authentication token...');
    const token = await getTeleMatelToken();
    console.log('[TeleMatel API] Token obtained successfully');

    console.log('[TeleMatel API] Fetching customers...');
    const customers = await getCustomers(token);
    console.log('[TeleMatel API] Retrieved', customers.length, 'customers');

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers: customers,
    });
  } catch (error: any) {
    console.error('[TeleMatel API] Error:', error);
    console.error('[TeleMatel API] Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
