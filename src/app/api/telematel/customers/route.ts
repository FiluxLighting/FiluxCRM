import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
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

  if (!response.ok) {
    throw new Error('Failed to authenticate with TeleMatel API');
  }

  const data = await response.json();
  return data.token || data.access_token;
}

async function getCustomers(token: string): Promise<TeleMatelCustomer[]> {
  const API_URL = 'http://fitenergy.erpcloud.telematel.com:8810';
  
  const response = await fetch(`${API_URL}/apitmt-customers/List`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers from TeleMatel API');
  }

  const data = await response.json();
  return data.data || data.customers || [];
}

export async function GET(request: NextRequest) {
  try {
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
    console.error('[TeleMatel API] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
